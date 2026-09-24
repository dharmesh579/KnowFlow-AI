import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const url = process.env.MONGO_URI;
  if (!url) {
    throw new Error("MONGO_URI is not set in .env");
  }
  await mongoose.connect(url);

  console.log("MongoDB connected");
}
