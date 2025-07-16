import { Document, ObjectId } from "mongoose";

export interface IWhiteboard extends Document {
    title: string;
    scene: any; // Excalidraw scene JSON
    workspace: ObjectId;
    user: ObjectId;
    createdAt: Date;
    updatedAt: Date;
  }