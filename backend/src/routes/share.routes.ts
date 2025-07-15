import express from "express";
import { createShare, getShares, getShare, updateShare, deleteShare } from "../controllers/share.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Authenticated routes
router.post("/create", authMiddleware, createShare);
router.get("/all", authMiddleware, getShares);
router.put("/:shareId", authMiddleware, updateShare);
router.delete("/:shareId", authMiddleware, deleteShare);

// Public route
router.get("/:shareId", getShare);

export default router; 