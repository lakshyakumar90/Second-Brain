import multer from "multer";
import { Request } from "express";
import { FILE_LIMITS } from "../config/constants";

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check if file type is allowed
  if (!FILE_LIMITS.ALLOWED_FILE_TYPES.includes(file.mimetype as any)) {
    return cb(
      new Error(
        `File type ${
          file.mimetype
        } is not allowed. Allowed types: ${FILE_LIMITS.ALLOWED_FILE_TYPES.join(
          ", "
        )}`
      )
    );
  }

  // Check file size
  if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
    return cb(
      new Error(
        `File size ${file.size} bytes exceeds maximum allowed size of ${FILE_LIMITS.MAX_FILE_SIZE} bytes`
      )
    );
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_LIMITS.MAX_FILE_SIZE,
    files: 1, // Only allow 1 file at a time for avatar upload
  },
});

// Specific middleware for avatar upload
export const uploadAvatar = upload.single("avatar");

// Error handling middleware for multer
export const handleUploadError = (
  error: any,
  req: Request,
  res: any,
  next: any
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large",
        error: `File size must be less than ${
          FILE_LIMITS.MAX_FILE_SIZE / (1024 * 1024)
        }MB`,
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "Too many files",
        error: "Only one file is allowed",
      });
    }
    return res.status(400).json({
      message: "File upload error",
      error: error.message,
    });
  }

  if (
    error.message.includes("File type") ||
    error.message.includes("File size")
  ) {
    return res.status(400).json({
      message: "Invalid file",
      error: error.message,
    });
  }

  next(error);
};
export default upload;

