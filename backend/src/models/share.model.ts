import mongoose from "mongoose";
import { IShare } from "./interfaces/shareModel.interface";

const ShareSchema = new mongoose.Schema<IShare>(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shareId: { type: String, required: true, unique: true },

    isPublic: { type: Boolean, default: true },
    password: { type: String },
    permission: {
      type: String,
      enum: ["view", "edit", "admin"],
      default: "view",
    },

    allowComments: { type: Boolean, default: true },
    allowDownload: { type: Boolean, default: true },
    showMetadata: { type: Boolean, default: true },

    expiresAt: { type: Date },

    accessCount: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    lastAccessedAt: { type: Date },

    accessLog: [
      {
        ip: { type: String, required: true },
        userAgent: { type: String, required: true },
        accessedAt: { type: Date, default: Date.now },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Share = mongoose.model<IShare>("Share", ShareSchema);
export default Share;
