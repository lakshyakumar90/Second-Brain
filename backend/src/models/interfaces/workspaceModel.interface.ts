import { ObjectId } from "mongoose";
import { SharePermission } from "../../config/common";

export interface IWorkspace {
    _id: ObjectId;
    name: string;
    description?: string;
    ownerId: ObjectId;
    
    // Members
    members: Array<{
      userId: ObjectId;
      role: SharePermission;
      joinedAt: Date;
      invitedBy: ObjectId;
    }>;
    
    // Settings
    isPublic: boolean;
    allowInvites: boolean;
    settings: {
      theme: string;
      defaultView: string;
      aiEnabled: boolean;
    };
    
    // Statistics
    totalItems: number;
    totalMembers: number;
    // Soft delete
    isDeleted: boolean;
    deletedAt?: Date;
    // Invitation system
    pendingInvites: Array<{
      userId: ObjectId;
      invitedBy: ObjectId;
      role: string;
      invitedAt: Date;
    }>;
    
    createdAt: Date;
    updatedAt: Date;
  }
  