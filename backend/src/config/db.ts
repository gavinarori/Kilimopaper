import mongoose from "mongoose";

export async function connectToDatabase(uri: string): Promise<void> {
  if (!uri) throw new Error("Missing MongoDB URI");
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB || undefined });
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error", err);
  });
}


