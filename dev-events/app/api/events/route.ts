import { v2 as cloudinary } from "cloudinary";
import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// Helper: convert times like "09:00 AM" or "21:30" into 24-hour HH:MM
function parseTimeTo24(time: string): string | null {
  if (!time || typeof time !== "string") return null;
  const t = time.trim();
  // Match HH:MM with optional AM/PM
  const m = t.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?:\s*(AM|PM))?$/i);
  if (!m) return null;
  let hh = parseInt(m[1], 10);
  const mm = m[2];
  const ampm = m[3];
  if (ampm) {
    const isPm = ampm.toUpperCase() === "PM";
    if (isPm && hh < 12) hh += 12;
    if (!isPm && hh === 12) hh = 0;
  }
  return `${hh.toString().padStart(2, "0")}:${mm}`;
}

// Small helper to parse Cloudinary upload stream with timeout
function uploadToCloudinary(buffer: Buffer, opts: object, timeoutMs = 120000) {
  return new Promise<any>((resolve, reject) => {
    const timedOut = setTimeout(() => reject(new Error("Cloudinary upload timed out")), timeoutMs);
    const stream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      clearTimeout(timedOut);
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();
    let event;
    try {
      event = Object.fromEntries(formData.entries());
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid Json data format" },
        { status: 400 }
      );
    }

    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }

    let tags, agenda;
    try {
      const tagsRaw = formData.get("tags");
      const agendaRaw = formData.get("agenda");
      tags = typeof tagsRaw === "string" ? JSON.parse(tagsRaw) : JSON.parse(String(tagsRaw));
      agenda = typeof agendaRaw === "string" ? JSON.parse(agendaRaw) : JSON.parse(String(agendaRaw));
      if (!Array.isArray(tags) || !Array.isArray(agenda)) {
        return NextResponse.json({ message: "Tags and agenda must be JSON arrays" }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid JSON format for tags or agenda" },
        { status: 400 }
      );
    }

    // Basic required fields validation and sanitation
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const overview = String(formData.get("overview") || "").trim();
    const venue = String(formData.get("venue") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const dateRaw = String(formData.get("date") || "").trim();
    const timeRaw = String(formData.get("time") || "").trim();
    const mode = String(formData.get("mode") || "").trim().toLowerCase();
    const audience = String(formData.get("audience") || "").trim();
    const organizer = String(formData.get("organizer") || "").trim();

    if (!title || !description || !overview) {
      return NextResponse.json({ message: "Title, description and overview are required" }, { status: 400 });
    }

    // Validate date
    if (dateRaw && isNaN(new Date(dateRaw).getTime())) {
      return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
    }

    // Normalize time to 24h HH:MM expected by the schema
    const time = parseTimeTo24(timeRaw);
    if (!time) {
      return NextResponse.json({ message: "Invalid time format. Use HH:MM or HH:MM AM/PM." }, { status: 400 });
    }

    if (!["online", "offline", "hybrid"].includes(mode)) {
      return NextResponse.json({ message: "Invalid mode; allowed: online, offline, hybrid" }, { status: 400 });
    }

    // Upload image to Cloudinary (with timeout) and set image URL
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await uploadToCloudinary(buffer, { resource_type: "image", folder: "dev-events" }, 2 * 60 * 1000);
      event = Object.assign({}, event); // ensure plain object
      event.image = (uploadResult as { secure_url?: string }).secure_url || (uploadResult as any)?.url;
    } catch (err) {
      if (process.env.NODE_ENV === "development")
        console.error("Cloudinary upload error:", err);
      return NextResponse.json({ message: "Image upload failed", error: err instanceof Error ? err.message : String(err) }, { status: 502 });
    }

    // Create event document in DB with explicit fields to avoid unexpected types
    try {
      const createdEvent = await Event.create({
        title,
        slug: (event.slug as string) || undefined,
        description,
        overview,
        image: event.image,
        venue,
        location,
        date: dateRaw || undefined,
        time,
        mode,
        audience,
        agenda,
        organizer,
        tags,
      });

      return NextResponse.json(
        {
          message: "Event created successfully",
          event: createdEvent,
        },
        { status: 201 }
      );
    } catch (err) {
      // Handle Mongoose validation errors to return 400 with details
      if (process.env.NODE_ENV === "development")
        console.error("Event create error:", err);
      if (err && typeof (err as any).name === "string" && (err as any).name === "ValidationError") {
        const details: Record<string, string> = {};
        for (const [k, v] of Object.entries((err as any).errors || {})) {
          details[k] = (v as any).message || String(v);
        }
        return NextResponse.json({ message: "Validation failed", details }, { status: 400 });
      }
      return NextResponse.json({ message: "Event creation failed", error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
    
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        message: "Event creation failed",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { message: "Events fetched successfully", events },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        message: "Failed to fetch events",
        error: e,
      },
      { status: 500 }
    );
  }
}
