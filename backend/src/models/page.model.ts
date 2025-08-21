import mongoose from 'mongoose';
import { IPage } from './interfaces/pageModel.interface';

const PageSchema = new mongoose.Schema<IPage>({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	title: { type: String, required: true, trim: true, default: 'Untitled' },
	content: { type: String },
	editorState: { type: mongoose.Schema.Types.Mixed, required: true },
	summary: { type: String },
	tags: [{ type: String, trim: true }],
	categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
	isPublic: { type: Boolean, default: false },
	isArchived: { type: Boolean, default: false },
	isDeleted: { type: Boolean, default: false },
	viewCount: { type: Number, default: 0 },
	lastViewedAt: { type: Date },
	lastEditedAt: { type: Date },
	lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	version: { type: Number, default: 1 },
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
});

PageSchema.index({ userId: 1, isDeleted: 1, updatedAt: -1 });
PageSchema.index({ title: 'text', content: 'text' });

const Page = mongoose.model<IPage>('Page', PageSchema);
export default Page;


