import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";

const router = Router();
const AuthSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post("/register", async (req, res) => {
  const parse = AuthSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  const { email, password } = parse.data;
  const exists = await UserModel.findOne({ email }).lean();
  if (exists) return res.status(409).json({ error: "Email already registered" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ email, passwordHash });
  const token = jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" });
  res.json({ token });
});

router.post("/login", async (req, res) => {
  const parse = AuthSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  const { email, password } = parse.data;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" });
  res.json({ token });
});

export default router;


