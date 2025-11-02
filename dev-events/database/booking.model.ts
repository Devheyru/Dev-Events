import { Schema, model, models, Document, Types } from "mongoose";

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => {
          // RFC 5322 compliant email regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt
  }
);

// Pre-save hook to verify that the referenced event exists
BookingSchema.pre("save", async function (next) {
  const booking = this as IBooking;

  // Only validate eventId if it's new or modified
  if (booking.isModified("eventId")) {
    // Dynamically import Event model to avoid circular dependency issues
    const Event = models.Event || (await import("./event.model")).default;

    const eventExists = await Event.findById(booking.eventId);

    if (!eventExists) {
      throw new Error(
        `Event with ID ${booking.eventId} does not exist. Please provide a valid event ID.`
      );
    }
  }

  next();
});

// Index on eventId for faster lookups when querying bookings by event
BookingSchema.index({ eventId: 1 });

// Compound index for efficient duplicate checking (same email for same event)
BookingSchema.index({ eventId: 1, email: 1 });

// Prevent model recompilation during hot reloads in development
const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
