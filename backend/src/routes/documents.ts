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
  const folderId = req.query.folderId as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  
  const query: any = { ownerId: userId };
  if (folderId) {
    query.folderId = folderId;
  }
  
  let queryBuilder = DocumentModel.find(query).sort({ createdAt: -1 });
  if (limit) {
    queryBuilder = queryBuilder.limit(limit);
  }
  
  const list = await queryBuilder.lean();
  res.json(list);
});

// Upload endpoint
router.post("/upload", upload.single("file"), async (req, res) => {
  const userId = (req as any).userId as string;
  if (!req.file) return res.status(400).json({ error: "Missing file" });
  
  const folderId = req.body.folderId;
  const providedName = (req.body.name as string | undefined)?.trim();
  
  const created = await DocumentModel.create({
    ownerId: userId,
    kind: "file",
    filename: req.file.filename,
    originalName: req.file.originalname,
    name: providedName && providedName.length > 0 ? providedName : req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype,
    folderId: folderId || null,
    uploadedBy: userId,
    uploadedAt: new Date(),
  });
  res.status(201).json(created);
});

// Create new text document
router.post("/text", async (req, res) => {
  const userId = (req as any).userId as string;
  const { name, content, folderId, templateId } = (req.body as any) || {};
  if (!name || typeof name !== "string") return res.status(400).json({ error: "name is required" });
  const created = await DocumentModel.create({
    ownerId: userId,
    kind: "text",
    name,
    content: typeof content === "string" ? content : "",
    folderId: folderId || null,
    uploadedBy: userId,
    uploadedAt: new Date(),
    templateId: templateId || null,
  });
  res.status(201).json(created);
});

// Fetch a single document (for text docs editing)
router.get("/:id", async (req, res) => {
  const userId = (req as any).userId as string;
  const doc = await DocumentModel.findOne({ _id: req.params.id, ownerId: userId }).lean();
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});

router.put("/:id", async (req, res) => {
  const userId = (req as any).userId as string;
  const docId = req.params.id;
  const schema = z.object({
    name: z.string().min(1).max(255).optional(),
    folderId: z.string().optional(),
    content: z.string().optional(),
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });

  const updated = await DocumentModel.findOneAndUpdate(
    { _id: docId, ownerId: userId },
    { $set: parse.data },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
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


