import mongoose from "mongoose";
import { ICategory } from "./interfaces/categoryModel.interface";

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, required: true, default: "#3B82F6" },
    icon: { type: String },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    isDefault: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },

    autoClassify: { type: Boolean, default: false },
    aiKeywords: [{ type: String }],

    itemCount: { type: Number, default: 0 },
    
    // Soft delete fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add index for soft delete queries
CategorySchema.index({ userId: 1, isDeleted: 1 });

const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
