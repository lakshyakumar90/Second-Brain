import express from "express";
import {
  createShare,
  getShares,
  getShare,
  updateShare,
  deleteShare,
  accessShare,
  checkSharePassword,
  getShareAnalytics,
} from "../controllers/share.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Authenticated routes
router.post("/create", authMiddleware, createShare);
router.get("/all", authMiddleware, getShares);
router.put("/:shareId", authMiddleware, updateShare);
router.delete("/:shareId", authMiddleware, deleteShare);
router.post("/:shareId/access", accessShare);
router.get("/:shareId/analytics", authMiddleware, getShareAnalytics);
router.post("/:shareId/check-password", checkSharePassword);

// Public route
router.get("/:shareId", getShare);

export default router;
