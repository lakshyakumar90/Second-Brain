import mongoose from "mongoose";
import { ITag } from "./interfaces/tagModel.interface";

const TagSchema = new mongoose.Schema<ITag>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { 
      type: String, 
      required: true, 
      trim: true,
      lowercase: true 
    },
    color: { 
      type: String, 
      default: "#6B7280" 
    },
    description: { 
      type: String, 
      trim: true 
    },
    
    // Statistics
    itemCount: { 
      type: Number, 
      default: 0 
    },
    usageCount: { 
      type: Number, 
      default: 0 
    },
    
    // Settings
    isDefault: { 
      type: Boolean, 
      default: false 
    },
    isPublic: { 
      type: Boolean, 
      default: false 
    },
    sortOrder: { 
      type: Number, 
      default: 0 
    },
    
    // AI Settings
    autoSuggest: { 
      type: Boolean, 
      default: false 
    },
    aiKeywords: [{ 
      type: String 
    }],
    
    // Soft delete fields
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
    deletedAt: { 
      type: Date 
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for performance
TagSchema.index({ userId: 1, isDeleted: 1 });
TagSchema.index({ userId: 1, name: 1 }, { unique: true });
TagSchema.index({ userId: 1, usageCount: -1 });

const Tag = mongoose.model<ITag>("Tag", TagSchema);
export default Tag;
