import { z } from "zod";

// Create tag validation schema
export const createTagSchema = z.object({
  name: z.string()
    .min(1, "Tag name is required")
    .max(30, "Tag name must be less than 30 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Tag name can only contain letters, numbers, spaces, hyphens, and underscores"),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color")
    .default("#6B7280"),
  description: z.string()
    .max(100, "Description must be less than 100 characters")
    .optional(),
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  sortOrder: z.number().min(0).default(0),
  autoSuggest: z.boolean().default(false),
  aiKeywords: z.array(z.string().min(1, "Keyword cannot be empty")).optional(),
});

// Update tag validation schema (partial)
export const updateTagSchema = createTagSchema.partial().extend({
  name: z.string()
    .min(1, "Tag name is required")
    .max(30, "Tag name must be less than 30 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Tag name can only contain letters, numbers, spaces, hyphens, and underscores")
    .optional(),
});

// Tag ID validation schema
export const tagIdSchema = z.object({
  tagId: z.string().min(1, "Tag ID is required"),
});

// Get tags query validation schema
export const getTagsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  isDefault: z.coerce.boolean().optional(),
  isPublic: z.coerce.boolean().optional(),
  sortBy: z.enum(["name", "usageCount", "itemCount", "createdAt", "updatedAt", "sortOrder"]).default("usageCount"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Bulk operations validation schema
export const bulkTagOperationsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
});

// Tag suggestions query schema
export const getTagSuggestionsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  limit: z.coerce.number().min(1).max(50).default(10),
});
