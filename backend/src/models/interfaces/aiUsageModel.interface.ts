import { ObjectId } from "mongoose";

export interface IAIUsage {
    _id: ObjectId;
    userId: ObjectId;
    
    // Request Details
    requestType: 'summarize' | 'tag_suggest' | 'chat' | 'insights' | 'semantic_search' | 'auto_categorize';
    itemId?: ObjectId;
    chatId?: ObjectId;
    
    // Usage Metrics
    tokensUsed: number;
    processingTime: number; // milliseconds
    model: string; // e.g., 'gpt-4', 'gpt-3.5-turbo'
    
    // Cost Tracking
    cost: number; // in cents
    
    // Request Status
    status: 'success' | 'error' | 'rate_limited' | 'quota_exceeded';
    errorMessage?: string;
    
    // Metadata
    metadata?: {
      inputLength?: number;
      outputLength?: number;
      quality?: 'low' | 'medium' | 'high';
      temperature?: number;
    };
    
    createdAt: Date;
  }