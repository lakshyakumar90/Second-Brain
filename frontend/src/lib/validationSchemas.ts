import { z } from 'zod';

// Login form validation
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// Registration Step 1 validation
export const registerStep1Schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password cannot exceed 20 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
});

// Registration Step 2 validation
export const registerStep2Schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(20, 'Name cannot exceed 20 characters'),
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      'Username can only contain letters, numbers, underscores and dots'
    ),
});

// Registration Step 3 validation
export const registerStep3Schema = z.object({
  avatar: z.string().url('Please enter a valid URL for your avatar').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  theme: z.enum(['light', 'dark', 'system']),
  emailNotifications: z.boolean(),
});

// OTP verification validation
export const otpSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP is required')
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

// Forgot password validation
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

// Password reset OTP verification
export const passwordResetOTPSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  otp: z
    .string()
    .min(1, 'OTP is required')
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

// Reset password validation
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password cannot exceed 20 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
});

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterStep1FormData = z.infer<typeof registerStep1Schema>;
export type RegisterStep2FormData = z.infer<typeof registerStep2Schema>;
export type RegisterStep3FormData = z.infer<typeof registerStep3Schema>;
export type OTPFormData = z.infer<typeof otpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type PasswordResetOTPFormData = z.infer<typeof passwordResetOTPSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>; 