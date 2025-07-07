import { ObjectId } from "mongoose";

export interface IComment {
  _id: ObjectId;
  itemId: ObjectId;
  userId: ObjectId;
  content: string;

  // Threading
  parentId?: ObjectId;
  replies: ObjectId[];

  // Status
  isResolved: boolean;
  isEdited: boolean;

  // Reactions
  reactions: Array<{
    userId: ObjectId;
    type: "like" | "love" | "laugh" | "wow" | "sad" | "angry";
    createdAt: Date;
  }>;

  // Position (for document comments)
  position?: {
    start: number;
    end: number;
    selectedText?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}
