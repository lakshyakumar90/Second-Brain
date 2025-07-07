import { ObjectId } from "mongoose";
import { ActivityType } from "../../config/common";

export interface IActivityLog {
    _id: ObjectId;
    userId: ObjectId;
    action: ActivityType;
    resourceType: 'item' | 'category' | 'workspace' | 'share' | 'collaboration' | 'aiChat';
    resourceId: ObjectId;
    
    // Details
    details?: {
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      metadata?: Record<string, any>;
    };
    
    // Context
    ip?: string; 
    userAgent?: string;
    
    createdAt: Date;
  }