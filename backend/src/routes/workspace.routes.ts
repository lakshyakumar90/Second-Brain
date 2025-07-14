import express from "express";
import { createWorkspace, getWorkspaces, getWorkspace, updateWorkspace } from "../controllers/workspace.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authMiddleware);
router.post("/create", createWorkspace);
router.get("/all", getWorkspaces);
router.get("/:workspaceId", getWorkspace);
router.put("/:workspaceId", updateWorkspace);

export default router; 