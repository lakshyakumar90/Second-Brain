import { Request, Response } from "express";
import Notification from "../models/notification.model";
import User from "../models/user.model";
import {
  getNotificationsQuerySchema,
  notificationIdSchema,
  updateNotificationPreferencesSchema,
} from "../validations/notificationValidation";

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    const validationResult = getNotificationsQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      res.status(400).json({ message: "Validation failed", error: validationResult.error });
      return;
    }
    const { page = 1, limit = 20, isRead, type } = validationResult.data;
    const filter: any = { userId: req.user.userId };
    if (typeof isRead === "boolean") filter.isRead = isRead;
    if (type) filter.type = type;
    const skip = (page - 1) * limit;
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Notification.countDocuments(filter);
    res.status(200).json({
      message: "Notifications retrieved successfully",
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving notifications", error: "Internal server error" });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    const validationResult = notificationIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      res.status(400).json({ message: "Validation failed", error: validationResult.error });
      return;
    }
    const { notificationId } = validationResult.data;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user.userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read", error: "Internal server error" });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error marking all as read", error: "Internal server error" });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    const validationResult = notificationIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      res.status(400).json({ message: "Validation failed", error: validationResult.error });
      return;
    }
    const { notificationId } = validationResult.data;
    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId: req.user.userId });
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification", error: "Internal server error" });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    const count = await Notification.countDocuments({ userId: req.user.userId, isRead: false });
    res.status(200).json({ message: "Unread count retrieved", count });
  } catch (error) {
    res.status(500).json({ message: "Error getting unread count", error: "Internal server error" });
  }
};

export const updateNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    const validationResult = updateNotificationPreferencesSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ message: "Validation failed", error: validationResult.error });
      return;
    }
    const { emailNotifications } = validationResult.data;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { "preferences.emailNotifications": emailNotifications },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: "Notification preferences updated", preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: "Error updating preferences", error: "Internal server error" });
  }
}; 