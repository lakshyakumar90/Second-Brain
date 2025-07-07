import mongoose from "mongoose";
import { IAIUsage } from "./interfaces/aiUsageModel.interface";

const AISchema = new mongoose.Schema<IAIUsage>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requestType: {
      type: String,
      enum: [
        "summarize",
        "tag_suggest",
        "chat",
        "insights",
        "semantic_search",
        "auto_categorize",
      ],
      required: true,
    },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "AIChat" },

    tokensUsed: { type: Number, required: true },
    processingTime: { type: Number, required: true },
    model: { type: String, required: true },

    cost: { type: Number, required: true },

    status: {
      type: String,
      enum: ["success", "error", "rate_limited", "quota_exceeded"],
      required: true,
    },
    errorMessage: { type: String },

    metadata: {
      inputLength: { type: Number },
      outputLength: { type: Number },
      quality: { type: String, enum: ["low", "medium", "high"] },
      temperature: { type: Number },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const AIUsage = mongoose.model<IAIUsage>("AIUsage", AISchema);
export default AIUsage;
