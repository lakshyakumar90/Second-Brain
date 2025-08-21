import { z } from 'zod';

export const createPageSchema = z.object({
	title: z.string().min(1).max(200).default('Untitled').optional(),
	content: z.string().optional(),
	editorState: z.any(),
	tags: z.array(z.string()).optional(),
	categories: z.array(z.string()).optional(),
	isPublic: z.boolean().optional(),
	isArchived: z.boolean().optional(),
});

export const updatePageSchema = z.object({
	title: z.string().min(1).max(200).optional(),
	content: z.string().optional(),
	editorState: z.any().optional(),
	tags: z.array(z.string()).optional(),
	categories: z.array(z.string()).optional(),
	isPublic: z.boolean().optional(),
	isArchived: z.boolean().optional(),
});

export const pageIdSchema = z.object({
	pageId: z.string().min(1),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;

