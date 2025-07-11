import * as z from "zod";

const registerStep1Schema = z.object({
    email: z.email(),
    password: z.string()
      .min(8)
      .max(20)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/, 
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"),
});

const registerStep2Schema = z.object({
    name: z.string().min(3).max(20),
    username: z.string().min(3).max(20),
});

const registerStep3Schema = z.object({
    avatar: z.url(),
    bio: z.string().max(500),
    theme: z.enum(["light", "dark", "system"]),
    emailNotifications: z.boolean(),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(20),
});

// OTP verification schema
const verifyOTPSchema = z.object({
    email: z.email(),
    otp: z.string().length(6).regex(/^\d{6}$/, "OTP must be 6 digits"),
});

// Resend OTP schema
const resendOTPSchema = z.object({
    email: z.email(),
});

export { registerStep1Schema, registerStep2Schema, registerStep3Schema, loginSchema, verifyOTPSchema, resendOTPSchema };