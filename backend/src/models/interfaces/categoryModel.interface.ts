import { ObjectId } from "mongoose";

export interface ICategory {
    _id: ObjectId;
    userId: ObjectId;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    parentId?: string; // For nested categories
    
    // Settings
    isDefault: boolean;
    isPublic: boolean;
    sortOrder: number;
    
    // AI Settings
    autoClassify: boolean;
    aiKeywords: string[];
    
    // Statistics
    itemCount: number;
    
    // Soft delete fields
    isDeleted: boolean;
    deletedAt?: Date;
    
    createdAt: Date;
    updatedAt: Date;
  }