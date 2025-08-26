import { Router } from "express";
import { z } from "zod";
import { ReminderModel } from "../models/Reminder";

const router = Router();

router.get("/", async (req, res) => {
  const userId = (req as any).userId as string;
  const list = await ReminderModel.find({ ownerId: userId }).sort({ createdAt: -1 }).lean();
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


