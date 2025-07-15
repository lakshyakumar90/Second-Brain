import { Request, Response } from "express";
import { Comment, Item } from "../models/index";
import {
  createCommentSchema,
  getCommentsQuerySchema,
  commentIdSchema,
  itemIdForCommentsSchema,
} from "../validations/commentValidation";

interface AuthRequest extends Request {
  user?: { userId: string };
}

const createComment = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate request body
    const validationResult = createCommentSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        message: "Validation failed",
        error: validationResult.error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    const validatedData = validationResult.data;

    // Check if the item exists and user has access to it
    const item = await Item.findOne({
      _id: validatedData.itemId,
      $or: [
        { userId: req.user.userId },
        { collaborators: req.user.userId },
        { isPublic: true }
      ],
      isDeleted: false,
    });

    if (!item) {
      res.status(404).json({
        message: "Item not found",
        error: "The item you're trying to comment on doesn't exist or you don't have access to it",
      });
      return;
    }

    // If this is a reply, check if parent comment exists
    if (validatedData.parentId) {
      const parentComment = await Comment.findById(validatedData.parentId);
      if (!parentComment) {
        res.status(404).json({
          message: "Parent comment not found",
          error: "The comment you're replying to doesn't exist",
        });
        return;
      }
    }

    // Create comment object
    const commentData = {
      itemId: validatedData.itemId,
      userId: req.user.userId,
      content: validatedData.content,
      parentId: validatedData.parentId,
      position: validatedData.position,
      replies: [],
      isResolved: false,
      isEdited: false,
      reactions: [],
    };

    // Create the comment
    const comment = await Comment.create(commentData);

    // If this is a reply, update parent comment's replies array
    if (validatedData.parentId) {
      await Comment.findByIdAndUpdate(
        validatedData.parentId,
        { $push: { replies: comment._id } }
      );
    }

    // Populate references for response
    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "name email")
      .populate("parentId", "content")
      .populate("replies", "content");

    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        res.status(409).json({
          message: "Comment already exists",
          error: "A comment with this content already exists",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error creating comment",
      error: "Internal server error",
    });
    return;
  }
};

const getComments = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate query parameters
    const validationResult = getCommentsQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      res.status(400).json({
        message: "Validation failed",
        error: validationResult.error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    // Validate item ID from params
    const itemIdValidation = itemIdForCommentsSchema.safeParse(req.params);
    if (!itemIdValidation.success) {
      res.status(400).json({
        message: "Validation failed",
        error: "Item ID is required",
      });
      return;
    }

    const { itemId } = itemIdValidation.data;
    const {
      page = 1,
      limit = 20,
      parentId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = validationResult.data;

    // Check if the item exists and user has access to it
    const item = await Item.findOne({
      _id: itemId,
      $or: [
        { userId: req.user.userId },
        { collaborators: req.user.userId },
        { isPublic: true }
      ],
      isDeleted: false,
    });

    if (!item) {
      res.status(404).json({
        message: "Item not found",
        error: "The item you're trying to view comments for doesn't exist or you don't have access to it",
      });
      return;
    }

    // Build filter object
    const filter: any = {
      itemId: itemId,
    };

    // Filter by parent ID (for threaded comments)
    if (parentId) {
      filter.parentId = parentId;
    } else {
      // If no parentId specified, get only top-level comments
      filter.parentId = { $exists: false };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get comments with pagination
    const comments = await Comment.find(filter)
      .populate("userId", "name email")
      .populate("parentId", "content")
      .populate("replies", "content")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalComments = await Comment.countDocuments(filter);
    const totalPages = Math.ceil(totalComments / limit);

    res.status(200).json({
      message: "Comments retrieved successfully",
      comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving comments",
      error: "Internal server error",
    });
    return;
  }
};

const getComment = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate comment ID from params
    const validationResult = commentIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      res.status(400).json({
        message: "Validation failed",
        error: validationResult.error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    const { commentId } = validationResult.data;

    // Find the comment and populate references
    const comment = await Comment.findById(commentId)
      .populate("userId", "name email")
      .populate("parentId", "content")
      .populate("replies", "content")
      .populate("reactions.userId", "name email");

    if (!comment) {
      res.status(404).json({
        message: "Comment not found",
        error: "The comment you're looking for doesn't exist",
      });
      return;
    }

    // Check if user has access to the item this comment belongs to
    const item = await Item.findOne({
      _id: comment.itemId,
      $or: [
        { userId: req.user.userId },
        { collaborators: req.user.userId },
        { isPublic: true }
      ],
      isDeleted: false,
    });

    if (!item) {
      res.status(403).json({
        message: "Access denied",
        error: "You don't have permission to view this comment",
      });
      return;
    }

    res.status(200).json({
      message: "Comment retrieved successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving comment",
      error: "Internal server error",
    });
    return;
  }
};

export {
  createComment,
  getComments,
  getComment,
};
