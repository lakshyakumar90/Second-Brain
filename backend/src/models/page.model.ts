import mongoose from 'mongoose';
import { IPage } from './interfaces/pageModel.interface';

const PageSchema = new mongoose.Schema<IPage>({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	title: { type: String, required: true, trim: true, default: 'Untitled' },
	content: { type: String },
	editorState: { 
		type: mongoose.Schema.Types.Mixed, 
		default: {
			root: {
				children: [
					{
						children: [],
						direction: null,
						format: "",
						indent: 0,
						type: "paragraph",
						version: 1
					}
				],
				direction: null,
				format: "",
				indent: 0,
				type: "root",
				version: 1
			}
		}
	},
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
	
	// Attachments
	attachments: [{
		originalName: { type: String, required: true },
		filename: { type: String, required: true },
		url: { type: String, required: true },
		publicId: { type: String, required: true },
		size: { type: Number, required: true },
		mimetype: { type: String, required: true },
		uploadedAt: { type: Date, default: Date.now },
		uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
	}],
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
});

PageSchema.index({ userId: 1, isDeleted: 1, updatedAt: -1 });
PageSchema.index({ title: 'text', content: 'text' });

const Page = mongoose.model<IPage>('Page', PageSchema);
export default Page;


