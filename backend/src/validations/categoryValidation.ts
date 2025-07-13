import { z } from "zod";

// Create category validation schema
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name must be less than 50 characters"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color").default("#3B82F6"),
  icon: z.string().max(20, "Icon must be less than 20 characters").optional(),
  parentId: z.string().optional(), // For nested categories
  
  // Settings
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  sortOrder: z.number().min(0).default(0),
  
  // AI Settings
  autoClassify: z.boolean().default(false),
  aiKeywords: z.array(z.string().min(1, "Keyword cannot be empty")).optional(),
});

// Update category validation schema (partial)
export const updateCategorySchema = createCategorySchema.partial().extend({
  name: z.string().min(1, "Category name is required").max(50, "Category name must be less than 50 characters").optional(),
});

// Category ID validation schema
export const categoryIdSchema = z.object({
  id: z.string().min(1, "Category ID is required"),
});

// Get categories query validation schema
export const getCategoriesQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default(1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default(20),
  isDefault: z.string().transform(val => val === "true").optional(),
  isPublic: z.string().transform(val => val === "true").optional(),
  parentId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt", "sortOrder", "itemCount"]).default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Reorder categories validation schema
export const reorderCategoriesSchema = z.object({
  categoryOrders: z.array(z.object({
    categoryId: z.string().min(1, "Category ID is required"),
    sortOrder: z.number().min(0, "Sort order must be non-negative"),
  })).min(1, "At least one category order must be provided").max(100, "Cannot reorder more than 100 categories at once"),
});

// Get category items query validation schema
export const getCategoryItemsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default(1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default(20),
  type: z.enum(["text", "image", "video", "link", "document", "audio"]).optional(),
  isPublic: z.string().transform(val => val === "true").optional(),
  isFavorite: z.string().transform(val => val === "true").optional(),
  isArchived: z.string().transform(val => val === "true").optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(["title", "createdAt", "updatedAt", "viewCount", "lastViewedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Bulk categorize validation schema
export const bulkCategorizeSchema = z.object({
  itemIds: z.array(z.string().min(1, "Item ID is required")).min(1, "At least one item ID must be provided").max(100, "Cannot categorize more than 100 items at once"),
  categoryIds: z.array(z.string().min(1, "Category ID is required")).min(1, "At least one category ID must be provided").max(20, "Cannot assign to more than 20 categories at once"),
  operation: z.enum(["add", "replace", "remove"]).default("add"),
});

// Export types for TypeScript
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoriesQueryInput = z.infer<typeof getCategoriesQuerySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
export type GetCategoryItemsQueryInput = z.infer<typeof getCategoryItemsQuerySchema>;
export type BulkCategorizeInput = z.infer<typeof bulkCategorizeSchema>; 