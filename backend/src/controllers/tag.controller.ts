import { Request, Response } from "express";
import mongoose from "mongoose";
import { Tag, Item } from "../models/index";
import { AuthRequest } from "../models/interfaces/userModel.interface";
import {
  createTagSchema,
  getTagsQuerySchema,
  tagIdSchema,
  updateTagSchema,
  bulkTagOperationsSchema,
  getTagSuggestionsSchema,
} from "../validations/tagValidation";

const createTag = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    const validationResult = createTagSchema.safeParse(req.body);
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

    // Check if tag name already exists for this user
    const existingTag = await Tag.findOne({
      userId: req.user.userId,
      name: validatedData.name.toLowerCase(),
      isDeleted: false,
    });

    if (existingTag) {
      res.status(409).json({
        message: "Tag already exists",
        error: "A tag with this name already exists",
      });
      return;
    }

    const tagData = {
      userId: req.user.userId,
      name: validatedData.name.toLowerCase(),
      color: validatedData.color,
      description: validatedData.description,
      isDefault: validatedData.isDefault,
      isPublic: validatedData.isPublic,
      sortOrder: validatedData.sortOrder,
      autoSuggest: validatedData.autoSuggest,
      aiKeywords: validatedData.aiKeywords || [],
    };

    const tag = await Tag.create(tagData);

    res.status(201).json({
      message: "Tag created successfully",
      tag: tag,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        res.status(409).json({
          message: "Tag already exists",
          error: "A tag with this name already exists",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error creating tag",
      error: "Internal server error",
    });
  }
};

const getTags = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    const validationResult = getTagsQuerySchema.safeParse(req.query);
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

    const {
      page = 1,
      limit = 20,
      search,
      isDefault,
      isPublic,
      sortBy = "usageCount",
      sortOrder = "desc",
    } = validationResult.data;

    const filter: any = {
      userId: req.user.userId,
      isDeleted: false,
    };

    if (isDefault !== undefined) {
      filter.isDefault = isDefault;
    }

    if (isPublic !== undefined) {
      filter.isPublic = isPublic;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [tags, totalTags] = await Promise.all([
      Tag.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Tag.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalTags / limit);

    res.status(200).json({
      message: "Tags retrieved successfully",
      data: {
        tags,
        pagination: {
          currentPage: page,
          totalPages,
          totalTags,
          tagsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          applied: {
            search,
            isDefault,
            isPublic,
            sortBy,
            sortOrder,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving tags",
      error: "Internal server error",
    });
  }
};

const getTag = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    const validationResult = tagIdSchema.safeParse(req.params);
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

    const { tagId } = validationResult.data;

    const tag = await Tag.findOne({
      _id: tagId,
      userId: req.user.userId,
      isDeleted: false,
    }).lean();

    if (!tag) {
      res.status(404).json({
        message: "Tag not found",
        error: "The requested tag does not exist or you don't have access to it",
      });
      return;
    }

    res.status(200).json({
      message: "Tag retrieved successfully",
      tag: tag,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid tag ID",
          error: "The provided tag ID is not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error retrieving tag",
      error: "Internal server error",
    });
  }
};

const updateTag = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    const validationResult = updateTagSchema.safeParse(req.body);
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

    const { tagId } = req.params;
    const validatedData = validationResult.data;

    const tag = await Tag.findOne({
      _id: tagId,
      userId: req.user.userId,
      isDeleted: false,
    });

    if (!tag) {
      res.status(404).json({
        message: "Tag not found",
        error: "The requested tag does not exist or you don't have access to it",
      });
      return;
    }

    // Check for name conflicts if name is being updated
    if (validatedData.name && validatedData.name.toLowerCase() !== tag.name) {
      const existingTag = await Tag.findOne({
        userId: req.user.userId,
        name: validatedData.name.toLowerCase(),
        _id: { $ne: tagId },
        isDeleted: false,
      });

      if (existingTag) {
        res.status(409).json({
          message: "Tag name already exists",
          error: "A tag with this name already exists",
        });
        return;
      }
    }

    // Update tag
    const updatedTag = await Tag.findByIdAndUpdate(
      tagId,
      {
        ...validatedData,
        ...(validatedData.name && { name: validatedData.name.toLowerCase() }),
      },
      { new: true }
    );

    res.status(200).json({
      message: "Tag updated successfully",
      tag: updatedTag,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating tag",
      error: "Internal server error",
    });
  }
};

const deleteTag = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    const validationResult = tagIdSchema.safeParse(req.params);
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

    const { tagId } = validationResult.data;

    const tag = await Tag.findOne({
      _id: tagId,
      userId: req.user.userId,
      isDeleted: false,
    });

    if (!tag) {
      res.status(404).json({
        message: "Tag not found",
        error: "The requested tag does not exist or you don't have access to it",
      });
      return;
    }

    // Soft delete the tag
    const deletedTag = await Tag.findByIdAndUpdate(
      tagId,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    // Remove tag from all items
    await Item.updateMany(
      { userId: req.user.userId, tags: tag.name },
      { $pull: { tags: tag.name } }
    );

    res.status(200).json({
      message: "Tag deleted successfully",
      tag: deletedTag,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting tag",
      error: "Internal server error",
    });
  }
};

const restoreTag = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    const validationResult = tagIdSchema.safeParse(req.params);
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

    const { tagId } = validationResult.data;

    const tag = await Tag.findOne({
      _id: tagId,
      userId: req.user.userId,
      isDeleted: true,
    });

    if (!tag) {
      res.status(404).json({
        message: "Tag not found",
        error: "The requested tag does not exist or you don't have access to it",
      });
      return;
    }

    const restoredTag = await Tag.findByIdAndUpdate(
      tagId,
      {
        isDeleted: false,
        deletedAt: undefined,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Tag restored successfully",
      tag: restoredTag,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error restoring tag",
      error: "Internal server error",
    });
  }
};

const getTagSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    const validationResult = getTagSuggestionsSchema.safeParse(req.query);
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

    const { query, limit = 10 } = validationResult.data;

    const suggestions = await Tag.find({
      userId: req.user.userId,
      name: { $regex: query, $options: "i" },
      isDeleted: false,
    })
      .sort({ usageCount: -1, name: 1 })
      .limit(limit)
      .select("name color usageCount")
      .lean();

    res.status(200).json({
      message: "Tag suggestions retrieved successfully",
      suggestions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving tag suggestions",
      error: "Internal server error",
    });
  }
};

const bulkDeleteTags = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    const validationResult = bulkTagOperationsSchema.safeParse(req.body);
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

    const { ids } = validationResult.data;

    const tags = await Tag.find({
      _id: { $in: ids },
      userId: req.user.userId,
      isDeleted: false,
    });

    if (tags.length === 0) {
      res.status(404).json({
        message: "No tags found",
        error: "No valid tags found to delete",
      });
      return;
    }

    // Soft delete tags
    const result = await Tag.updateMany(
      {
        _id: { $in: ids },
        userId: req.user.userId,
        isDeleted: false,
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    );

    // Remove tags from all items
    const tagNames = tags.map(tag => tag.name);
    await Item.updateMany(
      { userId: req.user.userId, tags: { $in: tagNames } },
      { $pull: { tags: { $in: tagNames } } }
    );

    res.status(200).json({
      message: `Successfully deleted ${result.modifiedCount} tags`,
      deletedCount: result.modifiedCount,
      tags: tags.map(tag => ({ _id: tag._id, name: tag.name })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting tags",
      error: "Internal server error",
    });
  }
};

const bulkRestoreTags = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    const validationResult = bulkTagOperationsSchema.safeParse(req.body);
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

    const { ids } = validationResult.data;

    const result = await Tag.updateMany(
      {
        _id: { $in: ids },
        userId: req.user.userId,
        isDeleted: true,
      },
      {
        isDeleted: false,
        deletedAt: undefined,
      }
    );

    res.status(200).json({
      message: `Successfully restored ${result.modifiedCount} tags`,
      restoredCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error restoring tags",
      error: "Internal server error",
    });
  }
};

export {
  createTag,
  getTags,
  getTag,
  updateTag,
  deleteTag,
  restoreTag,
  getTagSuggestions,
  bulkDeleteTags,
  bulkRestoreTags,
};
