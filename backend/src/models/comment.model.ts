import mongoose from "mongoose";
import { IComment } from "./interfaces/commentModel.interface";

const CommentSchema = new mongoose.Schema<IComment>({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    
    isResolved: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    
    reactions: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      type: { type: String, enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'], required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    
    position: {
      start: { type: Number },
      end: { type: Number },
      selectedText: { type: String }
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure either itemId or pageId is provided (but not both)
CommentSchema.pre('validate', function() {
  if (!this.itemId && !this.pageId) {
    this.invalidate('itemId', 'Either itemId or pageId must be provided');
  }
  if (this.itemId && this.pageId) {
    this.invalidate('itemId', 'Cannot have both itemId and pageId');
  }
});

CommentSchema.index({ itemId: 1, createdAt: -1 });
CommentSchema.index({ pageId: 1, createdAt: -1 });

const Comment = mongoose.model<IComment>("Comment", CommentSchema);
export default Comment;