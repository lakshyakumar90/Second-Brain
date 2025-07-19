import { ObjectId } from "mongoose";
import { SubscriptionPlan, UserRole } from "../../config/common";
import { Request } from "express";

export interface IUser {
    _id: ObjectId;
    name: string;
    email: string;
    password: string;
    username?: string;
    avatar?: string;
    bio?: string;
    role: UserRole;
    completedSteps: number;
  
    subscription: {
      plan: SubscriptionPlan;
      startDate: Date;
      endDate?: Date;
      isActive: boolean;
    };
  
    preferences: {
      theme: "light" | "dark" | "system";
      defaultView: "grid" | "list";
      aiEnabled: boolean;
      emailNotifications: boolean;
      publicProfile?: boolean;
      autoSave: boolean;
      language?: string;
      timezone?: string;
    };
  
    usage: {
      totalItems: number;
      storageUsed: number;
      lastLoginAt?: Date;
      itemsCreatedToday: number;
      aiRequestsToday: number;
      aiRequestsThisMonth: number;
      lastAiRequestAt?: Date;
      aiTrialResetsAt: Date;
    };
  
    isVerified: boolean;
    isActive: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    // OTP fields for email verification
    emailOtp?: string;
    emailOtpExpires?: Date;
    emailVerified: boolean;
    // OTP fields for password reset
    passwordResetOtp?: string;
    passwordResetOtpExpires?: Date;
    passwordResetOtpVerified?: boolean;
  
    createdAt: Date;
    updatedAt: Date;
    
    // Soft delete fields
    isDeleted?: boolean;
    deletedAt?: Date;
  }

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    completedSteps: number;
    role: UserRole;
    name: string;
    email: string;
    avatar: string;
    username: string;
    bio: string;
    isVerified: boolean;
    isActive: boolean;
    // Add other user properties if needed
  };
}