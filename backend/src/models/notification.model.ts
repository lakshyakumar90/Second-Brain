import mongoose from "mongoose";
import { INotification } from "./interfaces/notificationModel.interface";

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["share", "collaboration", "system", "ai_insight", "comment"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },

    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedType: {
      type: String,
      enum: ["item", "share", "comment", "workspace"],
    },

    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date },

    actionUrl: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
export default Notification;
