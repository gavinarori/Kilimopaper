import mongoose from "mongoose";

const FolderSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  ownerId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

FolderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const FolderModel = mongoose.model("Folder", FolderSchema);
