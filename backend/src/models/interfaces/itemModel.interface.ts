import { ObjectId } from "mongoose";
import { ContentType, SocialPlatform } from "../../config/common";

export type BlockType = 'text' | 'heading' | 'code' | 'todo' | 'checklist';

export interface Block {
  id: string;
  type: BlockType;
  content: string | string[] | null;
  checked?: boolean;
  children?: Block[];
}

export interface IItem {
    _id: ObjectId;
    userId: ObjectId;
    type: ContentType;
    title: string;
    content?: string;
    blocks?: Block[];
    url?: string;
    
    files: Array<{
      originalName: string;
      filename: string;
      path: string;
      size: number;
      mimetype: string;
      isMain: boolean;
    }>;
    
    metadata: {
      size?: number;
      duration?: number;
      dimensions?: { width: number; height: number };
      socialPlatform?: SocialPlatform;
      author?: string;
      description?: string;
      publishedAt?: Date;
      language?: string;
      wordCount?: number;
      readingTime?: number;
      extractedText?: string;
    };
    
    categories: string[];
    tags: string[];
    workspace: string | ObjectId;
    
    aiData: {
      summary?: string;
      suggestedTags?: string[];
      suggestedCategories?: string[];
      sentiment?: 'positive' | 'negative' | 'neutral';
      keyTopics?: string[];
      complexity?: 'low' | 'medium' | 'high';
      extractedEntities?: string[];
      lastProcessedAt?: Date;
    };
    
    isPublic: boolean;
    shareId?: string;
    collaborators: string[];
    
    isFavorite: boolean;
    isArchived: boolean;
    isDeleted: boolean;
    
    viewCount: number;
    lastViewedAt: Date;
    lastEditedAt: Date;
    lastEditedBy?: string;
    
    version: number;
    parentId?: string;
    
    createdAt: Date;
    updatedAt: Date;
  }