import { ObjectId } from "mongoose";
import { SharePermission } from "../../config/common";

export interface ICollaboration {
    _id: ObjectId;
    itemId: ObjectId;
    ownerId: ObjectId;
    
    // Real-time Collaboration
    activeUsers: Array<{
      userId: ObjectId;
      socketId: string;
      cursor?: {
        position: number;
        selection?: { start: number; end: number };
      };
      lastSeen: Date;
    }>;
    
    // Permissions
    collaborators: Array<{
    userId: ObjectId;
      permission: SharePermission;
      addedAt: Date;
      addedBy: ObjectId;
    }>;
    
    // Settings
    isActive: boolean;
    allowAnonymous: boolean;
    
    // Version Control
    currentVersion: number;
    
    createdAt: Date;
    updatedAt: Date;
  }
  