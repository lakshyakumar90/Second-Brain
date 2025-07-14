import mongoose from "mongoose";
import { IWorkspace } from "./interfaces/workspaceModel.interface";

const WorkspaceSchema = new mongoose.Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["view", "edit", "admin"],
          default: "view",
        },
        joinedAt: { type: Date, default: Date.now },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    isPublic: { type: Boolean, default: false },
    allowInvites: { type: Boolean, default: true },

    settings: {
      theme: { type: String, default: "system" },
      defaultView: { type: String, default: "grid" },
      aiEnabled: { type: Boolean, default: true },
    },

    totalItems: { type: Number, default: 0 },
    totalMembers: { type: Number, default: 1 },
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

const Workspace = mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);
export default Workspace;