import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

import { connectToDatabase } from "./config/db";
import { authMiddleware } from "./middleware/auth";
import authRouter from "./routes/auth";
import documentsRouter from "./routes/documents";
import foldersRouter from "./routes/folders";
import remindersRouter from "./routes/reminders";
import reportsRouter from "./routes/reports";
import shareRouter from "./routes/share";
import templatesRouter from "./routes/templates";

dotenv.config();

const app = express();
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://client-shopmart.vercel.app/",
        "https://sellershopmart.vercel.app/"
    ],
    credentials: true
}))
app.use(express.json({ limit: "2mb" }));

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Static serving for uploaded files
app.use("/uploads", express.static(uploadsDir));

// Mock market prices endpoint
app.get("/api/market/prices", (_req, res) => {
  res.json({
    updatedAt: new Date().toISOString(),
    currencies: "USD/tonne",
    crops: [
      { crop: "Coffee", region: "EU", price: 4200 },
      { crop: "Coffee", region: "Asia", price: 4050 },
      { crop: "Tea", region: "EU", price: 1900 },
      { crop: "Tea", region: "Asia", price: 1750 },
      { crop: "Avocado", region: "EU", price: 2300 },
      { crop: "Avocado", region: "Asia", price: 2100 },
    ],
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/documents", authMiddleware, documentsRouter);
app.use("/api/folders", authMiddleware, foldersRouter);
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


