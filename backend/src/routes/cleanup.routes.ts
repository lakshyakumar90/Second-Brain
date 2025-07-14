import { Router } from "express";
import {
  startCleanupService,
  stopCleanupService,
  getCleanupStatus,
  triggerManualCleanup,
  updateCleanupSettings,
} from "../controllers/cleanup.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// All cleanup routes require authentication and admin privileges
router.use(authMiddleware);

// Start cleanup service
router.post("/start", startCleanupService);

// Stop cleanup service
router.post("/stop", stopCleanupService);

// Get cleanup service status
router.get("/status", getCleanupStatus);

// Trigger manual cleanup
router.post("/trigger", triggerManualCleanup);

// Update cleanup settings
router.put("/settings", updateCleanupSettings);

export default router; 