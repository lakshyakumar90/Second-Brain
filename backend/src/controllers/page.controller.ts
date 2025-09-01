import { Response } from 'express';
import { Page } from '../models';
import { AuthRequest } from '../models/interfaces/userModel.interface';
import { createPageSchema, updatePageSchema, pageIdSchema } from '../validations/pageValidation';
import { extractPlainTextFromTipTap, generateSummary } from '../utils/editorUtils';
import cloudinary from '../config/cloudinary';
import { FILE_LIMITS } from '../config/constants';
import mongoose from 'mongoose';

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
		
		// Extract plain text content from TipTap editor state
		const plainTextContent = extractPlainTextFromTipTap(data.editorState);
		const summary = generateSummary(plainTextContent);
		
		const page = await Page.create({
			userId: req.user.userId,
			title: data.title || 'Untitled',
			content: plainTextContent, // Use extracted plain text
			editorState: data.editorState,
			summary: summary, // Auto-generate summary
			tags: data.tags || [],
			categories: data.categories || [],
			workspace: data.workspace,
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
		
		// Get workspace from query params or headers
		const workspaceId = req.query.workspace as string || req.headers['x-workspace-id'] as string;
		if (!workspaceId) {
			res.status(400).json({ message: 'Workspace ID is required', error: 'Missing workspace' });
			return;
		}
		
		const page = Number(req.query.page || 1);
		const limit = Number(req.query.limit || 20);
		const skip = (page - 1) * limit;
		const [pages, total] = await Promise.all([
			Page.find({ userId: req.user.userId, workspace: workspaceId, isDeleted: false }).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
			Page.countDocuments({ userId: req.user.userId, workspace: workspaceId, isDeleted: false }),
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
		
		// Get workspace from query params or headers
		const workspaceId = req.query.workspace as string || req.headers['x-workspace-id'] as string;
		if (!workspaceId) {
			res.status(400).json({ message: 'Workspace ID is required', error: 'Missing workspace' });
			return;
		}
		
		const page = await Page.findOne({ _id: pageId, userId: req.user.userId, workspace: workspaceId, isDeleted: false }).lean();
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
		
		// Get workspace from query params or headers
		const workspaceId = req.query.workspace as string || req.headers['x-workspace-id'] as string;
		if (!workspaceId) {
			res.status(400).json({ message: 'Workspace ID is required', error: 'Missing workspace' });
			return;
		}
		
		const existing = await Page.findOne({ _id: pageId, userId: req.user.userId, workspace: workspaceId, isDeleted: false });
		if (!existing) {
			res.status(404).json({ message: 'Page not found', error: 'Not found' });
			return;
		}
		
		// Prepare update data
		const updateData = { ...dataParsed.data };
		
		// If editorState is being updated, extract plain text and generate summary
		if (updateData.editorState) {
			const plainTextContent = extractPlainTextFromTipTap(updateData.editorState);
			updateData.content = plainTextContent;
			// Only auto-generate summary if no AI summary is provided
			if (!updateData.summary) {
				const autoSummary = generateSummary(plainTextContent);
				updateData.summary = autoSummary;
			}
		}
		
		const updated = await Page.findByIdAndUpdate(
			pageId,
			{ ...updateData, lastEditedAt: new Date(), lastEditedBy: req.user.userId, version: existing.version + 1 },
			{ new: true, runValidators: true }
		);
		res.status(200).json({ message: 'Page updated', page: updated });
	} catch (error) {
		console.error('Error updating page:', error);
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
		
		// Get workspace from query params or headers
		const workspaceId = req.query.workspace as string || req.headers['x-workspace-id'] as string;
		if (!workspaceId) {
			res.status(400).json({ message: 'Workspace ID is required', error: 'Missing workspace' });
			return;
		}
		
		const existing = await Page.findOne({ _id: pageId, userId: req.user.userId, workspace: workspaceId, isDeleted: false });
		if (!existing) {
			res.status(404).json({ message: 'Page not found', error: 'Not found' });
			return;
		}
		const deleted = await Page.findByIdAndUpdate(pageId, { isDeleted: true, lastEditedAt: new Date(), lastEditedBy: req.user.userId, version: existing.version + 1 }, { new: true });
		res.status(200).json({ message: 'Page deleted', page: deleted });
	} catch (error) {
		console.error('Error deleting page:', error);
		res.status(500).json({ message: 'Error deleting page', error: 'Internal server error' });
	}
};

export const uploadAttachment = async (req: AuthRequest, res: Response) => {
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
		
		// Get workspace from query params or headers
		const workspaceId = req.query.workspace as string || req.headers['x-workspace-id'] as string;
		if (!workspaceId) {
			res.status(400).json({ message: 'Workspace ID is required', error: 'Missing workspace' });
			return;
		}
		
		const page = await Page.findOne({ _id: pageId, userId: req.user.userId, workspace: workspaceId, isDeleted: false });
		if (!page) {
			res.status(404).json({ message: 'Page not found', error: 'Not found' });
			return;
		}

		// Check if file exists
		if (!req.file) {
			res.status(400).json({ message: 'No file uploaded', error: 'Please select a file to upload' });
			return;
		}

		// Validate file type
		if (!FILE_LIMITS.ALLOWED_FILE_TYPES.includes(req.file.mimetype as any)) {
			res.status(400).json({
				message: 'Invalid file type',
				error: `File type ${req.file.mimetype} is not allowed. Allowed types: ${FILE_LIMITS.ALLOWED_FILE_TYPES.join(', ')}`
			});
			return;
		}

		// Validate file size
		if (req.file.size > FILE_LIMITS.MAX_FILE_SIZE) {
			res.status(400).json({
				message: 'File too large',
				error: `File size ${req.file.size} bytes exceeds maximum allowed size of ${FILE_LIMITS.MAX_FILE_SIZE} bytes`
			});
			return;
		}

		// Check attachment limit
		if (page.attachments.length >= FILE_LIMITS.MAX_FILES_PER_ITEM) {
			res.status(400).json({
				message: 'Attachment limit reached',
				error: `Maximum ${FILE_LIMITS.MAX_FILES_PER_ITEM} attachments allowed per page`
			});
			return;
		}

		// Upload to Cloudinary
		const result = await new Promise<any>((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					resource_type: 'auto',
					folder: `pages/${pageId}/attachments`,
					public_id: `${Date.now()}_${req.file!.originalname.replace(/\.[^/.]+$/, '')}`,
				},
				(error: any, result: any) => {
					if (error) {
						console.error('Cloudinary Error:', error);
						return reject(error);
					}
					if (result) {
						resolve(result);
					} else {
						reject(new Error('Upload failed, but no error was provided by Cloudinary.'));
					}
				}
			);
			uploadStream.end(req.file!.buffer);
		});

		// Create attachment object
		const attachment = {
			originalName: req.file.originalname,
			filename: result.public_id,
			url: result.secure_url,
			publicId: result.public_id,
			size: req.file.size,
			mimetype: req.file.mimetype,
			uploadedAt: new Date(),
			uploadedBy: new mongoose.Types.ObjectId(req.user.userId),
		};

		// Add attachment to page
		page.attachments.push(attachment);
		page.lastEditedAt = new Date();
		page.lastEditedBy = new mongoose.Types.ObjectId(req.user.userId);
		page.version += 1;
		await page.save();

		res.status(201).json({
			message: 'Attachment uploaded successfully',
			attachment,
			page: {
				_id: page._id,
				title: page.title,
				attachmentCount: page.attachments.length
			}
		});
	} catch (error) {
		console.error('Error uploading attachment:', error);
		res.status(500).json({ message: 'Error uploading attachment', error: 'Internal server error' });
	}
};

export const deleteAttachment = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user?.userId) {
			res.status(401).json({ message: 'Unauthorized', error: 'Authentication required' });
			return;
		}

		const { pageId, attachmentId } = req.params;
		
		// Validate pageId
		const pageIdParsed = pageIdSchema.safeParse({ pageId });
		if (!pageIdParsed.success) {
			res.status(400).json({ message: 'Validation failed', error: pageIdParsed.error.issues });
			return;
		}

		const page = await Page.findOne({ _id: pageId, userId: req.user.userId, isDeleted: false });
		if (!page) {
			res.status(404).json({ message: 'Page not found', error: 'Not found' });
			return;
		}

		// Find attachment
		const attachmentIndex = page.attachments.findIndex(att => (att as any)._id?.toString() === attachmentId);
		if (attachmentIndex === -1) {
			res.status(404).json({ message: 'Attachment not found', error: 'Not found' });
			return;
		}

		const attachment = page.attachments[attachmentIndex];

		// Delete from Cloudinary
		try {
			await cloudinary.uploader.destroy(attachment.publicId);
		} catch (cloudinaryError) {
			console.error('Error deleting from Cloudinary:', cloudinaryError);
			// Continue with deletion even if Cloudinary fails
		}

		// Remove attachment from page
		page.attachments.splice(attachmentIndex, 1);
		page.lastEditedAt = new Date();
		page.lastEditedBy = new mongoose.Types.ObjectId(req.user.userId);
		page.version += 1;
		await page.save();

		res.status(200).json({
			message: 'Attachment deleted successfully',
			page: {
				_id: page._id,
				title: page.title,
				attachmentCount: page.attachments.length
			}
		});
	} catch (error) {
		console.error('Error deleting attachment:', error);
		res.status(500).json({ message: 'Error deleting attachment', error: 'Internal server error' });
	}
};


