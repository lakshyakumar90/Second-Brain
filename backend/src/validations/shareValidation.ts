import { z } from "zod";

export const shareIdSchema = z.object({
  shareId: z.string().min(1, "Share ID is required"),
});

export const updateShareSchema = z.object({
  isPublic: z.boolean().optional(),
  password: z.string().optional(),
  permission: z.enum(["view", "edit", "admin"]).optional(),
  allowComments: z.boolean().optional(),
  allowDownload: z.boolean().optional(),
  showMetadata: z.boolean().optional(),
  expiresAt: z.coerce.date().optional(),
}); 