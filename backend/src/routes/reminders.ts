import { Router } from "express";
import { z } from "zod";
import { ReminderModel } from "../models/Reminder";

const router = Router();

router.get("/", async (req, res) => {
  const userId = (req as any).userId as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  
  let queryBuilder = ReminderModel.find({ ownerId: userId }).sort({ createdAt: -1 });
  if (limit) {
    queryBuilder = queryBuilder.limit(limit);
  }
  
  const list = await queryBuilder.lean();
  res.json(list);
});

router.post("/", async (req, res) => {
  const userId = (req as any).userId as string;
  const schema = z.object({ title: z.string().min(1), dueDateIso: z.string(), channel: z.enum(["email", "sms"]) });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  const created = await ReminderModel.create({ ownerId: userId, ...parse.data });
  res.status(201).json(created);
});

router.put("/:id", async (req, res) => {
  const userId = (req as any).userId as string;
  const reminderId = req.params.id;
  const schema = z.object({ title: z.string().min(1), dueDateIso: z.string(), channel: z.enum(["email", "sms"]) });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  
  const reminder = await ReminderModel.findOneAndUpdate(
    { _id: reminderId, ownerId: userId },
    parse.data,
    { new: true }
  );
  
  if (!reminder) return res.status(404).json({ error: "Reminder not found" });
  res.json(reminder);
});

router.delete("/:id", async (req, res) => {
  const userId = (req as any).userId as string;
  const reminderId = req.params.id;
  
  const reminder = await ReminderModel.findOneAndDelete({ _id: reminderId, ownerId: userId });
  
  if (!reminder) return res.status(404).json({ error: "Reminder not found" });
  res.json({ message: "Reminder deleted successfully" });
});

router.get("/due", async (req, res) => {
  const userId = (req as any).userId as string;
  const days = Math.max(1, Math.min(60, Number(req.query.days ?? 7)));
  const now = Date.now();
  const horizon = now + days * 24 * 60 * 60 * 1000;
  const list = await ReminderModel.find({ ownerId: userId }).lean();
  const due = list.filter((r) => new Date(r.dueDateIso).getTime() <= horizon);
  res.json(due);
});

export default router;


