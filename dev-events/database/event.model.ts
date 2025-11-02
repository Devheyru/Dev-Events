import { Schema, model, models, Document } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: ["online", "offline", "hybrid"],
      lowercase: true,
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one tag is required",
      },
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt
  }
);

// Pre-save hook for slug generation and date/time normalization
EventSchema.pre("save", async function (next) {
  const event = this as IEvent;

  // Generate slug only if title is new or modified
  if (event.isModified("title")) {
    event.slug = event.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    // Ensure slug uniqueness by appending timestamp if needed
    const existingEvent = await models.Event?.findOne({
      slug: event.slug,
      _id: { $ne: event._id },
    });

    if (existingEvent) {
      event.slug = `${event.slug}-${Date.now()}`;
    }
  }

  // Normalize date to ISO format if modified (YYYY-MM-DD)
  if (event.isModified("date")) {
    const dateObj = new Date(event.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date format. Please provide a valid date.");
    }
    // Store as ISO date string (YYYY-MM-DD)
    event.date = dateObj.toISOString().split("T")[0];
  }

  // Normalize time format if modified (HH:MM)
  if (event.isModified("time")) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(event.time)) {
      throw new Error(
        "Invalid time format. Please use HH:MM format (e.g., 14:30)."
      );
    }
  }

  next();
});

// Create unique index on slug for faster queries and uniqueness enforcement
EventSchema.index({ slug: 1 }, { unique: true });

// Prevent model recompilation during hot reloads in development
const Event = models.Event || model<IEvent>("Event", EventSchema);

export default Event;
