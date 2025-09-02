import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    uploadedBy: { type: String, required: true },
    uploadedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

export type DocumentRecord = mongoose.InferSchemaType<typeof documentSchema> & { _id: mongoose.Types.ObjectId };
export const DocumentModel = mongoose.model("documents", documentSchema);


