import { Request, Response } from "express";
import { Comment, Item, Page } from "../models/index";
import mongoose from "mongoose";
import {
  createCommentSchema,
  getCommentsQuerySchema,
  commentIdSchema,
  itemIdForCommentsSchema,
  updateCommentSchema,
  deleteCommentSchema,
  replyToCommentSchema,
  reactionSchema,
  resolveCommentSchema,
} from "../validations/commentValidation";
import Notification from "../models/notification.model";
import { AuthRequest } from "../models/interfaces/userModel.interface";

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

    // Check if the item or page exists and user has access to it
    let targetResource = null;
    let resourceType = '';
    
    if (validatedData.itemId) {
      targetResource = await Item.findOne({
        _id: validatedData.itemId,
        $or: [
          { userId: req.user.userId },
          { collaborators: req.user.userId },
          { isPublic: true }
        ],
        isDeleted: false,
      });
      resourceType = 'item';
    } else if (validatedData.pageId) {
      targetResource = await Page.findOne({
        _id: validatedData.pageId,
        $or: [
          { userId: req.user.userId },
          { isPublic: true }
        ],
        isDeleted: false,
      });
      resourceType = 'page';
    }

    if (!targetResource) {
      res.status(404).json({
        message: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`,
        error: `The ${resourceType} you're trying to comment on doesn't exist or you don't have access to it`,
      });
      return;
    }

    let parentComment: any = null;
    if (validatedData.parentId) {
      parentComment = await Comment.findById(validatedData.parentId);
      if (!parentComment) {
        res.status(404).json({
          message: "Parent comment not found",
          error: "The comment you're replying to doesn't exist",
        });
        return;
      }
    }

    // Create comment object
    const commentData: any = {
      userId: req.user.userId,
      content: validatedData.content,
      parentId: validatedData.parentId,
      position: validatedData.position,
      replies: [],
      isResolved: false,
      isEdited: false,
      reactions: [],
    };
    
    if (validatedData.itemId) {
      commentData.itemId = validatedData.itemId;
    }
    if (validatedData.pageId) {
      commentData.pageId = validatedData.pageId;
    }

    // Create the comment
    const comment = await Comment.create(commentData);

    // If this is a reply, update parent comment's replies array
    if (parentComment) {
      await Comment.findByIdAndUpdate(
        validatedData.parentId,
        { $push: { replies: comment._id } }
      );
    }

    // Notify the resource owner (if not the commenter)
    if (targetResource.userId.toString() !== req.user.userId) {
      try {
        await Notification.create({
          userId: targetResource.userId,
          type: "comment",
          title: `New comment on your ${resourceType}`,
          message: `A new comment was added to your ${resourceType} '${targetResource.title}'.`,
          relatedId: targetResource._id,
          relatedType: resourceType,
          senderId: req.user.userId,
          actionUrl: resourceType === 'item' ? `/items/${targetResource._id}` : `/pages/${targetResource._id}`
        });
      } catch (e) { console.error(`Notification creation error (${resourceType} owner):`, e); }
    }
    // If this is a reply, notify the parent comment author (if not the same as the commenter)
    if (parentComment && parentComment.userId && parentComment.userId.toString() !== req.user.userId) {
      try {
        await Notification.create({
          userId: parentComment.userId,
          type: "comment",
          title: "New reply to your comment",
          message: `Someone replied to your comment on ${resourceType} '${targetResource.title}'.`,
          relatedId: targetResource._id,
          relatedType: resourceType,
          senderId: req.user.userId,
          actionUrl: resourceType === 'item' ? `/items/${targetResource._id}` : `/pages/${targetResource._id}`
        });
      } catch (e) { console.error('Notification creation error (parent comment):', e); }
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

    // Get itemId or pageId from query parameters
    const { itemId, pageId } = req.query;
    if ((!itemId && !pageId) || (itemId && pageId)) {
      res.status(400).json({
        message: "Validation failed",
        error: "Either itemId or pageId must be provided (but not both)",
      });
      return;
    }
    
    const targetId = itemId || pageId;
    const resourceType = itemId ? 'item' : 'page';
    const {
      page = 1,
      limit = 20,
      parentId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = validationResult.data;

    // Check if the resource exists and user has access to it
    let targetResource = null;
    
    if (resourceType === 'item') {
      targetResource = await Item.findOne({
        _id: targetId,
        $or: [
          { userId: req.user.userId },
          { collaborators: req.user.userId },
          { isPublic: true }
        ],
        isDeleted: false,
      });
    } else {
      targetResource = await Page.findOne({
        _id: targetId,
        $or: [
          { userId: req.user.userId },
          { isPublic: true }
        ],
        isDeleted: false,
      });
    }

    if (!targetResource) {
      res.status(404).json({
        message: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`,
        error: `The ${resourceType} you're trying to view comments for doesn't exist or you don't have access to it`,
      });
      return;
    }

    // Build filter object
    const filter: any = {};
    if (resourceType === 'item') {
      filter.itemId = targetId;
    } else {
      filter.pageId = targetId;
    }

    // Filter out deleted comments
    filter.isDeleted = { $ne: true };

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

    // Check if user has access to the item or page this comment belongs to
    let targetResource = null;
    let resourceType = '';
    
    if (comment.itemId) {
      targetResource = await Item.findOne({
        _id: comment.itemId,
        $or: [
          { userId: req.user.userId },
          { collaborators: req.user.userId },
          { isPublic: true }
        ],
        isDeleted: false,
      });
      resourceType = 'item';
    } else if (comment.pageId) {
      targetResource = await Page.findOne({
        _id: comment.pageId,
        $or: [
          { userId: req.user.userId },
          { isPublic: true }
        ],
        isDeleted: false,
      });
      resourceType = 'page';
    }

    if (!targetResource) {
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

const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    const idValidation = commentIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      res.status(400).json({ message: "Validation failed", error: idValidation.error });
      return;
    }
    const validationResult = updateCommentSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ message: "Validation failed", error: validationResult.error });
      return;
    }
    const { commentId } = idValidation.data;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }
    if (String(comment.userId) !== req.user.userId) {
      res.status(403).json({ message: "Forbidden", error: "You can only edit your own comments" });
      return;
    }
    comment.content = validationResult.data.content;
    comment.isEdited = true;
    await comment.save();
    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    res.status(500).json({ message: "Error updating comment", error: "Internal server error" });
  }
};

const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    const idValidation = commentIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      res.status(400).json({ message: "Validation failed", error: idValidation.error });
      return;
    }
    const { commentId } = idValidation.data;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }
    if (String(comment.userId) !== req.user.userId) {
      res.status(403).json({ message: "Forbidden", error: "You can only delete your own comments" });
      return;
    }
    // Soft delete: set a flag or actually remove? Here, let's set a flag isDeleted
    comment.isDeleted = true;
    await comment.save();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error: "Internal server error" });
  }
};

const replyToComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    const idValidation = commentIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      res.status(400).json({ message: "Validation failed", error: idValidation.error });
      return;
    }
    const validationResult = replyToCommentSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ message: "Validation failed", error: validationResult.error });
      return;
    }
    // Reuse createComment logic, but parentId is required
    req.body.parentId = validationResult.data.parentId;
    return await createComment(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error replying to comment", error: "Internal server error" });
  }
};

const addReaction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    const idValidation = commentIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      res.status(400).json({ message: "Validation failed", error: idValidation.error });
      return;
    }
    const reactionValidation = reactionSchema.safeParse(req.body);
    if (!reactionValidation.success) {
      res.status(400).json({ message: "Validation failed", error: reactionValidation.error });
      return;
    }
    const { commentId } = idValidation.data;
    const { type } = reactionValidation.data;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }
    // Prevent duplicate reactions of the same type by the same user
    const alreadyReacted = comment.reactions.some(
      (r: any) => String(r.userId) === req.user!.userId && r.type === type
    );
    if (alreadyReacted) {
      res.status(409).json({ message: "Already reacted" });
      return;
    }
    comment.reactions.push({ userId: new mongoose.Types.ObjectId(req.user.userId) as any, type, createdAt: new Date() });
    await comment.save();
    res.status(200).json({ message: "Reaction added", comment });
  } catch (error) {
    res.status(500).json({ message: "Error adding reaction", error: "Internal server error" });
  }
};

const removeReaction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    const idValidation = commentIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      res.status(400).json({ message: "Validation failed", error: idValidation.error });
      return;
    }
    const reactionValidation = reactionSchema.safeParse(req.body);
    if (!reactionValidation.success) {
      res.status(400).json({ message: "Validation failed", error: reactionValidation.error });
      return;
    }
    const { commentId } = idValidation.data;
    const { type } = reactionValidation.data;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }
    const prevCount = comment.reactions.length;
    comment.reactions = comment.reactions.filter(
      (r: any) => !(String(r.userId) === req.user!.userId && r.type === type)
    );
    if (comment.reactions.length === prevCount) {
      res.status(404).json({ message: "Reaction not found" });
      return;
    }
    await comment.save();
    res.status(200).json({ message: "Reaction removed", comment });
  } catch (error) {
    res.status(500).json({ message: "Error removing reaction", error: "Internal server error" });
  }
};

const resolveComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized", error: "Authentication required" });
      return;
    }
    const idValidation = commentIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      res.status(400).json({ message: "Validation failed", error: idValidation.error });
      return;
    }
    const { commentId } = idValidation.data;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }
    // Only the comment author or resource owner/collaborator can resolve
    let targetResource = null;
    let resourceType = '';
    
    if (comment.itemId) {
      targetResource = await Item.findById(comment.itemId);
      resourceType = 'item';
    } else if (comment.pageId) {
      targetResource = await Page.findById(comment.pageId);
      resourceType = 'page';
    }
    
    if (!targetResource) {
      res.status(404).json({ message: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found` });
      return;
    }
    
    // Check permissions based on resource type
    let hasPermission = false;
    
    if (String(comment.userId) === req.user.userId) {
      // Comment author can always resolve
      hasPermission = true;
    } else if (resourceType === 'item') {
      // For items: owner or collaborators can resolve
      const item = targetResource as any;
      hasPermission = String(item.userId) === req.user.userId ||
        (item.collaborators && item.collaborators.map(String).includes(req.user.userId));
    } else if (resourceType === 'page') {
      // For pages: only owner can resolve (pages don't have collaborators)
      hasPermission = String(targetResource.userId) === req.user.userId;
    }
    
    if (!hasPermission) {
      res.status(403).json({ message: "Forbidden", error: "You don't have permission to resolve this comment" });
      return;
    }
    comment.isResolved = true;
    await comment.save();
    res.status(200).json({ message: "Comment marked as resolved", comment });
  } catch (error) {
    res.status(500).json({ message: "Error resolving comment", error: "Internal server error" });
  }
};

export {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
  replyToComment,
  addReaction,
  removeReaction,
  resolveComment,
};
