import { Request, Response } from "express";
import Workspace from "../models/workspace.model";
import { formatZodError } from "../utils/validationUtils";
import { createWorkspaceSchema, workspaceIdSchema } from "../validations/workspaceValidation";

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

export {
  createWorkspace,
  getWorkspaces,
  getWorkspace
};
