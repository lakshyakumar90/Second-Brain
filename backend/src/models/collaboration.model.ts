import mongoose from "mongoose";
import { ICollaboration } from "./interfaces/collaborationModel.interface";

const CollaborationSchema = new mongoose.Schema<ICollaboration>({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    activeUsers: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      socketId: { type: String, required: true },
      cursor: {
        position: { type: Number },
        selection: {
          start: { type: Number },
          end: { type: Number }
        }
      },
      lastSeen: { type: Date, default: Date.now }
    }],
    
    collaborators: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      permission: { type: String, enum: ['view', 'edit', 'admin'], default: 'view' },
      addedAt: { type: Date, default: Date.now },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }],
    
    isActive: { type: Boolean, default: true },
    allowAnonymous: { type: Boolean, default: false },
    
    currentVersion: { type: Number, default: 1 }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Collaboration = mongoose.model<ICollaboration>(
  "Collaboration",
  CollaborationSchema
);
export default Collaboration;