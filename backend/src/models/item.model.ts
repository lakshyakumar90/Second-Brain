import mongoose from "mongoose";
import { IItem } from "./interfaces/itemModel.interface";

const ItemSchema = new mongoose.Schema<IItem>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "link", "document", "audio"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String },
    blocks: {
      type: [
        {
          id: { type: String, required: true },
          type: { type: String, required: true }, // e.g., 'text', 'heading', 'code', 'todo', etc.
          content: { type: mongoose.Schema.Types.Mixed }, // string, array, or null
          checked: { type: Boolean }, // for todo/checklist
          children: { type: Array }, // array of blocks (nested)
        },
      ],
      default: [],
    },
    url: { type: String },

    files: [
      {
        originalName: { type: String, required: true },
        filename: { type: String, required: true },
        path: { type: String, required: true },
        size: { type: Number, required: true },
        mimetype: { type: String, required: true },
        isMain: { type: Boolean, default: false },
      },
    ],

    metadata: {
      size: { type: Number },
      duration: { type: Number },
      dimensions: {
        width: { type: Number },
        height: { type: Number },
      },
      socialPlatform: {
        type: String,
        enum: [
          "twitter",
          "instagram",
          "youtube",
          "linkedin",
          "tiktok",
          "reddit",
          "pinterest",
        ],
      },
      author: { type: String },
      description: { type: String },
      publishedAt: { type: Date },
      language: { type: String },
      wordCount: { type: Number },
      readingTime: { type: Number },
      extractedText: { type: String },
    },

    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    tags: [{ type: String, trim: true }],
    workspace: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Workspace", 
      required: true 
    },

    aiData: {
      summary: { type: String },
      suggestedTags: [{ type: String }],
      suggestedCategories: [{ type: String }],
      sentiment: { type: String, enum: ["positive", "negative", "neutral"] },
      keyTopics: [{ type: String }],
      complexity: { type: String, enum: ["low", "medium", "high"] },
      extractedEntities: [{ type: String }],
      lastProcessedAt: { type: Date },
    },

    isPublic: { type: Boolean, default: false },
    shareId: { type: String, unique: true, sparse: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    viewCount: { type: Number, default: 0 },
    lastViewedAt: { type: Date },
    lastEditedAt: { type: Date },
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    version: { type: Number, default: 1 },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Item = mongoose.model<IItem>("Item", ItemSchema);
export default Item;
