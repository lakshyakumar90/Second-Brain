import { Response } from "express";
import { AuthRequest } from "../models/interfaces/userModel.interface";
import Collaboration from "../models/collaboration.model";
import mongoose from "mongoose";

export const createCollaboration = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId, allowAnonymous } = req.body;
    const ownerId = req.user?.userId;
    if (!itemId || !ownerId) {
      res.status(400).json({ message: "Missing itemId or ownerId" });
      return;
    }
    const collab = await Collaboration.create({ itemId, ownerId, allowAnonymous });
    res.status(201).json(collab);
    return;
  } catch (err) {
    res.status(500).json({ message: "Failed to create collaboration", error: err });
  }
};

export const getCollaborations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const collaborations = await Collaboration.find({
      $or: [
        { ownerId: userId },
        { "collaborators.userId": userId }
      ]
    });
    res.json(collaborations);
    return;
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch collaborations", error: err });
  }
};

export const joinCollaboration = async (req: AuthRequest, res: Response) => {
  try {
    const { collabId } = req.body;
    const userId = req.user?.userId;
    if (!collabId || !userId) {
      res.status(400).json({ message: "Missing collabId or userId" });
      return;
    }
    const collab = await Collaboration.findById(collabId);
    if (!collab) {
      res.status(404).json({ message: "Collaboration not found" });
      return;
    }
    const userObjId = new mongoose.Types.ObjectId(userId);
    if (!collab.collaborators.some(c => c.userId instanceof mongoose.Types.ObjectId && c.userId.equals(userObjId))) {
      collab.collaborators.push({ userId: userObjId as any, permission: "edit", addedAt: new Date(), addedBy: userObjId as any });
    }
    await collab.save();
    res.json(collab);
    return;
  } catch (err) {
    res.status(500).json({ message: "Failed to join collaboration", error: err });
    return;
  }
};

export const leaveCollaboration = async (req: AuthRequest, res: Response) => {
  try {
    const { collabId } = req.body;
    const userId = req.user?.userId;
    if (!collabId || !userId) {
      res.status(400).json({ message: "Missing collabId or userId" });
      return;
    }
    const collab = await Collaboration.findById(collabId);
    if (!collab) {
      res.status(404).json({ message: "Collaboration not found" });
      return;
    }
    const userObjId = new mongoose.Types.ObjectId(userId);
    collab.collaborators = collab.collaborators.filter(c => !(c.userId instanceof mongoose.Types.ObjectId && c.userId.equals(userObjId as any)));
    await collab.save();
    res.json({ message: "Left collaboration" });
    return;
  } catch (err) {
    res.status(500).json({ message: "Failed to leave collaboration", error: err });
    return;
  }
};

export const updateCollaboration = async (req: AuthRequest, res: Response) => {
  try {
    const { collabId, updates } = req.body;
    if (!collabId || !updates) {
      res.status(400).json({ message: "Missing collabId or updates" });
      return;
    }
    const collab = await Collaboration.findByIdAndUpdate(collabId, updates, { new: true });
    if (!collab) {
      res.status(404).json({ message: "Collaboration not found" });
      return;
    }
    res.json(collab);
    return;
  } catch (err) {
    res.status(500).json({ message: "Failed to update collaboration", error: err });
    return;
  }
};

export const getActiveUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { collabId } = req.query;
    if (!collabId) {
      res.status(400).json({ message: "Missing collabId" });
      return;
    }
    const collab = await Collaboration.findById(collabId).select("activeUsers");
    if (!collab) {
      res.status(404).json({ message: "Collaboration not found" });
      return;
    }
    res.json(collab.activeUsers);
    return;
  } catch (err) {
    res.status(500).json({ message: "Failed to get active users", error: err });
    return;
  }
};

export const saveCollaborativeChanges = async (req: AuthRequest, res: Response) => {
  try {
    const { collabId, changes, version } = req.body;
    if (!collabId || !changes) {
      res.status(400).json({ message: "Missing collabId or changes" });
      return;
    }
    // For demo: just increment version and store changes (extend as needed)
    const collab = await Collaboration.findById(collabId);
    if (!collab) {
      res.status(404).json({ message: "Collaboration not found" });
      return;
    }
    collab.currentVersion = version || collab.currentVersion + 1;
    // Optionally: store changes in a separate collection or field
    await collab.save();
    res.json({ message: "Changes saved", version: collab.currentVersion });
    return;
  } catch (err) {
    res.status(500).json({ message: "Failed to save changes", error: err });
    return;
  }
};
