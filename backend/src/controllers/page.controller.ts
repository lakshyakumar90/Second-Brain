import { Response } from 'express';
import { Page } from '../models';
import { AuthRequest } from '../models/interfaces/userModel.interface';
import { createPageSchema, updatePageSchema, pageIdSchema } from '../validations/pageValidation';

export const createPage = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user?.userId) {
			res.status(401).json({ message: 'Unauthorized', error: 'Authentication required' });
			return;
		}
		const parsed = createPageSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({ message: 'Validation failed', error: parsed.error.issues });
			return;
		}
		const data = parsed.data;
		const page = await Page.create({
			userId: req.user.userId,
			title: data.title || 'Untitled',
			content: data.content,
			editorState: data.editorState,
			tags: data.tags || [],
			categories: data.categories || [],
			isPublic: !!data.isPublic,
			isArchived: !!data.isArchived,
			isDeleted: false,
			lastEditedAt: new Date(),
			lastEditedBy: req.user.userId,
			version: 1,
		});
		res.status(201).json({ message: 'Page created', page });
	} catch (error) {
		console.error('Error creating page:', error);
		res.status(500).json({ 
			message: 'Error creating page', 
			error: error instanceof Error ? error.message : 'Internal server error' 
		});
	}
};

export const getPages = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user?.userId) {
			res.status(401).json({ message: 'Unauthorized', error: 'Authentication required' });
			return;
		}
		const page = Number(req.query.page || 1);
		const limit = Number(req.query.limit || 20);
		const skip = (page - 1) * limit;
		const [pages, total] = await Promise.all([
			Page.find({ userId: req.user.userId, isDeleted: false }).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
			Page.countDocuments({ userId: req.user.userId, isDeleted: false }),
		]);
		res.status(200).json({
			message: 'Pages retrieved',
			data: {
				pages,
				pagination: {
					currentPage: page,
					totalPages: Math.ceil(total / limit),
					totalItems: total,
					itemsPerPage: limit,
					hasNextPage: page * limit < total,
					hasPrevPage: page > 1,
				},
			},
		});
	} catch (error) {
		res.status(500).json({ message: 'Error retrieving pages', error: 'Internal server error' });
	}
};

export const getPage = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user?.userId) {
			res.status(401).json({ message: 'Unauthorized', error: 'Authentication required' });
			return;
		}
		const parsed = pageIdSchema.safeParse(req.params);
		if (!parsed.success) {
			res.status(400).json({ message: 'Validation failed', error: parsed.error.issues });
			return;
		}
		const { pageId } = parsed.data;
		const page = await Page.findOne({ _id: pageId, userId: req.user.userId, isDeleted: false }).lean();
		if (!page) {
			res.status(404).json({ message: 'Page not found', error: 'Not found' });
			return;
		}
		await Page.findByIdAndUpdate(pageId, { $inc: { viewCount: 1 }, lastViewedAt: new Date() });
		res.status(200).json({ message: 'Page retrieved', page: { ...page, viewCount: page.viewCount + 1 } });
	} catch (error) {
		res.status(500).json({ message: 'Error retrieving page', error: 'Internal server error' });
	}
};

export const updatePage = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user?.userId) {
			res.status(401).json({ message: 'Unauthorized', error: 'Authentication required' });
			return;
		}
		const idParsed = pageIdSchema.safeParse(req.params);
		if (!idParsed.success) {
			res.status(400).json({ message: 'Validation failed', error: idParsed.error.issues });
			return;
		}
		const dataParsed = updatePageSchema.safeParse(req.body);
		if (!dataParsed.success) {
			res.status(400).json({ message: 'Validation failed', error: dataParsed.error.issues });
			return;
		}
		const { pageId } = idParsed.data;
		const existing = await Page.findOne({ _id: pageId, userId: req.user.userId, isDeleted: false });
		if (!existing) {
			res.status(404).json({ message: 'Page not found', error: 'Not found' });
			return;
		}
		const updated = await Page.findByIdAndUpdate(
			pageId,
			{ ...dataParsed.data, lastEditedAt: new Date(), lastEditedBy: req.user.userId, version: existing.version + 1 },
			{ new: true, runValidators: true }
		);
		res.status(200).json({ message: 'Page updated', page: updated });
	} catch (error) {
		res.status(500).json({ message: 'Error updating page', error: 'Internal server error' });
	}
};

export const deletePage = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user?.userId) {
			res.status(401).json({ message: 'Unauthorized', error: 'Authentication required' });
			return;
		}
		const parsed = pageIdSchema.safeParse(req.params);
		if (!parsed.success) {
			res.status(400).json({ message: 'Validation failed', error: parsed.error.issues });
			return;
		}
		const { pageId } = parsed.data;
		const existing = await Page.findOne({ _id: pageId, userId: req.user.userId, isDeleted: false });
		if (!existing) {
			res.status(404).json({ message: 'Page not found', error: 'Not found' });
			return;
		}
		const deleted = await Page.findByIdAndUpdate(pageId, { isDeleted: true, lastEditedAt: new Date(), lastEditedBy: req.user.userId, version: existing.version + 1 }, { new: true });
		res.status(200).json({ message: 'Page deleted', page: deleted });
	} catch (error) {
		res.status(500).json({ message: 'Error deleting page', error: 'Internal server error' });
	}
};


