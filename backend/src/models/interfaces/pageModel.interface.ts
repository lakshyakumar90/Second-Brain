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
	isPublic: boolean;
	isArchived: boolean;
	isDeleted: boolean;
	viewCount: number;
	lastViewedAt?: Date;
	lastEditedAt: Date;
	lastEditedBy?: ObjectId;
	version: number;
	createdAt: Date;
	updatedAt: Date;
}


