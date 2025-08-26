import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { DocumentModel } from "../models/Document";

const router = Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.get("/", async (req, res) => {
  const userId = (req as any).userId as string;
  const list = await DocumentModel.find({ ownerId: userId }).sort({ createdAt: -1 }).lean();
  res.json(list);
});

router.post("/", upload.single("file"), async (req, res) => {
  const userId = (req as any).userId as string;
  if (!req.file) return res.status(400).json({ error: "Missing file" });
  const metaSchema = z.object({ category: z.string(), product: z.string() });
  const parse = metaSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  const created = await DocumentModel.create({
    ownerId: userId,
    filename: req.file.filename,
    originalName: req.file.originalname,
    category: parse.data.category,
    product: parse.data.product,
    uploadedAt: new Date(),
  });
  res.status(201).json(created);
});

router.delete("/:id", async (req, res) => {
  const userId = (req as any).userId as string;
  const doc = await DocumentModel.findOne({ _id: req.params.id, ownerId: userId });
  if (!doc) return res.status(404).json({ error: "Not found" });
  try { fs.unlinkSync(path.join(uploadsDir, doc.filename)); } catch {}
  await DocumentModel.deleteOne({ _id: doc._id });
  res.json({ ok: true });
});

// Download
router.get("/:id/download", async (req, res) => {
  const userId = (req as any).userId as string;
  const doc = await DocumentModel.findOne({ _id: req.params.id, ownerId: userId });
  if (!doc) return res.status(404).json({ error: "Not found" });
  const filePath = path.join(uploadsDir, doc.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File missing" });
  res.download(filePath, doc.originalName);
});

// Share links (signed token)
type ShareTokenPayload = { docId: string; type: "share" };
router.post("/:id/share", async (req, res) => {
  const userId = (req as any).userId as string;
  const doc = await DocumentModel.findOne({ _id: req.params.id, ownerId: userId }).lean();
  if (!doc) return res.status(404).json({ error: "Not found" });
  const token = jwt.sign({ docId: String(doc._id), type: "share" } as ShareTokenPayload, process.env.JWT_SECRET || "dev-secret", { expiresIn: "14d" });
  res.json({ token, url: `${req.protocol}://${req.get("host")}/api/share/${doc._id}?token=${token}` });
});

export default router;


