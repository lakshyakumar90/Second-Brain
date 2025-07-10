import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  loginSchema,
  registerStep1Schema,
  registerStep2Schema,
  registerStep3Schema,
} from "../validations/authValidation";

interface AuthRequest extends Request {
  user?: any;
}

export const registerStep1 = async (
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

  const user = await User.create({ email, password, completedSteps });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "12h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });

  res.status(201).json({ message: "User created successfully", user, token });
};

export const registerStep2 = async (
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

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { name, username, completedSteps },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ message: "User not found" });
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
  res.status(200).json({ message: "User updated successfully", user, token });
};

export const registerStep3 = async (
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

  const user = await User.findByIdAndUpdate(
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

  if (!user) {
    res.status(404).json({ message: "User not found" });
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
  res.status(200).json({ message: "User updated successfully", user, token });
};

export const login = async (req: Request, res: Response): Promise<void> => {
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

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};