import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    // Kind of document: uploaded file vs rich text
    kind: { type: String, enum: ["file", "text"], default: "file", index: true },
    // File-specific fields (required only for kind === "file")
    filename: { type: String, required: function(this: any) { return this.kind === "file"; } },
    originalName: { type: String, required: function(this: any) { return this.kind === "file"; } },
    size: { type: Number, required: function(this: any) { return this.kind === "file"; } },
    type: { type: String, required: function(this: any) { return this.kind === "file"; } },
    // Common fields
    name: { type: String, required: true },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    uploadedBy: { type: String, required: true },
    uploadedAt: { type: Date, required: true, default: () => new Date() },
    // Text-document fields
    content: { type: String, default: "" },
    templateId: { type: String, default: null },
  },
  { timestamps: true }
);

export type DocumentRecord = mongoose.InferSchemaType<typeof documentSchema> & { _id: mongoose.Types.ObjectId };
export const DocumentModel = mongoose.model("documents", documentSchema);


