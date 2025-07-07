import mongoose from "mongoose";
import { IComment } from "./interfaces/commentModel.interface";

const CommentSchema = new mongoose.Schema<IComment>({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    
    isResolved: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    
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

const Comment = mongoose.model<IComment>("Comment", CommentSchema);
export default Comment;