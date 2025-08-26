import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

import { connectToDatabase } from "./config/db";
import { authMiddleware } from "./middleware/auth";
import authRouter from "./routes/auth";
import documentsRouter from "./routes/documents";
import remindersRouter from "./routes/reminders";
import reportsRouter from "./routes/reports";
import shareRouter from "./routes/share";
import templatesRouter from "./routes/templates";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Routes
app.use("/api/auth", authRouter);
app.use("/api/documents", authMiddleware, documentsRouter);
app.use("/api/reminders", authMiddleware, remindersRouter);
app.use("/api/reports", authMiddleware, reportsRouter);
app.use("/api/templates", authMiddleware, templatesRouter);
app.use("/api/share", shareRouter);

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

async function bootstrap() {
  const mongoUri = process.env.MONGO_URI || "";
  await connectToDatabase(mongoUri);
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});


