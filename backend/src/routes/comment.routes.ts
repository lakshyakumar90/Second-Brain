import { Router } from "express";
import { createComment, getComments, getComment } from "../controllers/comment.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Apply authentication middleware to all comment routes
router.use(authMiddleware);

// Create a new comment
router.post("/create", createComment);

// Get comments for a specific item
router.get("/item/:itemId", getComments);

// Get a single comment by ID
router.get("/:commentId", getComment);

export default router; 