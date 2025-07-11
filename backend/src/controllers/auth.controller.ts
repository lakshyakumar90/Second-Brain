import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  loginSchema,
  registerStep1Schema,
  registerStep2Schema,
  registerStep3Schema,
  verifyOTPSchema,
  resendOTPSchema,
} from "../validations/authValidation";
import emailService from "../services/emailService";
import { generateOTP, getOTPExpiration, isOTPExpired, validateOTPFormat } from "../utils/otpUtils";

interface AuthRequest extends Request {
  user?: any;
}

const registerStep1 = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, completedSteps = 1 } = req.body;
  const { error } = registerStep1Schema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: "User already exists", existingUser });
    return;
  }

  // Generate OTP for email verification
  const otp = generateOTP();
  const otpExpires = getOTPExpiration();

  const user = await User.create({ 
    email, 
    password, 
    completedSteps,
    emailOtp: otp,
    emailOtpExpires: otpExpires,
    emailVerified: false
  });

  // Send OTP email
  const emailSent = await emailService.sendOTP(email, otp);
  if (!emailSent) {
    // If email fails, delete the user and return error
    await User.findByIdAndDelete(user._id);
    res.status(500).json({ message: "Failed to send verification email. Please try again." });
    return;
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "12h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });

  res.status(201).json({ 
    message: "User created successfully. Please check your email for verification OTP.", 
    user: { 
      _id: user._id, 
      email: user.email, 
      completedSteps: user.completedSteps,
      emailVerified: user.emailVerified 
    }, 
    token 
  });
};

const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
  const { error } = verifyOTPSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (user.emailVerified) {
    res.status(400).json({ message: "Email is already verified" });
    return;
  }

  if (!user.emailOtp || !user.emailOtpExpires) {
    res.status(400).json({ message: "No OTP found. Please request a new one." });
    return;
  }

  if (isOTPExpired(user.emailOtpExpires)) {
    res.status(400).json({ message: "OTP has expired. Please request a new one." });
    return;
  }

  if (user.emailOtp !== otp) {
    res.status(400).json({ message: "Invalid OTP" });
    return;
  }

  // Verify email and update user
  user.emailVerified = true;
  user.emailOtp = undefined;
  user.emailOtpExpires = undefined;
  user.completedSteps = Math.max(user.completedSteps, 2); // Move to step 2
  await user.save();

  // Send welcome email
  await emailService.sendWelcomeEmail(email, user.name || "User");

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "12h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });

  res.status(200).json({ 
    message: "Email verified successfully!", 
    user: { 
      _id: user._id, 
      email: user.email, 
      completedSteps: user.completedSteps,
      emailVerified: user.emailVerified 
    }, 
    token 
  });
};

const resendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const { error } = resendOTPSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (user.emailVerified) {
    res.status(400).json({ message: "Email is already verified" });
    return;
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpires = getOTPExpiration();

  user.emailOtp = otp;
  user.emailOtpExpires = otpExpires;
  await user.save();

  // Send new OTP email
  const emailSent = await emailService.sendOTP(email, otp, user.name);
  if (!emailSent) {
    res.status(500).json({ message: "Failed to send verification email. Please try again." });
    return;
  }

  res.status(200).json({ message: "New OTP sent successfully. Please check your email." });
};

const registerStep2 = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, username, completedSteps = 2 } = req.body;
  const { error } = registerStep2Schema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.status(400).json({ message: "Username already taken", existingUser });
    return;
  }

  if (!req.user?.userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Check if email is verified
  if (!user.emailVerified) {
    res.status(400).json({ message: "Please verify your email first" });
    return;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.userId,
    { name, username, completedSteps },
    { new: true }
  );

  const token = jwt.sign({ userId: updatedUser!._id }, process.env.JWT_SECRET!, {
    expiresIn: "12h",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });
  res.status(200).json({ message: "User updated successfully", user: updatedUser, token });
};

const registerStep3 = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const {
    avatar,
    bio,
    theme,
    emailNotifications,
    completedSteps = 3,
  } = req.body;
  const { error } = registerStep3Schema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (!req.user?.userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Check if email is verified
  if (!user.emailVerified) {
    res.status(400).json({ message: "Please verify your email first" });
    return;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.userId,
    {
      avatar,
      bio,
      preferences: {
        theme,
        emailNotifications,
      },
      completedSteps,
      isVerified: true,
      isActive: true,
    },
    { new: true }
  );

  const token = jwt.sign({ userId: updatedUser!._id }, process.env.JWT_SECRET!, {
    expiresIn: "12h",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });
  res.status(200).json({ message: "User updated successfully", user: updatedUser, token });
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const { error } = loginSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }

  // Check if email is verified
  if (!user.emailVerified) {
    res.status(400).json({ 
      message: "Please verify your email first. Check your inbox for the verification OTP.",
      requiresVerification: true 
    });
    return;
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "12h",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });
  res.status(200).json({ message: "Login successful", user, token });
};

const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

export { registerStep1, registerStep2, registerStep3, login, logout, verifyOTP, resendOTP };