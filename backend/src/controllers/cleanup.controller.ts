import { Request, Response } from "express";
import cleanupService from "../services/cleanupService";
import { AuthRequest } from "../models/interfaces/userModel.interface";

/**
 * Start the cleanup service
 * Only admins can start the service
 */
const startCleanupService = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      res.status(403).json({
        message: "Access denied",
        error: "Only administrators can manage the cleanup service",
      });
      return;
    }

    cleanupService.start();

    res.status(200).json({
      message: "Cleanup service started successfully",
      status: cleanupService.getStatus(),
    });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({
      message: "Error starting cleanup service",
      error: "Internal server error",
    });
  }
};

/**
 * Stop the cleanup service
 * Only admins can stop the service
 */
const stopCleanupService = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      res.status(403).json({
        message: "Access denied",
        error: "Only administrators can manage the cleanup service",
      });
      return;
    }

    cleanupService.stop();

    res.status(200).json({
      message: "Cleanup service stopped successfully",
      status: cleanupService.getStatus(),
    });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({
      message: "Error stopping cleanup service",
      error: "Internal server error",
    });
  }
};

/**
 * Get cleanup service status
 * Only admins can view the status
 */
const getCleanupStatus = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      res.status(403).json({
        message: "Access denied",
        error: "Only administrators can view cleanup service status",
      });
      return;
    }

    const status = cleanupService.getStatus();

    res.status(200).json({
      message: "Cleanup service status retrieved successfully",
      status,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({
      message: "Error getting cleanup service status",
      error: "Internal server error",
    });
  }
};

/**
 * Manually trigger cleanup
 * Only admins can trigger manual cleanup
 */
const triggerManualCleanup = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      res.status(403).json({
        message: "Access denied",
        error: "Only administrators can trigger manual cleanup",
      });
      return;
    }

    const stats = await cleanupService.manualCleanup();

    res.status(200).json({
      message: "Manual cleanup completed successfully",
      stats,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({
      message: "Error triggering manual cleanup",
      error: "Internal server error",
    });
  }
};

/**
 * Update cleanup settings
 * Only admins can update settings
 */
const updateCleanupSettings = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      res.status(403).json({
        message: "Access denied",
        error: "Only administrators can update cleanup settings",
      });
      return;
    }

    const { retentionPeriod, cleanupInterval } = req.body;

    // Validate input
    if (retentionPeriod && typeof retentionPeriod === "number" && retentionPeriod > 0) {
      cleanupService.setRetentionPeriod(retentionPeriod);
    }

    if (cleanupInterval && typeof cleanupInterval === "number" && cleanupInterval > 0) {
      cleanupService.setCleanupInterval(cleanupInterval);
    }

    res.status(200).json({
      message: "Cleanup settings updated successfully",
      status: cleanupService.getStatus(),
    });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({
      message: "Error updating cleanup settings",
      error: "Internal server error",
    });
  }
};

export {
  startCleanupService,
  stopCleanupService,
  getCleanupStatus,
  triggerManualCleanup,
  updateCleanupSettings,
}; 