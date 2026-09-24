import { Schema, model, InferSchemaType } from "mongoose";
import { string } from "zod/v4";

const documentSchema = new Schema(
  {
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    chunkCount: { type: Number, default: 0 },
    status: {
      type: string,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    errorMessage: { type: string },
  },
  { timestamps: true },
);

export type DocumentRecord = InferSchemaType<typeof documentSchema>;

export const DocumentModel = model("Document", documentSchema);
