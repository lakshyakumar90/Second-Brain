import { z } from "zod";

// Create comment validation schema
export const createCommentSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  content: z.string().min(1, "Comment content is required").max(1000, "Comment must be less than 1000 characters"),
  parentId: z.string().optional(), // For threaded comments
  position: z.object({
    start: z.number().optional(),
    end: z.number().optional(),
    selectedText: z.string().optional(),
  }).optional(),
});

// Get comments query validation schema
export const getCommentsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default(1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default(20),
  parentId: z.string().optional(), // To get only top-level comments or replies
  sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Comment ID validation schema
export const commentIdSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
});

// Item ID validation schema (for getting comments by item)
export const itemIdForCommentsSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
});

// Update comment validation schema
export const updateCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment must be less than 1000 characters"),
});

// Delete comment validation schema (just needs commentId)
export const deleteCommentSchema = commentIdSchema;

// Reply to comment validation schema (same as create, but parentId required)
export const replyToCommentSchema = createCommentSchema.extend({
  parentId: z.string().min(1, "Parent comment ID is required"),
});

// Add/remove reaction validation schema
export const reactionSchema = z.object({
  type: z.enum(["like", "love", "laugh", "wow", "sad", "angry"]),
});

// Resolve comment validation schema (just needs commentId)
export const resolveCommentSchema = commentIdSchema;

// Export types for TypeScript
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type GetCommentsQueryInput = z.infer<typeof getCommentsQuerySchema>; 