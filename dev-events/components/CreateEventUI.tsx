"use client";
import React, { ChangeEvent, FormEvent } from "react";
import { EventForm } from "../app/create-event/types";
import Image from "next/image";

type Props = {
  form: EventForm;
  fieldErrors: Record<string, string>;
  previewUrl: string | null;
  uploadProgress: number;
  isUploading: boolean;
  isSubmitting: boolean;
  message: string | null;
  error: string | null;
  toastVisible: boolean;
  setToastVisible: (v: boolean) => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  removePreview: () => void;
  handleSubmit: (e: FormEvent) => void;
};

export default function CreateEventUI(props: Props) {
  return (
    <main className="flex-1 max-w-200 p-4 border-l border-gray-700">
      <h1 className="text-3xl font-semibold mb-4">Create Event</h1>

      <form
        onSubmit={props.handleSubmit}
        encType="multipart/form-data"
        className="space-y-4 bg-dark-100 border-dark-200 card-shadow flex w-full flex-col gap-6 rounded-[10px] border px-5 py-6"
      >
        <div>
          <label className="block text-md font-medium">Title</label>
          <input
            name="title"
            type="text"
            placeholder="Enter The Events Title"
            value={props.form.title}
            onChange={props.handleChange}
            className={`create-event-inputs ${
              props.fieldErrors.title ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {props.fieldErrors.title && (
            <p className="text-red-500 text-md mt-1">
              {props.fieldErrors.title}
            </p>
          )}
        </div>

        <div>
          <label className="block text-md font-medium">Description</label>
          <textarea
            required
            placeholder="Enter Detailed Event Description"
            name="description"
            value={props.form.description}
            onChange={props.handleChange}
            className={`create-event-inputs mt-1 block h-24 ${
              props.fieldErrors.description
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {props.fieldErrors.description && (
            <p className="text-red-500 text-md mt-1">
              {props.fieldErrors.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-md font-medium">Overview</label>
          <textarea
            required
            name="overview"
            placeholder="Enter Brief Event Overview"
            value={props.form.overview}
            onChange={props.handleChange}
            className={`mt-1 create-event-inputs h-24 ${
              props.fieldErrors.overview ? "border-red-500" : "border-gray-300"
            }`}
          />
          {props.fieldErrors.overview && (
            <p className="text-red-500 text-md mt-1">
              {props.fieldErrors.overview}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-md font-medium">Venue</label>
            <input
              required
              name="venue"
              type="text"
              placeholder="Enter Event Venue"
              value={props.form.venue}
              onChange={props.handleChange}
              className={`mt-1 create-event-inputs ${
                props.fieldErrors.venue ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <label className="block text-md font-medium">Location</label>
            <input
              required
              name="location"
              type="text"
              placeholder="Enter Event Location"
              value={props.form.location}
              onChange={props.handleChange}
              className={`mt-1 create-event-inputs ${
                props.fieldErrors.location
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-md font-medium">Date</label>
            <input
              required
              type="date"
              name="date"
              value={props.form.date}
              onChange={props.handleChange}
              className={`mt-1 create-event-inputs ${
                props.fieldErrors.date ? "border-red-500" : "border-gray-300"
              }`}
            />
            {props.fieldErrors.date && (
              <p className="text-red-500 text-md mt-1">
                {props.fieldErrors.date}
              </p>
            )}
          </div>
          <div>
            <label className="block text-md font-medium">Time</label>
            <input
              required
              name="time"
              value={props.form.time}
              onChange={props.handleChange}
              placeholder="09:00 AM"
              className={`mt-1 create-event-inputs ${
                props.fieldErrors.time ? "border-red-500" : "border-gray-300"
              }`}
            />
            {props.fieldErrors.time && (
              <p className="text-red-500 text-md mt-1">
                {props.fieldErrors.time}
              </p>
            )}
          </div>
          <div>
            <label className="block text-md font-medium">Mode</label>
            <select
              name="mode"
              value={props.form.mode}
              onChange={props.handleChange}
              className="mt-1 create-event-inputs"
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-md font-medium">Audience</label>
            <input
              required
              name="audience"
              type="text"
              placeholder="Event Audience"
              value={props.form.audience}
              onChange={props.handleChange}
              className="mt-1 create-event-inputs"
            />
          </div>
          <div>
            <label className="block text-md font-medium">Organizer</label>
            <input
              required
              name="organizer"
              type="text"
              placeholder="Event Organizer"
              value={props.form.organizer}
              onChange={props.handleChange}
              className="mt-1 create-event-inputs"
            />
          </div>
        </div>

        <div>
          <label className="block text-md font-medium">
            Tags (comma separated)
          </label>
          <input
            required
            name="tags"
            type="text"
            value={props.form.tags}
            onChange={props.handleChange}
            placeholder="react, web, javascript"
            className={`mt-1 create-event-inputs ${
              props.fieldErrors.tags ? "border-red-500" : "border-gray-300"
            }`}
          />
          {props.fieldErrors.tags && (
            <p className="text-red-500 text-md mt-1">
              {props.fieldErrors.tags}
            </p>
          )}
        </div>

        <div>
          <label className="block text-md font-medium">
            Agenda (one item per line)
          </label>
          <textarea
            required
            name="agenda"
            value={props.form.agenda}
            onChange={props.handleChange}
            placeholder="Opening keynote\nWorkshop: ABC"
            className={`mt-1 create-event-inputs h-28 ${
              props.fieldErrors.agenda ? "border-red-500" : "border-gray-300"
            }`}
          />
          {props.fieldErrors.agenda && (
            <p className="text-red-500 text-md mt-1">
              {props.fieldErrors.agenda}
            </p>
          )}
        </div>

        <div>
          <label className="block text-md font-medium">Image</label>
          <input
            required
            type="file"
            accept="image/*"
            name="image"
            onChange={props.handleFileChange}
            className={`mt-1 create-event-inputs w-64 cursor-pointer ${
              props.fieldErrors.image ? "border-red-500" : ""
            }`}
          />
          {props.fieldErrors.image && (
            <p className="text-red-500 text-md mt-1">
              {props.fieldErrors.image}
            </p>
          )}

          {props.previewUrl && (
            <div className="mt-3 flex  items-start gap-3">
              <img
                src={props.previewUrl}
                alt="preview"
                className="w-32 h-20 object-cover rounded border"
              />
              <div className="flex-1">
                <p className="text-md">Selected image preview</p>
                <button
                  type="button"
                  className="text-md text-white bg-red-600 border rounded-md mt-2 p-2 cursor-pointer"
                  onClick={props.removePreview}
                >
                  Remove image
                </button>
              </div>
            </div>
          )}

          {props.isUploading && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3"
                  style={{ width: `${props.uploadProgress}%` }}
                />
              </div>
              <p className="text-md mt-1">Uploading: {props.uploadProgress}%</p>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={props.isSubmitting || props.isUploading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            aria-busy={props.isSubmitting || props.isUploading}
          >
            {props.isSubmitting || props.isUploading
              ? "Creating..."
              : "Create Event"}
          </button>
        </div>
      </form>

      {props.error && <p className="text-red-600 mt-4">{props.error}</p>}

      {/* Success toast (dismissible, auto-close) */}
      {props.toastVisible && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-600 text-white px-4 py-2 rounded shadow flex items-center gap-3">
            <div className="text-md">{props.message || "Event created"}</div>
            <button
              type="button"
              onClick={() => props.setToastVisible(false)}
              className="text-md opacity-90 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
