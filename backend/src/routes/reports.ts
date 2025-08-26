import { Router } from "express";
import { z } from "zod";
import { DocumentModel } from "../models/Document";

const router = Router();

router.post("/export", async (req, res) => {
  const userId = (req as any).userId as string;
  const schema = z.object({ from: z.string().optional(), to: z.string().optional(), product: z.string().optional() });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  const { from, to, product } = parse.data;
  const fromMs = from ? new Date(from).getTime() : 0;
  const toMs = to ? new Date(to).getTime() : Date.now();
  const docs = await DocumentModel.find({ ownerId: userId }).lean();
  const rows = docs
    .filter((d) => (product ? d.product === product : true))
    .filter((d) => {
      const t = new Date(d.uploadedAt).getTime();
      return t >= fromMs && t <= toMs;
    })
    .map((d) => ({ id: String(d._id), product: d.product, category: d.category, original: d.originalName, uploadedAt: new Date(d.uploadedAt).toISOString() }));
  const header = ["id", "product", "category", "original", "uploadedAt"].join(",");
  const csv = [header, ...rows.map((r) => [r.id, r.product, r.category, r.original.replace(/,/g, " "), r.uploadedAt].join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=export-report.csv");
  res.send(csv);
});

export default router;


