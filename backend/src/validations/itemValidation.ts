import { z } from "zod";

// Create item validation schema
export const createItemSchema = z.object({
  type: z.enum(["text", "image", "video", "link", "document", "audio"] as const),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().optional(),
  url: z.string().url().optional(),
  
  // Metadata
  metadata: z.object({
    size: z.number().optional(),
    duration: z.number().optional(),
    dimensions: z.object({
      width: z.number().optional(),
      height: z.number().optional(),
    }).optional(),
    socialPlatform: z.enum([
      "twitter", "instagram", "youtube", "linkedin", 
      "tiktok", "reddit", "pinterest"
    ] as const).optional(),
    author: z.string().optional(),
    description: z.string().optional(),
    publishedAt: z.string().datetime().optional(),
    language: z.string().optional(),
    wordCount: z.number().optional(),
    readingTime: z.number().optional(),
    extractedText: z.string().optional(),
  }).optional(),
  
  // Categories and tags
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string().min(1, "Tag cannot be empty")).optional(),
  workspace: z.string().optional(),
  
  // Settings
  isPublic: z.boolean().default(false),
  collaborators: z.array(z.string()).optional(),
  isFavorite: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  
  // Parent item for versioning
  parentId: z.string().optional(),
});

// Update item validation schema (partial)
export const updateItemSchema = createItemSchema.partial().extend({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
});

// Get items query validation schema
export const getItemsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default(1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default(20),
  type: z.enum(["text", "image", "video", "link", "document", "audio"]).optional(),
  isPublic: z.string().transform(val => val === "true").optional(),
  isFavorite: z.string().transform(val => val === "true").optional(),
  isArchived: z.string().transform(val => val === "true").optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
  categories: z.string().optional(),
  workspace: z.string().optional(),
  socialPlatform: z.enum([
    "twitter", "instagram", "youtube", "linkedin", 
    "tiktok", "reddit", "pinterest"
  ]).optional(),
  sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
  complexity: z.enum(["low", "medium", "high"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "viewCount", "lastViewedAt", "lastEditedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Item ID validation schema
export const itemIdSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
});

// Export types for TypeScript
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type GetItemsQueryInput = z.infer<typeof getItemsQuerySchema>; 