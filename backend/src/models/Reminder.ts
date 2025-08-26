import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "users", index: true, required: true },
    title: { type: String, required: true },
    dueDateIso: { type: String, required: true },
    channel: { type: String, enum: ["email", "sms"], required: true },
  },
  { timestamps: true }
);

export type ReminderRecord = mongoose.InferSchemaType<typeof reminderSchema> & { _id: mongoose.Types.ObjectId };
export const ReminderModel = mongoose.model("reminders", reminderSchema);


