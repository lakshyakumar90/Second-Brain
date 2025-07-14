import { Item, Category, Comment, Share, Collaboration, AIChat, AIUsage, ActivityLog, Notification } from "../models/index";
import mongoose from "mongoose";

interface CleanupStats {
  itemsDeleted: number;
  categoriesDeleted: number;
  commentsDeleted: number;
  sharesDeleted: number;
  collaborationsDeleted: number;
  aiChatsDeleted: number;
  aiUsageDeleted: number;
  activityLogsDeleted: number;
  notificationsDeleted: number;
  totalDeleted: number;
  errors: string[];
}

class CleanupService {
  private isRunning = false;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private RETENTION_PERIOD = 24 * 60 * 60 * 1000; // 24 hours (1 day)

  /**
   * Start the cleanup service
   */
  start(): void {
    if (this.isRunning) {
      console.log("Cleanup service is already running");
      return;
    }

    console.log("Starting cleanup service...");
    this.isRunning = true;

    // Run initial cleanup
    this.performCleanup();

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.CLEANUP_INTERVAL);

    console.log(`Cleanup service started. Will run every ${this.CLEANUP_INTERVAL / (60 * 60 * 1000)} hours`);
  }

  /**
   * Stop the cleanup service
   */
  stop(): void {
    if (!this.isRunning) {
      console.log("Cleanup service is not running");
      return;
    }

    console.log("Stopping cleanup service...");
    this.isRunning = false;

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    console.log("Cleanup service stopped");
  }

  /**
   * Perform the cleanup operation
   */
  async performCleanup(): Promise<CleanupStats> {
    if (!this.isRunning) {
      throw new Error("Cleanup service is not running");
    }

    console.log("Starting cleanup operation...");
    const startTime = Date.now();
    const stats: CleanupStats = {
      itemsDeleted: 0,
      categoriesDeleted: 0,
      commentsDeleted: 0,
      sharesDeleted: 0,
      collaborationsDeleted: 0,
      aiChatsDeleted: 0,
      aiUsageDeleted: 0,
      activityLogsDeleted: 0,
      notificationsDeleted: 0,
      totalDeleted: 0,
      errors: [],
    };

    try {
      // Calculate the cutoff date (1 day ago)
      const cutoffDate = new Date(Date.now() - this.RETENTION_PERIOD);

      // Cleanup items
      stats.itemsDeleted = await this.cleanupItems(cutoffDate);

      // Cleanup categories
      stats.categoriesDeleted = await this.cleanupCategories(cutoffDate);

      // Cleanup related data
      stats.commentsDeleted = await this.cleanupComments(cutoffDate);
      stats.sharesDeleted = await this.cleanupShares(cutoffDate);
      stats.collaborationsDeleted = await this.cleanupCollaborations(cutoffDate);
      stats.aiChatsDeleted = await this.cleanupAIChats(cutoffDate);
      stats.aiUsageDeleted = await this.cleanupAIUsage(cutoffDate);
      stats.activityLogsDeleted = await this.cleanupActivityLogs(cutoffDate);
      stats.notificationsDeleted = await this.cleanupNotifications(cutoffDate);

      // Calculate total
      stats.totalDeleted = 
        stats.itemsDeleted + 
        stats.categoriesDeleted + 
        stats.commentsDeleted + 
        stats.sharesDeleted + 
        stats.collaborationsDeleted + 
        stats.aiChatsDeleted + 
        stats.aiUsageDeleted + 
        stats.activityLogsDeleted + 
        stats.notificationsDeleted;

      const duration = Date.now() - startTime;
      console.log(`Cleanup completed in ${duration}ms. Total deleted: ${stats.totalDeleted}`);
      console.log("Cleanup stats:", stats);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      stats.errors.push(errorMessage);
      console.error("Error during cleanup:", error);
    }

    return stats;
  }

  /**
   * Cleanup soft-deleted items
   */
  private async cleanupItems(cutoffDate: Date): Promise<number> {
    try {
      const result = await Item.deleteMany({
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
      });

      console.log(`Deleted ${result.deletedCount} items`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up items:", error);
      return 0;
    }
  }

  /**
   * Cleanup soft-deleted categories
   */
  private async cleanupCategories(cutoffDate: Date): Promise<number> {
    try {
      const result = await Category.deleteMany({
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
      });

      console.log(`Deleted ${result.deletedCount} categories`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up categories:", error);
      return 0;
    }
  }

  /**
   * Cleanup comments for deleted items
   */
  private async cleanupComments(cutoffDate: Date): Promise<number> {
    try {
      // Get IDs of items that were permanently deleted
      const deletedItemIds = await Item.distinct("_id", {
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
      });

      if (deletedItemIds.length === 0) {
        return 0;
      }

      const result = await Comment.deleteMany({
        itemId: { $in: deletedItemIds }
      });

      console.log(`Deleted ${result.deletedCount} comments for deleted items`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up comments:", error);
      return 0;
    }
  }

  /**
   * Cleanup shares for deleted items
   */
  private async cleanupShares(cutoffDate: Date): Promise<number> {
    try {
      // Get IDs of items that were permanently deleted
      const deletedItemIds = await Item.distinct("_id", {
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
      });

      if (deletedItemIds.length === 0) {
        return 0;
      }

      const result = await Share.deleteMany({
        itemId: { $in: deletedItemIds }
      });

      console.log(`Deleted ${result.deletedCount} shares for deleted items`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up shares:", error);
      return 0;
    }
  }

  /**
   * Cleanup collaborations for deleted items
   */
  private async cleanupCollaborations(cutoffDate: Date): Promise<number> {
    try {
      // Get IDs of items that were permanently deleted
      const deletedItemIds = await Item.distinct("_id", {
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
      });

      if (deletedItemIds.length === 0) {
        return 0;
      }

      const result = await Collaboration.deleteMany({
        itemId: { $in: deletedItemIds }
      });

      console.log(`Deleted ${result.deletedCount} collaborations for deleted items`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up collaborations:", error);
      return 0;
    }
  }

  /**
   * Cleanup AI chats for deleted items
   */
  private async cleanupAIChats(cutoffDate: Date): Promise<number> {
    try {
      // Get IDs of items that were permanently deleted
      const deletedItemIds = await Item.distinct("_id", {
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
      });

      if (deletedItemIds.length === 0) {
        return 0;
      }

      // Remove deleted items from contextItems array
      const result = await AIChat.updateMany(
        { contextItems: { $in: deletedItemIds } },
        { $pull: { contextItems: { $in: deletedItemIds } } }
      );

      console.log(`Updated ${result.modifiedCount} AI chats to remove deleted items`);
      return result.modifiedCount;
    } catch (error) {
      console.error("Error cleaning up AI chats:", error);
      return 0;
    }
  }

  /**
   * Cleanup AI usage records for deleted items
   */
  private async cleanupAIUsage(cutoffDate: Date): Promise<number> {
    try {
      // Get IDs of items that were permanently deleted
      const deletedItemIds = await Item.distinct("_id", {
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
      });

      if (deletedItemIds.length === 0) {
        return 0;
      }

      const result = await AIUsage.deleteMany({
        itemId: { $in: deletedItemIds }
      });

      console.log(`Deleted ${result.deletedCount} AI usage records for deleted items`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up AI usage:", error);
      return 0;
    }
  }

  /**
   * Cleanup activity logs for deleted items
   */
  private async cleanupActivityLogs(cutoffDate: Date): Promise<number> {
    try {
      // Get IDs of items that were permanently deleted
      const deletedItemIds = await Item.distinct("_id", {
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
      });

      if (deletedItemIds.length === 0) {
        return 0;
      }

      const result = await ActivityLog.deleteMany({
        resourceType: "item",
        resourceId: { $in: deletedItemIds }
      });

      console.log(`Deleted ${result.deletedCount} activity logs for deleted items`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up activity logs:", error);
      return 0;
    }
  }

  /**
   * Cleanup notifications for deleted items
   */
  private async cleanupNotifications(cutoffDate: Date): Promise<number> {
    try {
      // Get IDs of items that were permanently deleted
      const deletedItemIds = await Item.distinct("_id", {
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
      });

      if (deletedItemIds.length === 0) {
        return 0;
      }

      const result = await Notification.deleteMany({
        relatedType: "item",
        relatedId: { $in: deletedItemIds }
      });

      console.log(`Deleted ${result.deletedCount} notifications for deleted items`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
      return 0;
    }
  }

  /**
   * Manually trigger cleanup (for testing or immediate cleanup)
   */
  async manualCleanup(): Promise<CleanupStats> {
    console.log("Manual cleanup triggered");
    return this.performCleanup();
  }

  /**
   * Get cleanup service status
   */
  getStatus(): { isRunning: boolean; nextCleanup?: Date } {
    const status: { isRunning: boolean; nextCleanup?: Date } = { isRunning: this.isRunning };
    
    if (this.isRunning && this.cleanupInterval) {
      // Calculate next cleanup time (approximate)
      status.nextCleanup = new Date(Date.now() + this.CLEANUP_INTERVAL);
    }

    return status;
  }

  /**
   * Update retention period
   */
  setRetentionPeriod(hours: number): void {
    this.RETENTION_PERIOD = hours * 60 * 60 * 1000;
    console.log(`Retention period updated to ${hours} hours`);
  }

  /**
   * Update cleanup interval
   */
  setCleanupInterval(hours: number): void {
    this.CLEANUP_INTERVAL = hours * 60 * 60 * 1000;
    console.log(`Cleanup interval updated to ${hours} hours`);
    
    // Restart the service with new interval
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

// Create singleton instance
const cleanupService = new CleanupService();

export default cleanupService; 