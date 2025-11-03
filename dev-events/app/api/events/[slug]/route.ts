import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database";

// Define route params type safety
type RouteParams = {
  params: Promise<{ slug: string }>;
};

/**
 * Get /api/events/[slug]
 * fetch a single event by slug
 */

export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await connectDB();
    // awit and extract slug from params
    const { slug } = await params;
    // validate slug parameter
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        {
          message: "Invalid or missing slug parameter",
        },
        { status: 400 }
      );
    }
    // sanitize slug {remove any malicious input}
    const sanitizedSlug = slug.trim().toLowerCase();

    //query event by slug
    const event = await Event.findOne({ slug: sanitizedSlug }).lean();
    // if event not found, return 404
    if (!event) {
      return NextResponse.json(
        {
          message: `Event with slug '${sanitizedSlug}' not found`,
        },
        { status: 404 }
      );
    }
    // Retur successful response with event data
    return NextResponse.json(
      {
        Message: "Event fetched successfully",
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching event by slug:", error);
    }
    // handle specific error types

    if (error instanceof Error) {
      if (error.message.includes("MONGODB_URI")) {
        return NextResponse.json(
          {
            message: "Database configuration error",
          },
          { status: 500 }
        );
      }
      // return generic error with error message
      return NextResponse.json(
        {
          message: "Failed to fetch event",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        message: "An Unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
