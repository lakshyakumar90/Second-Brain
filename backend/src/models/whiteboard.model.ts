import mongoose, { Schema } from 'mongoose';
import { IWhiteboard } from './interfaces/whiteboardModel.interface';

const WhiteboardSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    scene: { type: Schema.Types.Mixed, required: true },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IWhiteboard>('Whiteboard', WhiteboardSchema); 