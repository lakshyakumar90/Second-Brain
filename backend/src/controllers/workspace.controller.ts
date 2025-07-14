import { Request, Response } from "express";
import Workspace from "../models/workspace.model";
import { formatZodError } from "../utils/validationUtils";
import { createWorkspaceSchema, updateWorkspaceSchema, workspaceIdSchema } from "../validations/workspaceValidation";
import User from "../models/user.model";
import { SharePermission } from "../config/common";

interface AuthRequest extends Request {
  user?: any;
}

const createWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = createWorkspaceSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: validationResult.error.issues
      });
      return;
    }

    const { name, description, isPublic, allowInvites, settings } = validationResult.data;

    // Check if user already has a workspace with the same name
    const existingWorkspace = await Workspace.findOne({
      ownerId: req.user.userId,
      name: name.trim()
    });

    if (existingWorkspace) {
      res.status(400).json({ message: "You already have a workspace with this name" });
      return;
    }

    // Create workspace with owner as first member
    const workspace = await Workspace.create({
      name: name.trim(),
      description: description?.trim(),
      ownerId: req.user.userId,
      isPublic,
      allowInvites,
      settings: {
        theme: settings?.theme || "system",
        defaultView: settings?.defaultView || "grid",
        aiEnabled: settings?.aiEnabled !== false, // Default to true
      },
      members: [{
        userId: req.user.userId,
        role: "admin",
        joinedAt: new Date(),
        invitedBy: req.user.userId
      }],
      totalMembers: 1
    });

    // Populate owner details
    await workspace.populate('ownerId', 'name username email avatar');

    res.status(201).json({
      message: "Workspace created successfully",
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        ownerId: workspace.ownerId,
        isPublic: workspace.isPublic,
        allowInvites: workspace.allowInvites,
        settings: workspace.settings,
        totalItems: workspace.totalItems,
        totalMembers: workspace.totalMembers,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt
      }
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ message: "Error creating workspace" });
  }
};

const getWorkspaces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;

    // Get workspaces where user is owner or member
    const workspaces = await Workspace.find({
      $or: [
        { ownerId: userId },
        { "members.userId": userId }
      ]
    })
    .populate('ownerId', 'name username email avatar')
    .populate('members.userId', 'name username email avatar')
    .sort({ updatedAt: -1 });

    // Transform the data to include user's role in each workspace
    const workspacesWithRole = workspaces.map(workspace => {
      const userMember = workspace.members.find(
        (member: any) => member.userId._id.toString() === userId
      );
      
      return {
        _id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        ownerId: workspace.ownerId,
        isPublic: workspace.isPublic,
        allowInvites: workspace.allowInvites,
        settings: workspace.settings,
        totalItems: workspace.totalItems,
        totalMembers: workspace.totalMembers,
        userRole: userMember?.role || (workspace.ownerId.toString() === userId ? 'admin' : 'view'),
        isOwner: workspace.ownerId.toString() === userId,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt
      };
    });

    res.status(200).json({
      message: "Workspaces retrieved successfully",
      workspaces: workspacesWithRole,
      total: workspacesWithRole.length
    });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ message: "Error fetching workspaces" });
  }
};

const getWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    if (!workspaceId) {
      res.status(400).json({ message: "Workspace ID is required" });
      return;
    }

    // Find workspace and check if user has access
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { ownerId: userId },
        { "members.userId": userId },
        { isPublic: true }
      ]
    })
    .populate('ownerId', 'name username email avatar')
    .populate('members.userId', 'name username email avatar')
    .populate('members.invitedBy', 'name username email avatar');

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found or access denied" });
      return;
    }

    // Determine user's role in this workspace
    const userMember = workspace.members.find(
      (member: any) => member.userId._id.toString() === userId
    );
    
    const userRole = userMember?.role || 
      (workspace.ownerId.toString() === userId ? 'admin' : 'view');

    const isOwner = workspace.ownerId.toString() === userId;

    res.status(200).json({
      message: "Workspace retrieved successfully",
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        ownerId: workspace.ownerId,
        isPublic: workspace.isPublic,
        allowInvites: workspace.allowInvites,
        settings: workspace.settings,
        totalItems: workspace.totalItems,
        totalMembers: workspace.totalMembers,
        members: workspace.members,
        userRole,
        isOwner,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    res.status(500).json({ message: "Error fetching workspace" });
  }
};

const updateWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate workspace ID parameter
    const idValidationResult = workspaceIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: idValidationResult.error.issues
      });
      return;
    }

    // Validate request body
    const bodyValidationResult = updateWorkspaceSchema.safeParse(req.body);
    if (!bodyValidationResult.success) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: bodyValidationResult.error.issues
      });
      return;
    }

    const { workspaceId } = idValidationResult.data;
    const updateData = bodyValidationResult.data;
    const userId = req.user.userId;

    // Find workspace and check if user has admin access
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { ownerId: userId },
        { "members.userId": userId, "members.role": { $in: ["admin"] } }
      ]
    });

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found or access denied" });
      return;
    }

    // Check if user is owner or admin
    const userMember = workspace.members.find(
      (member: any) => member.userId.toString() === userId
    );
    
    const isOwner = workspace.ownerId.toString() === userId;
    const isAdmin = userMember?.role === 'admin' || isOwner;

    if (!isAdmin) {
      res.status(403).json({ message: "Insufficient permissions to update workspace" });
      return;
    }

    // If name is being updated, check for duplicates (excluding current workspace)
    if (updateData.name && updateData.name.trim() !== workspace.name) {
      const existingWorkspace = await Workspace.findOne({
        ownerId: userId,
        name: updateData.name.trim(),
        _id: { $ne: workspaceId }
      });

      if (existingWorkspace) {
        res.status(400).json({ message: "You already have a workspace with this name" });
        return;
      }
    }

    // Prepare update object
    const updateObject: any = {};
    
    if (updateData.name !== undefined) {
      updateObject.name = updateData.name.trim();
    }
    if (updateData.description !== undefined) {
      updateObject.description = updateData.description?.trim();
    }
    if (updateData.isPublic !== undefined) {
      updateObject.isPublic = updateData.isPublic;
    }
    if (updateData.allowInvites !== undefined) {
      updateObject.allowInvites = updateData.allowInvites;
    }
    if (updateData.settings) {
      updateObject.settings = {
        ...workspace.settings,
        ...updateData.settings
      };
    }

    // Update the workspace
    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      updateObject,
      { new: true, runValidators: true }
    )
    .populate('ownerId', 'name username email avatar')
    .populate('members.userId', 'name username email avatar')
    .populate('members.invitedBy', 'name username email avatar');

    if (!updatedWorkspace) {
      res.status(500).json({ message: "Error updating workspace" });
      return;
    }

    // Determine user's role in the updated workspace
    const updatedUserMember = updatedWorkspace.members.find(
      (member: any) => member.userId._id.toString() === userId
    );
    
    const userRole = updatedUserMember?.role || 
      (updatedWorkspace.ownerId.toString() === userId ? 'admin' : 'view');

    const updatedIsOwner = updatedWorkspace.ownerId.toString() === userId;

    res.status(200).json({
      message: "Workspace updated successfully",
      workspace: {
        _id: updatedWorkspace._id,
        name: updatedWorkspace.name,
        description: updatedWorkspace.description,
        ownerId: updatedWorkspace.ownerId,
        isPublic: updatedWorkspace.isPublic,
        allowInvites: updatedWorkspace.allowInvites,
        settings: updatedWorkspace.settings,
        totalItems: updatedWorkspace.totalItems,
        totalMembers: updatedWorkspace.totalMembers,
        members: updatedWorkspace.members,
        userRole,
        isOwner: updatedIsOwner,
        createdAt: updatedWorkspace.createdAt,
        updatedAt: updatedWorkspace.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({ message: "Error updating workspace" });
  }
};

const deleteWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate workspace ID parameter
    const idValidationResult = workspaceIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: idValidationResult.error.issues
      });
      return;
    }

    const { workspaceId } = idValidationResult.data;
    const userId = req.user.userId;

    // Find workspace and check if user has admin access
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      isDeleted: false,
      $or: [
        { ownerId: userId },
        { "members.userId": userId, "members.role": { $in: ["admin"] } }
      ]
    });

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found or access denied" });
      return;
    }

    // Check if user is owner or admin
    const userMember = workspace.members.find(
      (member: any) => member.userId.toString() === userId
    );
    const isOwner = workspace.ownerId.toString() === userId;
    const isAdmin = userMember?.role === 'admin' || isOwner;
    if (!isAdmin) {
      res.status(403).json({ message: "Insufficient permissions to delete workspace" });
      return;
    }

    // SOFT DELETE: Set isDeleted and deletedAt. A cron job will permanently delete records older than 1 day.
    workspace.isDeleted = true;
    workspace.deletedAt = new Date();
    await workspace.save();

    res.status(200).json({
      message: "Workspace deleted (soft delete). Will be permanently deleted after 1 day.",
      workspaceId: workspace._id
    });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({ message: "Error deleting workspace" });
  }
};

const inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate workspace ID parameter
    const idValidationResult = workspaceIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({ message: "Validation failed", errors: idValidationResult.error.issues });
      return;
    }
    const { workspaceId } = idValidationResult.data;
    const { email, role = "view" } = req.body;
    const userId = req.user.userId;

    if (!email || typeof email !== "string") {
      res.status(400).json({ message: "Email is required to invite a member." });
      return;
    }

    // Find workspace
    const workspace = await Workspace.findOne({ _id: workspaceId, isDeleted: false });
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Check if invites are allowed
    if (!workspace.allowInvites) {
      res.status(403).json({ message: "Invites are not allowed for this workspace" });
      return;
    }

    // Check if user is owner or admin
    const userMember = workspace.members.find((member: any) => member.userId.toString() === userId);
    const isOwner = workspace.ownerId.toString() === userId;
    const isAdmin = userMember?.role === 'admin' || isOwner;
    if (!isAdmin) {
      res.status(403).json({ message: "Insufficient permissions to invite members" });
      return;
    }

    // Find the user to invite
    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (!invitedUser) {
      res.status(404).json({ message: "User with this email does not exist" });
      return;
    }

    // Check if already a member
    const alreadyMember = workspace.members.some((member: any) => member.userId.toString() === invitedUser._id.toString());
    if (alreadyMember || workspace.ownerId.toString() === invitedUser._id.toString()) {
      res.status(400).json({ message: "User is already a member of this workspace" });
      return;
    }

    // Check if already invited
    const alreadyInvited = workspace.pendingInvites.some((invite: any) => invite.userId.toString() === invitedUser._id.toString());
    if (alreadyInvited) {
      res.status(400).json({ message: "User is already invited to this workspace" });
      return;
    }

    // Add to pendingInvites
    workspace.pendingInvites.push({
      userId: invitedUser._id,
      invitedBy: userId,
      role,
      invitedAt: new Date()
    });
    await workspace.save();

    // Optionally, send an email notification here

    res.status(200).json({
      message: `User invited successfully to workspace as ${role}. Invitation pending acceptance.`,
      invitedUser: {
        _id: invitedUser._id,
        name: invitedUser.name,
        email: invitedUser.email,
        role
      }
    });
  } catch (error) {
    console.error("Error inviting member:", error);
    res.status(500).json({ message: "Error inviting member" });
  }
};

const acceptInvite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idValidationResult = workspaceIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({ message: "Validation failed", errors: idValidationResult.error.issues });
      return;
    }
    const { workspaceId } = idValidationResult.data;
    const userId = req.user.userId;

    // Find workspace
    const workspace = await Workspace.findOne({ _id: workspaceId, isDeleted: false });
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Find invite
    const inviteIndex = workspace.pendingInvites.findIndex((invite: any) => invite.userId.toString() === userId);
    if (inviteIndex === -1) {
      res.status(404).json({ message: "No pending invite found for this user" });
      return;
    }
    const invite = workspace.pendingInvites[inviteIndex];

    // Add to members
    workspace.members.push({
      userId: invite.userId,
      role: invite.role as "view" | "edit" | "admin",
      joinedAt: new Date(),
      invitedBy: invite.invitedBy
    });
    workspace.totalMembers = workspace.members.length;
    // Remove from pendingInvites
    workspace.pendingInvites.splice(inviteIndex, 1);
    await workspace.save();

    res.status(200).json({ message: "Invite accepted. You are now a member of the workspace." });
  } catch (error) {
    console.error("Error accepting invite:", error);
    res.status(500).json({ message: "Error accepting invite" });
  }
};

const rejectInvite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idValidationResult = workspaceIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({ message: "Validation failed", errors: idValidationResult.error.issues });
      return;
    }
    const { workspaceId } = idValidationResult.data;
    const userId = req.user.userId;

    // Find workspace
    const workspace = await Workspace.findOne({ _id: workspaceId, isDeleted: false });
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Find invite
    const inviteIndex = workspace.pendingInvites.findIndex((invite: any) => invite.userId.toString() === userId);
    if (inviteIndex === -1) {
      res.status(404).json({ message: "No pending invite found for this user" });
      return;
    }
    // Remove from pendingInvites
    workspace.pendingInvites.splice(inviteIndex, 1);
    await workspace.save();

    res.status(200).json({ message: "Invite rejected." });
  } catch (error) {
    console.error("Error rejecting invite:", error);
    res.status(500).json({ message: "Error rejecting invite" });
  }
};

const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate workspace ID
    const idValidationResult = workspaceIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({ message: "Validation failed", errors: idValidationResult.error.issues });
      return;
    }
    const { workspaceId, userId } = req.params;
    const actingUserId = req.user.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID to remove is required." });
      return;
    }

    // Find workspace
    const workspace = await Workspace.findOne({ _id: workspaceId, isDeleted: false });
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Cannot remove the owner
    if (workspace.ownerId.toString() === userId) {
      res.status(400).json({ message: "Cannot remove the owner from the workspace" });
      return;
    }

    // Only owner or admin can remove
    const actingMember = workspace.members.find((member: any) => member.userId.toString() === actingUserId);
    const isOwner = workspace.ownerId.toString() === actingUserId;
    const isAdmin = actingMember?.role === 'admin' || isOwner;
    if (!isAdmin) {
      res.status(403).json({ message: "Insufficient permissions to remove members" });
      return;
    }

    // Check if user is a member
    const memberIndex = workspace.members.findIndex((member: any) => member.userId.toString() === userId);
    if (memberIndex === -1) {
      res.status(404).json({ message: "User is not a member of this workspace" });
      return;
    }

    // Remove member
    workspace.members.splice(memberIndex, 1);
    workspace.totalMembers = workspace.members.length;
    await workspace.save();

    res.status(200).json({
      message: "Member removed successfully",
      removedUserId: userId
    });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Error removing member" });
  }
};

const updateMemberRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idValidationResult = workspaceIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({ message: "Validation failed", errors: idValidationResult.error.issues });
      return;
    }
    const { workspaceId, userId } = req.params;
    const { role } = req.body;
    const actingUserId = req.user.userId;

    if (!userId || !role) {
      res.status(400).json({ message: "User ID and new role are required." });
      return;
    }
    if (!['view', 'edit', 'admin'].includes(role)) {
      res.status(400).json({ message: "Invalid role." });
      return;
    }

    // Find workspace
    const workspace = await Workspace.findOne({ _id: workspaceId, isDeleted: false });
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Cannot change owner's role
    if (workspace.ownerId.toString() === userId) {
      res.status(400).json({ message: "Cannot change the owner's role" });
      return;
    }

    // Only owner or admin can change
    const actingMember = workspace.members.find((member: any) => member.userId.toString() === actingUserId);
    const isOwner = workspace.ownerId.toString() === actingUserId;
    const isAdmin = actingMember?.role === 'admin' || isOwner;
    if (!isAdmin) {
      res.status(403).json({ message: "Insufficient permissions to change member roles" });
      return;
    }

    // Find member
    const member = workspace.members.find((member: any) => member.userId.toString() === userId);
    if (!member) {
      res.status(404).json({ message: "User is not a member of this workspace" });
      return;
    }

    member.role = role as SharePermission;
    await workspace.save();

    res.status(200).json({ message: "Member role updated successfully", userId, role });
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(500).json({ message: "Error updating member role" });
  }
};

const getWorkspaceMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idValidationResult = workspaceIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({ message: "Validation failed", errors: idValidationResult.error.issues });
      return;
    }
    const { workspaceId } = idValidationResult.data;

    const workspace = await Workspace.findOne({ _id: workspaceId, isDeleted: false })
      .populate('members.userId', 'name email username avatar')
      .populate('members.invitedBy', 'name email username')
      .populate('pendingInvites.userId', 'name email username avatar')
      .populate('pendingInvites.invitedBy', 'name email username');

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    res.status(200).json({
      members: workspace.members,
      pendingInvites: workspace.pendingInvites
    });
  } catch (error) {
    console.error("Error getting workspace members:", error);
    res.status(500).json({ message: "Error getting workspace members" });
  }
};

const leaveWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idValidationResult = workspaceIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({ message: "Validation failed", errors: idValidationResult.error.issues });
      return;
    }
    const { workspaceId } = idValidationResult.data;
    const userId = req.user.userId;

    const workspace = await Workspace.findOne({ _id: workspaceId, isDeleted: false });
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Owner cannot leave
    if (workspace.ownerId.toString() === userId) {
      res.status(400).json({ message: "Owner cannot leave the workspace" });
      return;
    }

    // Remove from members
    const memberIndex = workspace.members.findIndex((member: any) => member.userId.toString() === userId);
    if (memberIndex === -1) {
      res.status(404).json({ message: "You are not a member of this workspace" });
      return;
    }
    workspace.members.splice(memberIndex, 1);
    workspace.totalMembers = workspace.members.length;
    await workspace.save();

    res.status(200).json({ message: "You have left the workspace" });
  } catch (error) {
    console.error("Error leaving workspace:", error);
    res.status(500).json({ message: "Error leaving workspace" });
  }
};

export {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  acceptInvite,
  rejectInvite,
  updateMemberRole,
  getWorkspaceMembers,
  leaveWorkspace
};
