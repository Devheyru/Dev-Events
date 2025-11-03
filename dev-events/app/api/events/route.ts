import { v2 as cloudinary } from "cloudinary";
import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { error } from "console";
import { create } from "domain";

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "dev-events" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create(event);
    return NextResponse.json(
      {
        message: "Event created successfully",
        event: createdEvent,
      },
      { status: 201 }
    );
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
