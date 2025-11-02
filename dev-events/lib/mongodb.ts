import mongoose from "mongoose";

// Define the MongoDB connection string type
type ConnectionString = string;

// Ensure MONGODB_URI is defined in environment variables
const MONGODB_URI: ConnectionString = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Define the cached connection type
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global type to include our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Initialize cache: Use existing cache or create a new one
// This prevents multiple connections during hot reloads in development
let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

// Store cache in global scope to persist across hot reloads
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose
 * Caches the connection to reuse across function calls
 * @returns Promise<typeof mongoose> - The Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing connection promise if one is in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering
    };

    // Create new connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for connection to establish and cache it
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise on error so next call attempts reconnection
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
