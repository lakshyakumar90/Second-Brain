import express from "express";
import { createShare, getShares, getShare } from "../controllers/share.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Authenticated routes
router.post("/create", authMiddleware, createShare);
router.get("/all", authMiddleware, getShares);

// Public route
router.get("/:shareId", getShare);

export default router; 