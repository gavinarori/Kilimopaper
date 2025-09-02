import mongoose from "mongoose";
import type { ConnectOptions } from "mongoose";

let isConnected = false; // Track connection state

export async function connectToDatabase(uri: string): Promise<typeof mongoose> {
  if (!uri) throw new Error("Missing MongoDB URI");

  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return mongoose;
  }

  try {
    const options: ConnectOptions = {};

    if (process.env.MONGO_DB) {
      options.dbName = process.env.MONGO_DB;
    }

    await mongoose.connect(uri, options);

    isConnected = true;
    console.log("✅ MongoDB connected");

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
      isConnected = false;
    });

    return mongoose;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
}
