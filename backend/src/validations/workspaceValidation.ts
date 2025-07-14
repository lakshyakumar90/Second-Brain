import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string()
    .min(1, "Workspace name is required")
    .max(100, "Workspace name must be less than 100 characters")
    .trim(),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  isPublic: z.boolean().default(false),
  allowInvites: z.boolean().default(true),
  settings: z.object({
    theme: z.enum(["light", "dark", "system"]).default("system"),
    defaultView: z.enum(["grid", "list", "kanban"]).default("grid"),
    aiEnabled: z.boolean().default(true),
  }).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string()
    .min(1, "Workspace name is required")
    .max(100, "Workspace name must be less than 100 characters")
    .trim()
    .optional(),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  isPublic: z.boolean().optional(),
  allowInvites: z.boolean().optional(),
  settings: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    defaultView: z.enum(["grid", "list", "kanban"]).optional(),
    aiEnabled: z.boolean().optional(),
  }).optional(),
});

export const workspaceIdSchema = z.object({
  workspaceId: z.string()
    .min(1, "Workspace ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid workspace ID format"),
}); 