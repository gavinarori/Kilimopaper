import { Router } from "express";
import { z } from "zod";
import { FolderModel } from "../models/Folder";

const router = Router();

// Get all folders
router.get("/", async (req, res) => {
  const userId = (req as any).userId as string;
  const folders = await FolderModel.find({ ownerId: userId })
    .sort({ createdAt: -1 })
    .lean();
  
  // Add document count to each folder
  const foldersWithCount = await Promise.all(
    folders.map(async (folder) => {
      const { DocumentModel } = await import("../models/Document");
      const documentCount = await DocumentModel.countDocuments({ 
        ownerId: userId, 
        folderId: folder._id 
      });
      return { ...folder, documentCount };
    })
  );
  
  res.json(foldersWithCount);
});

// Create new folder
router.post("/", async (req, res) => {
  const userId = (req as any).userId as string;
  const schema = z.object({ 
    name: z.string().min(1).max(100), 
    description: z.string().optional() 
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  
  const created = await FolderModel.create({ 
    ownerId: userId, 
    ...parse.data 
  });
  res.status(201).json(created);
});

// Update folder
router.put("/:id", async (req, res) => {
  const userId = (req as any).userId as string;
  const folderId = req.params.id;
  const schema = z.object({ 
    name: z.string().min(1).max(100), 
    description: z.string().optional() 
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  
  const folder = await FolderModel.findOneAndUpdate(
    { _id: folderId, ownerId: userId },
    parse.data,
    { new: true }
  );
  
  if (!folder) return res.status(404).json({ error: "Folder not found" });
  res.json(folder);
});

// Delete folder
router.delete("/:id", async (req, res) => {
  const userId = (req as any).userId as string;
  const folderId = req.params.id;
  
  // Check if folder has documents
  const { DocumentModel } = await import("../models/Document");
  const documentCount = await DocumentModel.countDocuments({ 
    ownerId: userId, 
    folderId: folderId 
  });
  
  if (documentCount > 0) {
    return res.status(400).json({ 
      error: "Cannot delete folder with documents. Move or delete documents first." 
    });
  }
  
  const folder = await FolderModel.findOneAndDelete({ 
    _id: folderId, 
    ownerId: userId 
  });
  
  if (!folder) return res.status(404).json({ error: "Folder not found" });
  res.json({ message: "Folder deleted successfully" });
});

export default router;
