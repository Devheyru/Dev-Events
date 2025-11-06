"use client";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreateEventUI from "../../components/CreateEventUI";
import { EventForm } from "./types";

export default function CreateEvent() {
  const [form, setForm] = useState<EventForm>({
    title: "",
    description: "",
    overview: "",
    venue: "",
    location: "",
    date: "",
    time: "",
    mode: "offline",
    audience: "",
    organizer: "",
    tags: "",
    agenda: "",
    image: null,
  });

  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const router = useRouter();

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    setForm((s) => ({ ...s, image: file ?? null }));

    // create preview and validate immediately
    if (file) {
      // basic validation
      const errors: Record<string, string> = { ...fieldErrors };
      if (!file.type.startsWith("image/")) {
        errors.image = "Selected file is not an image.";
      } else if (file.size > 5 * 1024 * 1024) {
        errors.image = "Image must be smaller than 5MB.";
      } else {
        delete errors.image;
      }
      setFieldErrors(errors);

      try {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } catch {
        setPreviewUrl(null);
      }
    } else {
      // removed file
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }
  // Cleanup preview object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Basic client validation (field-level)
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required.";
    if (!form.description.trim())
      errors.description = "Description is required.";
    if (!form.overview.trim()) errors.overview = "Overview is required.";
    if (!form.image) errors.image = "Please upload an image.";

    // Tags and agenda arrays
    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagsArray.length === 0) errors.tags = "At least one tag is required.";

    const agendaArray = form.agenda
      .split(/\r?\n/)
      .map((a) => a.trim())
      .filter(Boolean);
    if (agendaArray.length === 0)
      errors.agenda = "Agenda must contain at least one item.";

    // Validate date & time
    if (form.date && isNaN(new Date(form.date).getTime()))
      errors.date = "Invalid date.";
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](?:\s?(AM|PM))?$/i;
    if (form.time && !timeRegex.test(form.time))
      errors.time = "Time must be in HH:MM or HH:MM AM/PM format.";

    if (form.image) {
      const file = form.image as File;
      if (file.size > 5 * 1024 * 1024)
        errors.image = "Image must be smaller than 5MB.";
      if (!file.type.startsWith("image/"))
        errors.image = "Invalid image file type.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields.");
      return;
    }
    setFieldErrors({});

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("overview", form.overview);
      fd.append("venue", form.venue);
      fd.append("location", form.location);
      fd.append("date", form.date);
      fd.append("time", form.time);
      fd.append("mode", form.mode);
      fd.append("audience", form.audience);
      fd.append("organizer", form.organizer);

      // Tags & Agenda
      fd.append("tags", JSON.stringify(tagsArray));
      fd.append("agenda", JSON.stringify(agendaArray));

      if (form.image) fd.append("image", form.image);

      // Use XMLHttpRequest to get upload progress and robust error handling
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/events");
        xhr.timeout = 2 * 60 * 1000; // 2 minutes

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const percent = Math.round((ev.loaded / ev.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          try {
            const contentType = xhr.getResponseHeader("Content-Type") || "";
            const isJson = contentType.includes("application/json");
            const response = isJson
              ? JSON.parse(xhr.responseText)
              : { message: xhr.responseText };

            // Successful creation
            if (xhr.status >= 200 && xhr.status < 300) {
              setMessage("Event created successfully.");
              setToastVisible(true);
              // Auto-hide toast after 3s
              setTimeout(() => setToastVisible(false), 3000);
              const createdSlug = response?.event?.slug as string | undefined;
              if (createdSlug) {
                setTimeout(() => router.push(`/events/${createdSlug}`), 600);
                resolve();
                return;
              }

              // reset form if no slug
              setForm({
                title: "",
                description: "",
                overview: "",
                venue: "",
                location: "",
                date: "",
                time: "",
                mode: "offline",
                audience: "",
                organizer: "",
                tags: "",
                agenda: "",
                image: null,
              });
              resolve();
              return;
            }

            // Non-2xx: surface validation details to UI if present
            const msg =
              response?.message || `Upload failed with status ${xhr.status}`;
            if (response?.details && typeof response.details === "object") {
              setFieldErrors(response.details);
            }
            setError(msg);
            reject(new Error(msg));
          } catch (err) {
            // parsing or other error
            reject(err);
          }
        };

        xhr.onerror = () =>
          reject(new Error("Network error while uploading the event."));
        xhr.ontimeout = () =>
          reject(
            new Error(
              "Upload timed out. Try a smaller image or a faster connection."
            )
          );
        xhr.onabort = () => reject(new Error("Upload aborted."));

        setIsUploading(true);
        xhr.send(fd);
      });

      setUploadProgress(0);
      setIsUploading(false);
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      setError((err as Error).message || "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CreateEventUI
      form={form}
      fieldErrors={fieldErrors}
      previewUrl={previewUrl}
      uploadProgress={uploadProgress}
      isUploading={isUploading}
      isSubmitting={isSubmitting}
      message={message}
      error={error}
      toastVisible={toastVisible}
      setToastVisible={setToastVisible}
      handleChange={handleChange}
      handleFileChange={handleFileChange}
      removePreview={() => {
        setForm((s) => ({ ...s, image: null }));
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }}
      handleSubmit={handleSubmit}
    />
  );
}
