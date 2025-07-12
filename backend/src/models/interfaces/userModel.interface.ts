import { ObjectId } from "mongoose";
import { SubscriptionPlan, UserRole } from "../../config/common";

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
      autosave: boolean;
    };
  
    usage: {
      totalItems: number;
      totalStorage: number;
      lastLogin: Date;
      itemsCreatedToday: number;
      aiRequestsToday: number;
      aiRequestsThisMonth: number;
      lastAiRequestAt?: Date;
      aiTrialResetAt: Date;
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
  }