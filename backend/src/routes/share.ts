import { Router } from "express";
import jwt from "jsonwebtoken";
import path from "node:path";
import fs from "node:fs";
import { DocumentModel } from "../models/Document";

const router = Router();

type ShareTokenPayload = { docId: string; type: "share" };

router.get("/:id", async (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as ShareTokenPayload;
    if (payload.type !== "share" || payload.docId !== req.params.id) return res.status(401).json({ error: "Invalid token" });
    const doc = await DocumentModel.findById(payload.docId).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    const filePath = path.join(process.cwd(), "uploads", doc.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File missing" });
    res.download(filePath, doc.originalName);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;


