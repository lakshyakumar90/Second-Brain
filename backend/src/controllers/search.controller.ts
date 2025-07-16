import { Request, Response } from "express";
import { Item, Category, ActivityLog } from "../models";
import * as aiService from "../services/aiService";
import mongoose from "mongoose";
import { AuthRequest } from "../models/interfaces/userModel.interface";

// Helper: Check if user can access item
async function canAccessItem(userId: string, item: any): Promise<boolean> {
  if (item.visibility === "public") return true;
  if (item.userId?.toString() === userId) return true;
  // Check workspace/collaborators if present
  if (item.workspaceId) {
    // Assume you have a Workspace model and can check membership
    const Workspace = require("../models/workspace.model").default;
    const workspace = await Workspace.findById(item.workspaceId).lean();
    if (workspace && workspace.members?.some((m: any) => m.toString() === userId)) return true;
  }
  if (item.collaborators && item.collaborators.some((c: any) => c.toString() === userId)) return true;
  return false;
}

export const searchItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const q = req.query.q as string;
    if (!userId || !q) {
      res.status(400).json({ message: "Missing userId or query" });
      return;
    }
    // Find items owned by user or shared with them (private or public)
    const items = await Item.find({
      isDeleted: false,
      $or: [
        { userId: new mongoose.Types.ObjectId(userId) },
        { collaborators: new mongoose.Types.ObjectId(userId) },
        { workspaceId: { $exists: true } }, // We'll filter workspace membership below
      ],
      $and: [
        {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { content: { $regex: q, $options: "i" } },
            { tags: { $regex: q, $options: "i" } },
          ],
        },
      ],
    }).lean();
    // Filter by permission
    const filtered = [];
    for (const item of items) {
      if (await canAccessItem(userId, item)) filtered.push(item);
    }
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Error searching items", error: err });
  }
};

export const searchGlobal = async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      res.status(400).json({ message: "Missing query" });
      return;
    }
    // Only return public items/categories
    const [items, categories] = await Promise.all([
      Item.find({
        isDeleted: false,
        visibility: "public",
        $or: [
          { title: { $regex: q, $options: "i" } },
          { content: { $regex: q, $options: "i" } },
          { tags: { $regex: q, $options: "i" } },
        ],
      }).lean(),
      Category.find({
        isDeleted: false,
        visibility: "public",
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      }).lean(),
    ]);
    res.json({ items, categories });
  } catch (err) {
    res.status(500).json({ message: "Error in global search", error: err });
  }
};

export const searchByCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId } = req.params;
    const q = req.query.q as string;
    const userId = req.user?.userId;
    if (!categoryId || !userId) {
      res.status(400).json({ message: "Missing categoryId or userId" });
      return;
    }
    const filter: any = {
      categories: new mongoose.Types.ObjectId(categoryId),
      isDeleted: false,
    };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }
    const items = await Item.find(filter).lean();
    // Filter by permission
    const filtered = [];
    for (const item of items) {
      if (await canAccessItem(userId, item)) filtered.push(item);
    }
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Error searching by category", error: err });
  }
};

export const searchByTags = async (req: AuthRequest, res: Response) => {
  try {
    const tags = req.query.tags as string;
    const userId = req.user?.userId;
    if (!tags || !userId) {
      res.status(400).json({ message: "Missing tags or userId" });
      return;
    }
    const tagList = tags.split(",").map((t) => t.trim());
    const items = await Item.find({
      tags: { $in: tagList },
      isDeleted: false,
    }).lean();
    // Filter by permission
    const filtered = [];
    for (const item of items) {
      if (await canAccessItem(userId, item)) filtered.push(item);
    }
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Error searching by tags", error: err });
  }
};

export const semanticSearch = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body;
    const userId = req.user?.userId;
    if (!query || !userId) {
      res.status(400).json({ message: "Missing query or userId" });
      return;
    }
    // For demo: use AI to suggest tags, then search items with those tags
    const aiResult = await aiService.suggestTags(query);
    let tags: string[] = [];
    let content = aiResult?.candidates?.[0]?.content;
    // Handle OpenAI-style { parts: [{ text: ... }] }
    if (content && typeof content === 'object' && Array.isArray(content.parts) && typeof content.parts[0]?.text === 'string') {
      tags = content.parts[0].text.split(',').map((t: string) => t.trim());
    } else if (typeof content === 'string') {
      tags = content.split(',').map((t: string) => t.trim());
    }
    const items = await Item.find({
      tags: { $in: tags },
      isDeleted: false,
    }).lean();
    // Filter by permission
    const filtered = [];
    for (const item of items) {
      if (await canAccessItem(userId, item)) filtered.push(item);
    }
    res.json({ tags, items: filtered });
  } catch (err) {
    res.status(500).json({ message: "Error in semantic search", error: err });
  }
};

export const getSearchSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    const userId = req.user?.userId;
    if (!q || !userId) {
      res.status(400).json({ message: "Missing query or userId" });
      return;
    }
    // Suggest item titles and tags for items user can access
    const items = await Item.find({
      isDeleted: false,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
    }).lean();
    const filtered = [];
    for (const item of items) {
      if (await canAccessItem(userId, item)) filtered.push(item);
    }
    const titles = [...new Set(filtered.map((i) => i.title))];
    const tags = [...new Set(filtered.flatMap((i) => i.tags || []))];
    res.json({ titles, tags });
  } catch (err) {
    res.status(500).json({ message: "Error getting suggestions", error: err });
  }
};

export const saveSearchQuery = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { query } = req.body;
    if (!userId || !query) {
      res.status(400).json({ message: "Missing userId or query" });
      return;
    }
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "search",
      resourceType: "item",
      resourceId: null,
      details: { query },
    });
    res.json({ message: "Search query saved" });
  } catch (err) {
    res.status(500).json({ message: "Error saving search query", error: err });
  }
};

export const getSearchHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }
    const history = await ActivityLog.find({
      userId: new mongoose.Types.ObjectId(userId),
      action: "search",
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    // Only return entries with a non-null query, and include timestamp
    const filtered = history
      .filter((h) => h.details && typeof (h.details as any).query === 'string' && ((h.details as any).query).trim() !== '')
      .map((h) => ({ query: (h.details as any).query, createdAt: h.createdAt }));
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Error getting search history", error: err });
  }
};
