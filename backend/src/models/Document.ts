import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "users", index: true, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    category: { type: String, required: true },
    product: { type: String, required: true },
    uploadedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

export type DocumentRecord = mongoose.InferSchemaType<typeof documentSchema> & { _id: mongoose.Types.ObjectId };
export const DocumentModel = mongoose.model("documents", documentSchema);


