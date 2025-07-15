import { z } from "zod";

export const summarizeContentSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
});

export const suggestTagsSchema = z.object({
  itemId: z.string().min(1, "Item ID is required").optional(),
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
});

export const categorizeContentSchema = z.object({
  itemId: z.string().min(1, "Item ID is required").optional(),
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
});

export const chatWithAISchema = z.object({
  chatId: z.string().optional(),
  message: z.string().min(1, "Message is required").max(5000, "Message too long"),
  contextItemIds: z.array(z.string()).optional(),
});

export const getAIInsightsSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
});

export const generateContentSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(5000, "Prompt too long"),
  type: z.enum(["text", "image", "code"]).default("text"),
});

export const extractTextSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
});

export const analyzeContentSchema = z.object({
  itemId: z.string().min(1, "Item ID is required").optional(),
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
});

export const getAIUsageStatsSchema = z.object({
  period: z.enum(["day", "month", "all"]).default("day"),
}); 