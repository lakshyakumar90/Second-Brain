import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "./interfaces/userModel.interface";

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, trim: true },
    username: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    completedSteps: { type: Number, default: 0 },

    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro", "enterprise"],
        default: "free",
      },
      startDate: { type: Date, default: Date.now },
      expiresAt: { type: Date },
      isActive: { type: Boolean, default: true },
      stripeCustomerId: { type: String },
      stripeSubscriptionId: { type: String },
    },

    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      defaultView: {
        type: String,
        enum: ["grid", "list", "kanban"],
        default: "grid",
      },
      aiEnabled: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: false },
      publicProfile: { type: Boolean, default: false },
      autoSave: { type: Boolean, default: true },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "UTC" },
    },

    usage: {
      totalItems: { type: Number, default: 0 },
      storageUsed: { type: Number, default: 0 },
      lastLoginAt: { type: Date },
      itemsCreatedToday: { type: Number, default: 0 },
      aiRequestsToday: { type: Number, default: 0 },
      aiRequestsThisMonth: { type: Number, default: 0 },
      lastAiRequestAt: { type: Date },
      aiTrialResetsAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      }, // 24 hours from now
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
