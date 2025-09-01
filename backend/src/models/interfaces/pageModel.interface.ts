import { ObjectId } from 'mongodb';

export interface IPage {
	_id: ObjectId;
	userId: ObjectId;
	title: string;
	content?: string; // plain text for search/preview
	editorState?: any; // serialized Lexical/Notion JSON
	summary?: string;
	tags: string[];
	categories: string[];
	workspace: string | ObjectId;
	isPublic: boolean;
	isArchived: boolean;
	isDeleted: boolean;
	viewCount: number;
	lastViewedAt?: Date;
	lastEditedAt: Date;
	lastEditedBy?: ObjectId;
	version: number;
	
	// Attachments
	attachments: Array<{
		originalName: string;
		filename: string;
		url: string;
		publicId: string;
		size: number;
		mimetype: string;
		uploadedAt: Date;
		uploadedBy: ObjectId;
	}>;
	
	createdAt: Date;
	updatedAt: Date;
}


