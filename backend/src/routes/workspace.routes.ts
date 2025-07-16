import express from "express";
import { createWorkspace, getWorkspaces, getWorkspace, updateWorkspace, deleteWorkspace, inviteMember, removeMember, acceptInvite, rejectInvite, updateMemberRole, getWorkspaceMembers, leaveWorkspace } from "../controllers/workspace.controller";
import { authMiddleware, registrationCompleteMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

router.post("/create", createWorkspace);
router.get("/all", getWorkspaces);
router.get("/:workspaceId", getWorkspace);
router.put("/:workspaceId", updateWorkspace);
router.delete("/:workspaceId", deleteWorkspace);
router.post("/:workspaceId/invite", inviteMember);
router.delete("/:workspaceId/member/:memberId", removeMember);
router.post("/:workspaceId/accept", acceptInvite);
router.post("/:workspaceId/reject", rejectInvite);
router.put("/:workspaceId/member/:memberId/role", updateMemberRole);
router.get("/:workspaceId/members", getWorkspaceMembers);
router.post("/:workspaceId/leave", leaveWorkspace);

export default router; 