import { Response, NextFunction } from 'express';
import { AuthRequest } from '../models/interfaces/userModel.interface';
import Workspace from '../models/workspace.model';
import Page from '../models/page.model';
import Item from '../models/item.model';

export interface PermissionCheck {
  requiredRole?: 'view' | 'edit' | 'admin';
  allowOwner?: boolean;
  checkWorkspaceParam?: string; // parameter name for workspace ID
}

export const checkWorkspacePermission = (options: PermissionCheck = {}) => {
  const { requiredRole = 'view', allowOwner = true, checkWorkspaceParam = 'workspaceId' } = options;

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      let workspaceId = req.params[checkWorkspaceParam] || req.body.workspace;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      // If checking pageId or itemId, we need to get the workspace from the page/item
      if (checkWorkspaceParam === 'pageId' && req.params.pageId) {
        const page = await Page.findById(req.params.pageId);
        if (!page) {
          res.status(404).json({ message: 'Page not found' });
          return;
        }
        workspaceId = page.workspace.toString();
      } else if (checkWorkspaceParam === 'itemId' && req.params.itemId) {
        const item = await Item.findById(req.params.itemId);
        if (!item) {
          res.status(404).json({ message: 'Item not found' });
          return;
        }
        workspaceId = item.workspace.toString();
      }

      if (!workspaceId) {
        res.status(400).json({ message: 'Workspace ID is required' });
        return;
      }

      // Find workspace and check user membership
      const workspace = await Workspace.findOne({
        _id: workspaceId,
        isDeleted: false
      });

      if (!workspace) {
        res.status(404).json({ message: 'Workspace not found' });
        return;
      }

      // Check if user is owner
      const isOwner = workspace.ownerId.toString() === userId;
      if (isOwner && allowOwner) {
        // Owner has all permissions
        req.userRole = 'admin';
        req.isOwner = true;
        next();
        return;
      }

      // Check if user is a member
      const userMember = workspace.members.find(
        (member: any) => member.userId.toString() === userId
      );

      if (!userMember) {
        res.status(403).json({ message: 'You are not a member of this workspace' });
        return;
      }

      const userRole = userMember.role;

      // Check role permissions
      const roleHierarchy = { view: 1, edit: 2, admin: 3 };
      const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
      const requiredLevel = roleHierarchy[requiredRole];

      if (userLevel < requiredLevel) {
        res.status(403).json({ 
          message: `Insufficient permissions. Required: ${requiredRole}, Your role: ${userRole}` 
        });
        return;
      }

      // Store user role and ownership in request for later use
      req.userRole = userRole;
      req.isOwner = isOwner;
      
      next();
    } catch (error) {
      console.error('Workspace permission check error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Convenience middleware functions
export const requireViewAccess = checkWorkspacePermission({ requiredRole: 'view' });
export const requireEditAccess = checkWorkspacePermission({ requiredRole: 'edit' });
export const requireAdminAccess = checkWorkspacePermission({ requiredRole: 'admin' });
