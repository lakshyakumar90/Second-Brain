import mongoose from "mongoose";
import { IActivityLog } from "./interfaces/activityModel.interface";

const ActivityLogSchema = new mongoose.Schema<IActivityLog>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "create",
        "update",
        "delete",
        "share",
        "view",
        "comment",
        "collaborate",
        "aiChat",
        "search", // Added 'search' as a valid action
      ],
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["item", "category", "workspace", "share", "collaboration", "aiChat"],
      required: true,
    },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: false }, // Make resourceId optional

    details: {
      query: { type: String }, // Allow storing search queries
      oldValues: { type: mongoose.Schema.Types.Mixed },
      newValues: { type: mongoose.Schema.Types.Mixed },
      metadata: { type: mongoose.Schema.Types.Mixed },
    },

    ip: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);  

const ActivityLog = mongoose.model<IActivityLog>(
  "ActivityLog",
  ActivityLogSchema
);
export default ActivityLog;
