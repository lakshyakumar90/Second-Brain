import { ObjectId } from "mongoose";
import { SharePermission } from "../../config/common";

export interface IShare {
    _id: ObjectId;
    itemId: ObjectId;
    userId: ObjectId;
    shareId: string;
    
    // Access Control
    isPublic: boolean;
    password?: string;
    permission: SharePermission;
    
    // Settings
    allowComments: boolean;
    allowDownload: boolean;
    showMetadata: boolean;
    
    // Expiration
    expiresAt?: Date;
    
    // Analytics
    accessCount: number;
    uniqueViews: number;
    lastAccessedAt?: Date;
    
    // Access Log
    accessLog: Array<{
      ip: string; 
      userAgent: string;
      accessedAt: Date;
      userId?: ObjectId;
    }>;
    
    createdAt: Date;
    updatedAt: Date;
  }