import { ObjectId } from "mongoose";

export interface ITag {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  color?: string;
  description?: string;
  
  // Statistics
  itemCount: number;
  usageCount: number;
  
  // Settings
  isDefault: boolean;
  isPublic: boolean;
  sortOrder: number;
  
  // AI Settings
  autoSuggest: boolean;
  aiKeywords: string[];
  
  // Soft delete fields
  isDeleted: boolean;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
