import { ObjectId } from "mongoose";
import { NotificationType } from "../../config/common";

export interface INotification {
    _id: ObjectId;
    userId: ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    
    // Related Data
    relatedId?: ObjectId; // Item, Share, Comment ID
    relatedType?: 'item' | 'share' | 'comment' | 'workspace';
    
    // Sender
    senderId?: ObjectId;
    
    // Status
    isRead: boolean;
    readAt?: Date;
    
    // Action
    actionUrl?: string;
    
    createdAt: Date;
    updatedAt: Date;
  }

  