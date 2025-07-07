import mongoose from "mongoose";
import { IAIChat } from "./interfaces/aiChatModel.inteface";

const AIChatSchema = new mongoose.Schema<IAIChat>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },

    messages: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, required: true },
        role: {
          type: String,
          enum: ["user", "assistant", "system"],
          required: true,
        },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },

        relatedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
        attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],

        tokens: { type: Number },
        model: { type: String },
        temperature: { type: Number },
      },
    ],

    isActive: { type: Boolean, default: true },

    contextItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const AIChat = mongoose.model<IAIChat>("AIChat", AIChatSchema);
export default AIChat;