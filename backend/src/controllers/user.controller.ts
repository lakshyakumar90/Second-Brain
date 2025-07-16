import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import { updateProfileSchema, changePasswordSchema, updateProfilePreferencesSchema } from "../validations/authValidation";
import cloudinaryService from "../services/cloudinaryService";
import { AuthRequest } from "../models/interfaces/userModel.interface";

const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        let userId;
        // If userId is in params, use that (viewing other's profile)
        if (req.params.userId) {
            userId = req.params.userId;
        }
        // Otherwise use the authenticated user's ID (viewing own profile) 
        else if (req.user?.userId) {
            userId = req.user.userId;
        } else {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const user = await User.findById(userId).lean();
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Exclude sensitive fields
        const { password, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
        res.status(200).json(safeUser);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile" });
    }
}

const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        // Validate request body
        const validationResult = updateProfileSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ 
                message: "Validation failed", 
                errors: validationResult.error.issues
            });
            return;
        }

        const { name, username, email, avatar, bio } = validationResult.data;

        const user = await User.findById(req.user?.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        
        if (name) user.name = name;
        if (username) user.username = username;
        if (email) user.email = email;
        if (avatar) user.avatar = avatar;
        if (bio) user.bio = bio;
        
        await user.save();
        
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile" });
    }
}

const updateProfilePreferences = async (req: AuthRequest, res: Response) => {
    try {
        // Validate request body
        const validationResult = updateProfilePreferencesSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ 
                message: "Validation failed", 
                errors: validationResult.error.issues
            });
            return;
        }

        const { preferences } = validationResult.data;
        const user = await User.findById(req.user?.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Update individual preference fields if provided
        if (preferences.theme) {
            user.preferences.theme = preferences.theme;
        }
        if (preferences.defaultView) {
            user.preferences.defaultView = preferences.defaultView;
        }
        if (typeof preferences.aiEnabled !== 'undefined') {
            user.preferences.aiEnabled = preferences.aiEnabled;
        }
        if (typeof preferences.emailNotifications !== 'undefined') {
            user.preferences.emailNotifications = preferences.emailNotifications;
        }
        if (typeof preferences.autoSave !== 'undefined') {
            user.preferences.autoSave = preferences.autoSave;
        }
        if (typeof preferences.language !== 'undefined') {
            user.preferences.language = preferences.language;
        }
        if (typeof preferences.timezone !== 'undefined') {
            user.preferences.timezone = preferences.timezone;
        }

        await user.save();

        res.status(200).json({ message: "Profile preferences updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile preferences" });
    }
}

const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        // Validate request body
        const validationResult = changePasswordSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ 
                message: "Validation failed", 
                errors: validationResult.error.issues
            });
            return;
        }

        const { oldPassword, newPassword } = validationResult.data;

        const user = await User.findById(req.user?.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        
        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid old password" });
            return;
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating password" });
    }
}

const deleteAccount = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        await user.deleteOne();

        res.clearCookie("token");

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting account" });
    }
}

const getUsageStats = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({
            usage: user.usage
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching usage stats" });
    }
}

const uploadAvatar = async (req: AuthRequest, res: Response) => {
    try {
        // Check if file exists
        if (!req.file) {
            res.status(400).json({ 
                message: "No file uploaded",
                error: "Please select an image file to upload"
            });
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            res.status(400).json({
                message: "Invalid file type",
                error: "Only JPEG, PNG, GIF, and WebP images are allowed"
            });
            return;
        }

        // Validate file size (max 5MB for avatars)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
            res.status(400).json({
                message: "File too large",
                error: "Avatar image must be less than 5MB"
            });
            return;
        }

        // Find user
        const user = await User.findById(req.user?.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Delete old avatar from Cloudinary if it exists
        if (user.avatar && cloudinaryService.isValidCloudinaryUrl(user.avatar)) {
            const oldPublicId = cloudinaryService.extractPublicId(user.avatar);
            if (oldPublicId) {
                await cloudinaryService.deleteImage(oldPublicId);
            }
        }

        // Upload new image to Cloudinary
        const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, {
            folder: 'avatars',
            public_id: `user_${user._id}_avatar_${Date.now()}`
        });

        // Update user's avatar URL
        user.avatar = uploadResult.secure_url;
        await user.save();

        res.status(200).json({
            message: "Avatar uploaded successfully",
            avatar: uploadResult.secure_url,
            publicId: uploadResult.public_id
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Error uploading avatar",
            error: "Failed to process image upload"
        });
    }
}

export { getProfile, updateProfile, updateProfilePreferences, changePassword, deleteAccount, getUsageStats, uploadAvatar };