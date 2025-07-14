import express from "express";
import { createWorkspace, getWorkspaces, getWorkspace } from "../controllers/workspace.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// All workspace routes require authentication
router.use(authMiddleware);

// Create a new workspace
router.post("/create", createWorkspace);

// Get all workspaces for the authenticated user
router.get("/all", getWorkspaces);

// Get a specific workspace by ID
router.get("/:workspaceId", getWorkspace);

export default router; 