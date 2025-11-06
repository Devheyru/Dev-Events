"use server";
import { Booking } from "@/database";

import connectDB from "../mongodb";
import { error } from "console";

export const creatBooking = async ({
  eventId,
  slug,
  email,
}: {
  eventId: string;
  slug: string;
  email: string;
}) => {
  try {
    await connectDB();

    await Booking.create({
      eventId,
      slug,
      email,
    });

    return { success: true };
  } catch (e) {
    console.error("Error creating booking:", e);
    return { success: false };
  }
};

export const getBookingCount = async (eventId: string) => {
  try {
    await connectDB();
    const count = await Booking.countDocuments({ eventId });
    return count;
  } catch (e) {
    console.error("Error getting booking count:", e);
    return 0;
  }
};
