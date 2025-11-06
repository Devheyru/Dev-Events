"use server";

import { Event } from "@/database";
import type { IEvent } from "@/database";
import connectDB from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectDB();
    const event = await Event.findOne({ slug });
    if (!event) {
      return [];
    }
    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();
  } catch (e) {
    console.error("Error fetching similar events:", e);
    return [];
  }
};

// Fetch all events (server-side) to avoid making HTTP requests to our own API during build
export const getAllEvents = async (): Promise<IEvent[]> => {
  try {
    await connectDB();
    // return plain JS objects for serialization
    const docs = await Event.find().sort({ createdAt: -1 }).lean();
    // Cast to IEvent[] since .lean() returns plain objects; this keeps the page types compatible
    return docs as unknown as IEvent[];
  } catch (e) {
    console.error("Error fetching all events:", e);
    return [];
  }
};
