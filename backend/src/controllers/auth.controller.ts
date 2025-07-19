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
  forgotPasswordSchema,
  verifyPasswordResetOTPSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from "../validations/authValidation";
import { formatZodError } from "../utils/validationUtils";
import emailService from "../services/emailService";
import {
  generateOTP,
  getOTPExpiration,
  isOTPExpired,
  validateOTPFormat,
} from "../utils/otpUtils";
import { AuthRequest } from "../models/interfaces/userModel.interface";

const registerStep1 = async (req: Request, res: Response): Promise<void> => {
  const { email, password, completedSteps = 1 } = req.body;
  const { error } = registerStep1Schema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: formatZodError(error) });
    return;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // If user has completed all registration steps, they can't register again
    if (existingUser.completedSteps === 3) {
      res.status(400).json({ message: "User already exists with completed registration" });
      return;
    }
    
    // If user hasn't completed registration, let them continue from current step
    // Generate new OTP for email verification if needed
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();
    
    existingUser.emailOtp = otp;
    existingUser.emailOtpExpires = otpExpires;
    await existingUser.save();
    
    // Send OTP email
    const emailSent = await emailService.sendOTP(email, otp);
    if (!emailSent) {
      res.status(500).json({
        message: "Failed to send verification email. Please try again.",
      });
      return;
    }
    
    const token = jwt.sign(
      {
        userId: existingUser._id,
        completedSteps: existingUser.completedSteps,
        role: existingUser.role,
        name: existingUser.name,
        email: existingUser.email,
        avatar: existingUser.avatar,
        username: existingUser.username,
        bio: existingUser.bio,
        isVerified: existingUser.isVerified,
        isActive: existingUser.isActive,
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "12h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Continue your registration. Please check your email for verification OTP.",
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        completedSteps: existingUser.completedSteps,
        emailVerified: existingUser.emailVerified,
      },
      token,
    });
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
    emailVerified: false,
  });

  // Send OTP email
  const emailSent = await emailService.sendOTP(email, otp);
  if (!emailSent) {
    // If email fails, delete the user and return error
    await User.findByIdAndDelete(user._id);
    res.status(500).json({
      message: "Failed to send verification email. Please try again.",
    });
    return;
  }

  const token = jwt.sign(
    {
      userId: user._id,
      completedSteps: user.completedSteps,
      role: user.role,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      username: user.username,
      bio: user.bio,
      isVerified: user.isVerified,
      isActive: user.isActive,
    },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: "12h",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });

  res.status(201).json({
    message:
      "User created successfully. Please check your email for verification OTP.",
    user: {
      _id: user._id,
      email: user.email,
      completedSteps: user.completedSteps,
      emailVerified: user.emailVerified,
    },
    token,
  });
};

const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
  const { error } = verifyOTPSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: formatZodError(error) });
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
    res
      .status(400)
      .json({ message: "No OTP found. Please request a new one." });
    return;
  }

  if (isOTPExpired(user.emailOtpExpires)) {
    res
      .status(400)
      .json({ message: "OTP has expired. Please request a new one." });
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

  const token = jwt.sign(
    { userId: user._id, completedSteps: user.completedSteps },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: "12h",
    }
  );

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
      emailVerified: user.emailVerified,
    },
    token,
  });
};

const resendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const { error } = resendOTPSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: formatZodError(error) });
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
    res.status(500).json({
      message: "Failed to send verification email. Please try again.",
    });
    return;
  }

  res
    .status(200)
    .json({ message: "New OTP sent successfully. Please check your email." });
};

const registerStep2 = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, username, completedSteps = 2 } = req.body;
  const { error } = registerStep2Schema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: formatZodError(error) });
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

  const user = await User.findById(req.user?.userId);
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

  const token = jwt.sign(
    { userId: updatedUser!._id, completedSteps: updatedUser!.completedSteps },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: "12h",
    }
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });
  res
    .status(200)
    .json({ message: "User updated successfully", user: updatedUser, token });
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
    res.status(400).json({ message: formatZodError(error) });
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

  const token = jwt.sign(
    { userId: updatedUser!._id, completedSteps: updatedUser!.completedSteps },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: "12h",
    }
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });
  res
    .status(200)
    .json({ message: "User updated successfully", user: updatedUser, token });
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const { error } = loginSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: formatZodError(error) });
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
      message:
        "Please verify your email first. Check your inbox for the verification OTP.",
      requiresVerification: true,
    });
    return;
  }

  const token = jwt.sign(
    { userId: user._id, completedSteps: user.completedSteps },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: "12h",
    }
  );
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

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const { error } = forgotPasswordSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: formatZodError(error) });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not for security
    res.status(200).json({
      message:
        "If an account with this email exists, a password reset OTP has been sent.",
    });
    return;
  }

  // Generate OTP for password reset
  const otp = generateOTP();
  const otpExpires = getOTPExpiration();

  user.passwordResetOtp = otp;
  user.passwordResetOtpExpires = otpExpires;
  await user.save();

  // Send password reset OTP email
  const emailSent = await emailService.sendPasswordResetOTP(
    email,
    otp,
    user.name
  );
  if (!emailSent) {
    res.status(500).json({
      message: "Failed to send password reset email. Please try again.",
    });
    return;
  }

  res.status(200).json({
    message:
      "If an account with this email exists, a password reset OTP has been sent.",
  });
};

const verifyPasswordResetOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, otp } = req.body;
  const { error } = verifyPasswordResetOTPSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: formatZodError(error) });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (!user.passwordResetOtp || !user.passwordResetOtpExpires) {
    res.status(400).json({
      message: "No password reset OTP found. Please request a new one.",
    });
    return;
  }

  if (isOTPExpired(user.passwordResetOtpExpires)) {
    res.status(400).json({
      message: "Password reset OTP has expired. Please request a new one.",
    });
    return;
  }

  if (user.passwordResetOtp !== otp) {
    res.status(400).json({ message: "Invalid OTP" });
    return;
  }

  // Mark OTP as verified and clear OTP fields
  user.passwordResetOtpVerified = true;
  user.passwordResetOtp = undefined;
  user.passwordResetOtpExpires = undefined;
  await user.save();

  res.status(200).json({
    message:
      "Password reset OTP verified successfully! You can now set your new password.",
  });
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, newPassword } = req.body;
  const { error } = resetPasswordSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: formatZodError(error) });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Check if user has verified their password reset OTP
  if (!user.passwordResetOtpVerified) {
    res.status(400).json({
      message: "Please verify your OTP first before resetting password",
    });
    return;
  }

  // Update password and clear verification flag
  user.password = newPassword;
  user.passwordResetOtpVerified = false;
  await user.save();

  // Send password change confirmation email
  await emailService.sendPasswordChangeConfirmation(email, user.name || "User");

  res.status(200).json({ message: "Password reset successfully!" });
};

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  const { error } = refreshTokenSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ message: formatZodError(error) });
    return;
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ message: "User account is deactivated" });
      return;
    }

    // Generate new access token
    const newToken = jwt.sign(
      { userId: user._id, completedSteps: user.completedSteps },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "12h",
      }
    );

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      token: newToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        completedSteps: user.completedSteps,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

const checkRegistrationStep = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({
    completedSteps: user.completedSteps,
    emailVerified: user.emailVerified,
    isVerified: user.isVerified,
    isActive: user.isActive,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      preferences: user.preferences,
    },
  });
};

export {
  registerStep1,
  registerStep2,
  registerStep3,
  login,
  logout,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyPasswordResetOTP,
  resetPassword,
  refreshToken,
  checkRegistrationStep,
};
