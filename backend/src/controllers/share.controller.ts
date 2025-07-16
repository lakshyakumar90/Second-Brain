import { Request, Response } from "express";
import Share from "../models/share.model";
import { Item } from "../models/index";
import { nanoid } from "nanoid";
import { updateShareSchema, shareIdSchema } from "../validations/shareValidation";
import bcrypt from "bcrypt";
import Notification from "../models/notification.model";
import { AuthRequest } from "../models/interfaces/userModel.interface";

// Create a public share link for an item
const createShare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.body;
    const userId = req.user?.userId;
    if (!itemId) {
      res.status(400).json({ message: "itemId is required" });
      return;
    }
    // Only owner/admin can create share
    const item = await Item.findOne({ _id: itemId, isDeleted: false });
    if (!item) {
      res.status(404).json({ message: "Item not found or deleted" });
      return;
    }
    if (item.userId.toString() !== userId) {
      res.status(403).json({ message: "Only the owner can create a share link" });
      return;
    }
    // Check for existing active share
    let share = await Share.findOne({ itemId, userId, isPublic: true, expiresAt: { $gt: new Date() } });
    if (share) {
      res.status(200).json({ message: "Share link already exists", share });
      return;
    }
    // Create new share
    const shareId = nanoid(16);
    share = await Share.create({
      itemId,
      userId,
      shareId,
      isPublic: true,
      permission: "view",
      allowComments: true,
      allowDownload: true,
      showMetadata: true,
      expiresAt: undefined // or set to a date if you want expiration
    });
    // Notify the item owner if someone else shared their item
    if (item.userId.toString() !== userId) {
      await Notification.create({
        userId: item.userId,
        type: "share",
        title: "Your item was shared",
        message: `Your item '${item.title}' was shared by another user`,
        relatedId: item._id,
        relatedType: "item",
        senderId: userId,
        actionUrl: `/items/${item._id}`
      });
    }
    res.status(201).json({ message: "Share link created", share });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({ message: "Error creating share" });
  }
};

// Get all shares created by the authenticated user
const getShares = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const shares = await Share.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ shares });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({ message: "Error getting shares" });
  }
};

// Get a single share by its public link (no auth required)
const getShare = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shareId } = req.params;
    if (!shareId) {
      res.status(400).json({ message: "shareId is required" });
      return;
    }
    // Find share
    const share = await Share.findOne({ shareId, isPublic: true });
    if (!share) {
      res.status(404).json({ message: "Share link not found or not public" });
      return;
    }
    // Check expiration
    if (share.expiresAt && share.expiresAt < new Date()) {
      res.status(410).json({ message: "Share link has expired" });
      return;
    }
    // Check item is not deleted
    const item = await Item.findOne({ _id: share.itemId, isDeleted: false });
    if (!item) {
      res.status(404).json({ message: "Shared item not found or deleted" });
      return;
    }
    // Optionally increment access count, log access, etc.
    share.accessCount += 1;
    share.lastAccessedAt = new Date();
    await share.save();
    res.status(200).json({ share, item });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({ message: "Error getting share" });
  }
};

// Update share settings
const updateShare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate shareId param
    const idValidationResult = shareIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({ message: "Validation failed", errors: idValidationResult.error.issues });
      return;
    }
    // Validate update body
    const updateValidationResult = updateShareSchema.safeParse(req.body);
    if (!updateValidationResult.success) {
      res.status(400).json({ message: "Validation failed", errors: updateValidationResult.error.issues });
      return;
    }
    const { shareId } = idValidationResult.data;
    const updateData = updateValidationResult.data;
    const userId = req.user?.userId;
    // Find share and check ownership
    const share = await Share.findOne({ shareId, userId });
    if (!share) {
      res.status(404).json({ message: "Share not found or access denied" });
      return;
    }
    // Update allowed fields
    Object.assign(share, updateData);
    await share.save();
    res.status(200).json({ message: "Share updated successfully", share });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({ message: "Error updating share" });
  }
};

// Delete share
const deleteShare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate shareId param
    const idValidationResult = shareIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({ message: "Validation failed", errors: idValidationResult.error.issues });
      return;
    }
    const { shareId } = idValidationResult.data;
    const userId = req.user?.userId;
    // Find share and check ownership
    const share = await Share.findOne({ shareId, userId });
    if (!share) {
      res.status(404).json({ message: "Share not found or access denied" });
      return;
    }
    await share.deleteOne();
    res.status(200).json({ message: "Share deleted successfully" });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({ message: "Error deleting share" });
  }
};

// Public access to a share (increments analytics, checks password if set)
const accessShare = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shareId } = req.params;
    const { password } = req.body;
    if (!shareId) {
      res.status(400).json({ message: "shareId is required" });
      return;
    }
    // Find share
    const share = await Share.findOne({ shareId, isPublic: true });
    if (!share) {
      res.status(404).json({ message: "Share link not found or not public" });
      return;
    }
    // Check expiration
    if (share.expiresAt && share.expiresAt < new Date()) {
      res.status(410).json({ message: "Share link has expired" });
      return;
    }
    // Check password if set
    if (share.password) {
      if (!password) {
        res.status(401).json({ message: "Password required" });
        return;
      }
      const isMatch = await bcrypt.compare(password, share.password);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid password" });
        return;
      }
    }
    // Increment analytics
    share.accessCount += 1;
    share.lastAccessedAt = new Date();
    // Optionally, log IP/userAgent
    share.accessLog.push({
      ip: req.ip || "",
      userAgent: String(req.headers["user-agent"] || ""),
      accessedAt: new Date(),
    });
    await share.save();
    res.status(200).json({ message: "Share accessed", shareId });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({ message: "Error accessing share" });
  }
};

// Get share analytics (owner only)
const getShareAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shareId } = req.params;
    const userId = req.user?.userId;
    if (!shareId) {
      res.status(400).json({ message: "shareId is required" });
      return;
    }
    const share = await Share.findOne({ shareId, userId });
    if (!share) {
      res.status(404).json({ message: "Share not found or access denied" });
      return;
    }
    // Return analytics fields
    const analytics = {
      accessCount: share.accessCount,
      uniqueViews: share.uniqueViews,
      lastAccessedAt: share.lastAccessedAt,
      accessLog: share.accessLog,
      createdAt: share.createdAt,
      updatedAt: share.updatedAt,
    };
    res.status(200).json({ analytics });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({ message: "Error getting share analytics" });
  }
};

// Validate share password (public)
const checkSharePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shareId } = req.params;
    const { password } = req.body;
    if (!shareId) {
      res.status(400).json({ message: "shareId is required" });
      return;
    }
    const share = await Share.findOne({ shareId, isPublic: true });
    if (!share) {
      res.status(404).json({ message: "Share link not found or not public" });
      return;
    }
    if (!share.password) {
      res.status(400).json({ message: "This share does not require a password" });
      return;
    }
    if (!password) {
      res.status(400).json({ message: "Password is required" });
      return;
    }
    const isMatch = await bcrypt.compare(password, share.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }
    res.status(200).json({ message: "Password is valid" });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({ message: "Error checking share password" });
  }
};

export { createShare, getShares, getShare, updateShare, deleteShare, accessShare, getShareAnalytics, checkSharePassword };
