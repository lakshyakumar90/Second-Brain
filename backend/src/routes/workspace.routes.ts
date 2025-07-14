import express from "express";
import { createWorkspace, getWorkspaces, getWorkspace, updateWorkspace, deleteWorkspace, inviteMember, removeMember, acceptInvite, rejectInvite, updateMemberRole, getWorkspaceMembers, leaveWorkspace } from "../controllers/workspace.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authMiddleware);
router.post("/create", createWorkspace);
router.get("/all", getWorkspaces);
router.get("/:workspaceId", getWorkspace);
router.put("/:workspaceId", updateWorkspace);
router.delete('/:workspaceId', deleteWorkspace);
router.post('/:workspaceId/invite', inviteMember);
router.post('/:workspaceId/invite/accept', acceptInvite);
router.post('/:workspaceId/invite/reject', rejectInvite);
router.delete('/:workspaceId/members/:userId', removeMember);
router.put('/:workspaceId/members/:userId/role', updateMemberRole);
router.get('/:workspaceId/members', getWorkspaceMembers);
router.post('/:workspaceId/leave', leaveWorkspace);

export default router; 