import { z } from "zod";

const registerStep1Schema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters long")
      .max(20, "Password cannot exceed 20 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/, 
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"),
});

const registerStep2Schema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long").max(20, "Name cannot exceed 20 characters"),
    username: z.string().min(3, "Username must be at least 3 characters long").max(20, "Username cannot exceed 20 characters"),
});

const registerStep3Schema = z.object({
    avatar: z.url("Please enter a valid URL for your avatar"),
    bio: z.string().max(500, "Bio cannot exceed 500 characters"),
    theme: z.enum(["light", "dark", "system"]),
    emailNotifications: z.boolean(),
});

const loginSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long").max(20, "Password cannot exceed 20 characters"),
});

// OTP verification schema
const verifyOTPSchema = z.object({
    email: z.email("Please enter a valid email address"),
    otp: z.string()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

// Resend OTP schema
const resendOTPSchema = z.object({
    email: z.email("Please enter a valid email address"),
});

// Forgot password schema
const forgotPasswordSchema = z.object({
    email: z.email("Please enter a valid email address"),
});

// Verify password reset OTP schema
const verifyPasswordResetOTPSchema = z.object({
    email: z.email("Please enter a valid email address"),
    otp: z.string()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

// Reset password schema (after OTP verification)
const resetPasswordSchema = z.object({
    email: z.email("Please enter a valid email address"),
    newPassword: z.string()
      .min(8, "Password must be at least 8 characters long")
      .max(20, "Password cannot exceed 20 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/, 
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"),
});

// Refresh token schema
const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
});

export { 
    registerStep1Schema, 
    registerStep2Schema, 
    registerStep3Schema, 
    loginSchema, 
    verifyOTPSchema, 
    resendOTPSchema,
    forgotPasswordSchema,
    verifyPasswordResetOTPSchema,
    resetPasswordSchema,
    refreshTokenSchema
};