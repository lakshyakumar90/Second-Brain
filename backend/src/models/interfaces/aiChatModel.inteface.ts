import { ObjectId } from "mongoose";

export interface IAIChat {
    _id: ObjectId;
    userId: ObjectId;
    title: string;
    
    // Chat Messages
    messages: Array<{
      id: ObjectId;
      role: 'user' | 'assistant' | 'system';
      content: string;
      timestamp: Date;
      
      // Context
    relatedItems?: ObjectId[];
      attachments?: ObjectId[];
      
      // Metadata
      tokens?: number;
      model?: string;
      temperature?: number;
    }>;
    
    // Settings
    isActive: boolean;
    
    // Context
    contextItems: ObjectId[];   
    
    createdAt: Date;
    updatedAt: Date;
  }