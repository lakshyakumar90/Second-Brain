import { Request, Response } from "express";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { Item } from "../models/index";
import cloudinary from "../config/cloudinary";
import { FILE_LIMITS } from "../config/constants";
import {
  createItemSchema,
  getItemsQuerySchema,
  itemIdSchema,
  updateItemSchema,
} from "../validations/itemValidation";
import { AuthRequest } from "../models/interfaces/userModel.interface";

const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (file) {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: `items/${req.user?.userId}`,
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              console.error("Cloudinary Error:", error);
              return reject(error);
            };
            if (result) {
              resolve(result);
            } else {
              reject(new Error("Upload failed, but no error was provided by Cloudinary."));
            }
          }
        );
        uploadStream.end(file.buffer);
      });

      res.status(201).json({ url: result.secure_url });
    } else {
      res.status(400).json({ message: "No file uploaded." });
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    res.status(500).json({ message: "Error uploading file.", error });
  }
};

const createItem = async (req: AuthRequest, res: Response) => {
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
    const validationResult = createItemSchema.safeParse(req.body);
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

    // Create item object
    const itemData = {
      userId: req.user.userId,
      type: validatedData.type,
      title: validatedData.title,
      content: validatedData.content,
      blocks: validatedData.blocks, // support blocks
      url: validatedData.url,

      // Initialize empty files array (since we're only doing avatar uploads)
      files: [],

      metadata: validatedData.metadata || {},
      categories: validatedData.categories || [],
      tags: validatedData.tags || [],
      workspace: validatedData.workspace,

      // AI data will be populated later if needed
      aiData: {
        summary: undefined,
        suggestedTags: [],
        suggestedCategories: [],
        sentiment: undefined,
        keyTopics: [],
        complexity: undefined,
        extractedEntities: [],
        lastProcessedAt: undefined,
      },

      isPublic: validatedData.isPublic,
      collaborators: validatedData.collaborators || [],
      isFavorite: validatedData.isFavorite,
      isArchived: validatedData.isArchived,
      isDeleted: false,

      viewCount: 0,
      lastViewedAt: new Date(),
      lastEditedAt: new Date(),
      lastEditedBy: req.user.userId,

      version: 1,
      parentId: validatedData.parentId,
    };

    // Create the item
    const item = await Item.create(itemData);

    // Populate references for response
    const populatedItem = await Item.findById(item._id)
      .populate("categories", "name")
      .populate("workspace", "name")
      .populate("collaborators", "name email")
      .populate("lastEditedBy", "name");

    res.status(201).json({
      message: "Item created successfully",
      item: populatedItem,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        res.status(409).json({
          message: "Item already exists",
          error: "An item with this title already exists",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error creating item",
      error: "Internal server error",
    });
    return;
  }
};

const getItems = async (req: AuthRequest, res: Response) => {
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
    const validationResult = getItemsQuerySchema.safeParse(req.query);
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
      type,
      isPublic,
      isFavorite,
      isArchived,
      search,
      tags,
      categories,
      workspace,
      socialPlatform,
      sentiment,
      complexity,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = validationResult.data;

    // Build filter object
    const filter: any = {
      userId: req.user.userId,
      isDeleted: false, // Always exclude deleted items
    };

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Boolean filters
    if (isPublic !== undefined) {
      filter.isPublic = isPublic;
    }

    if (isFavorite !== undefined) {
      filter.isFavorite = isFavorite;
    }

    if (isArchived !== undefined) {
      filter.isArchived = isArchived;
    }

    // Search filter (search in title, content, and extracted text)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { "metadata.extractedText": { $regex: search, $options: "i" } },
        { "metadata.description": { $regex: search, $options: "i" } },
      ];
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(",").map((tag: string) => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Categories filter
    if (categories) {
      const categoryArray = categories.split(",").map((cat: string) => cat.trim());
      filter.categories = { $in: categoryArray };
    }

    // Workspace filter
    if (workspace) {
      filter.workspace = workspace;
    }

    // Social platform filter
    if (socialPlatform) {
      filter["metadata.socialPlatform"] = socialPlatform;
    }

    // AI sentiment filter
    if (sentiment) {
      filter["aiData.sentiment"] = sentiment;
    }

    // AI complexity filter
    if (complexity) {
      filter["aiData.complexity"] = complexity;
    }

    // Date range filters
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [items, totalItems] = await Promise.all([
      Item.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("categories", "name color icon")
        .populate("workspace", "name description")
        .populate("lastEditedBy", "name username")
        .lean(),
      Item.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Prepare response
    const response = {
      message: "Items retrieved successfully",
      data: {
        items,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          applied: {
            type,
            isPublic,
            isFavorite,
            isArchived,
            search,
            tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : undefined,
            categories: categories ? categories.split(",").map((cat: string) => cat.trim()) : undefined,
            workspace,
            socialPlatform,
            sentiment,
            complexity,
            dateFrom,
            dateTo,
            sortBy,
            sortOrder,
          },
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({
      message: "Error retrieving items",
      error: "Internal server error",
    });
  }
};

const getItem = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate item ID parameter
    const validationResult = itemIdSchema.safeParse(req.params);
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

    const { itemId } = validationResult.data;

    // Find the item and ensure it belongs to the authenticated user
    const item = await Item.findOne({
      _id: itemId,
      userId: req.user.userId,
      isDeleted: false,
    })
      .populate("categories", "name color icon")
      .populate("workspace", "name description")
      .populate("lastEditedBy", "name username")
      .populate("collaborators", "name username email")
      .lean();

    if (!item) {
      res.status(404).json({
        message: "Item not found",
        error: "The requested item does not exist or you don't have access to it",
      });
      return;
    }

    // Increment view count and update last viewed timestamp
    await Item.findByIdAndUpdate(itemId, {
      $inc: { viewCount: 1 },
      lastViewedAt: new Date(),
    });

    // Add the updated view count to the response
    const itemWithUpdatedViews = {
      ...item,
      viewCount: item.viewCount + 1,
      lastViewedAt: new Date(),
    };

    res.status(200).json({
      message: "Item retrieved successfully",
      item: itemWithUpdatedViews,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid item ID",
          error: "The provided item ID is not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error retrieving item",
      error: "Internal server error",
    });
  }
};

const updateItem = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate item ID parameter
    const idValidationResult = itemIdSchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({
        message: "Validation failed",
        error: idValidationResult.error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    // Validate update data
    const updateValidationResult = updateItemSchema.safeParse(req.body);
    if (!updateValidationResult.success) {
      res.status(400).json({
        message: "Validation failed",
        error: updateValidationResult.error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    const { itemId } = idValidationResult.data;
    const updateData = updateValidationResult.data;

    // Find the item and ensure it belongs to the authenticated user
    const existingItem = await Item.findOne({
      _id: itemId,
      userId: req.user.userId,
      isDeleted: false,
    });

    if (!existingItem) {
      res.status(404).json({
        message: "Item not found",
        error: "The requested item does not exist or you don't have access to it",
      });
      return;
    }

    // Prepare update object with tracking fields
    const updateObject = {
      ...updateData,
      lastEditedAt: new Date(),
      lastEditedBy: req.user.userId,
      version: existingItem.version + 1, // Increment version
    };

    // Update the item
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      updateObject,
      { new: true, runValidators: true }
    )
      .populate("categories", "name")
      .populate("workspace", "name")
      .populate("collaborators", "name email")
      .populate("lastEditedBy", "name");

    if (!updatedItem) {
      res.status(500).json({
        message: "Error updating item",
        error: "Failed to update the item",
      });
      return;
    }

    res.status(200).json({
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid item ID",
          error: "The provided item ID is not valid",
        });
        return;
      }
      
      if (error.message.includes("duplicate key")) {
        res.status(409).json({
          message: "Item already exists",
          error: "An item with this title already exists",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error updating item",
      error: "Internal server error",
    });
  }
};

const deleteItem = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate item ID parameter
    const validationResult = itemIdSchema.safeParse(req.params);
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

    const { itemId } = validationResult.data;

    // Find the item and ensure it belongs to the authenticated user
    const existingItem = await Item.findOne({
      _id: itemId,
      userId: req.user.userId,
      isDeleted: false, // Only find non-deleted items
    });

    if (!existingItem) {
      res.status(404).json({
        message: "Item not found",
        error: "The requested item does not exist or you don't have access to it",
      });
      return;
    }

    // Perform soft delete by setting isDeleted to true
    const deletedItem = await Item.findByIdAndUpdate(
      itemId,
      {
        isDeleted: true,
        lastEditedAt: new Date(),
        lastEditedBy: req.user.userId,
        version: existingItem.version + 1, // Increment version for audit trail
      },
      { new: true, runValidators: true }
    )
      .populate("categories", "name")
      .populate("workspace", "name")
      .populate("lastEditedBy", "name");

    if (!deletedItem) {
      res.status(500).json({
        message: "Error deleting item",
        error: "Failed to delete the item",
      });
      return;
    }

    res.status(200).json({
      message: "Item deleted successfully",
      item: deletedItem,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid item ID",
          error: "The provided item ID is not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error deleting item",
      error: "Internal server error",
    });
  }
};

const restoreItem = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate item ID parameter
    const validationResult = itemIdSchema.safeParse(req.params);
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

    const { itemId } = validationResult.data;

    // Find the item and ensure it belongs to the authenticated user and is deleted
    const existingItem = await Item.findOne({
      _id: itemId,
      userId: req.user.userId,
      isDeleted: true, // Only find deleted items
    });

    if (!existingItem) {
      res.status(404).json({
        message: "Item not found",
        error: "The requested item does not exist, is not deleted, or you don't have access to it",
      });
      return;
    }

    // Restore the item by setting isDeleted to false
    const restoredItem = await Item.findByIdAndUpdate(
      itemId,
      {
        isDeleted: false,
        lastEditedAt: new Date(),
        lastEditedBy: req.user.userId,
        version: existingItem.version + 1, // Increment version for audit trail
      },
      { new: true, runValidators: true }
    )
      .populate("categories", "name")
      .populate("workspace", "name")
      .populate("lastEditedBy", "name");

    if (!restoredItem) {
      res.status(500).json({
        message: "Error restoring item",
        error: "Failed to restore the item",
      });
      return;
    }

    res.status(200).json({
      message: "Item restored successfully",
      item: restoredItem,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid item ID",
          error: "The provided item ID is not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error restoring item",
      error: "Internal server error",
    });
  }
};

const bulkDelete = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate request body: must be an array of IDs
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every(id => typeof id === "string" && id.length > 0)) {
      res.status(400).json({
        message: "Validation failed",
        error: "Request body must contain an array of item IDs.",
      });
      return;
    }

    // Only delete items that belong to the user and are not already deleted
    const result = await Item.updateMany(
      {
        _id: { $in: ids },
        userId: req.user.userId,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          lastEditedAt: new Date(),
          lastEditedBy: req.user.userId,
        },
        $inc: { version: 1 },
      }
    );

    res.status(200).json({
      message: "Bulk delete completed",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({
      message: "Error bulk deleting items",
      error: "Internal server error",
    });
  }
};

const bulkRestore = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate request body: must be an array of IDs
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every(id => typeof id === "string" && id.length > 0)) {
      res.status(400).json({
        message: "Validation failed",
        error: "Request body must contain an array of item IDs.",
      });
      return;
    }

    // Only restore items that belong to the user and are currently deleted
    const result = await Item.updateMany(
      {
        _id: { $in: ids },
        userId: req.user.userId,
        isDeleted: true,
      },
      {
        $set: {
          isDeleted: false,
          lastEditedAt: new Date(),
          lastEditedBy: req.user.userId,
        },
        $inc: { version: 1 },
      }
    );

    res.status(200).json({
      message: "Bulk restore completed",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    res.status(500).json({
      message: "Error bulk restoring items",
      error: "Internal server error",
    });
  }
};

const duplicateItem = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate item ID parameter
    const validationResult = itemIdSchema.safeParse(req.params);
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

    const { itemId } = validationResult.data;

    // Find the original item and ensure it belongs to the authenticated user
    const originalItem = await Item.findOne({
      _id: itemId,
      userId: req.user.userId,
      isDeleted: false,
    }).lean();

    if (!originalItem) {
      res.status(404).json({
        message: "Item not found",
        error: "The requested item does not exist or you don't have access to it",
      });
      return;
    }

    // Create a copy of the item with new metadata
    const duplicatedItemData = {
      userId: req.user.userId,
      type: originalItem.type,
      title: `${originalItem.title} (Copy)`,
      content: originalItem.content,
      blocks: originalItem.blocks, // copy blocks if present
      url: originalItem.url,
      files: originalItem.files, // Copy files array
      metadata: originalItem.metadata,
      categories: originalItem.categories,
      tags: originalItem.tags,
      workspace: originalItem.workspace,
      aiData: originalItem.aiData,
      isPublic: false, // Default to private for copied items
      collaborators: [], // Reset collaborators for copied item
      isFavorite: false, // Reset favorite status
      isArchived: false, // Reset archived status
      isDeleted: false,
      viewCount: 0, // Reset view count
      lastViewedAt: new Date(),
      lastEditedAt: new Date(),
      lastEditedBy: req.user.userId,
      version: 1, // Reset version
      parentId: originalItem._id, // Reference to original item
    };

    // Create the duplicated item
    const duplicatedItem = await Item.create(duplicatedItemData);

    // Populate references for response
    const populatedDuplicatedItem = await Item.findById(duplicatedItem._id)
      .populate("categories", "name")
      .populate("workspace", "name")
      .populate("collaborators", "name email")
      .populate("lastEditedBy", "name")
      .populate("parentId", "title"); // Show original item title

    res.status(201).json({
      message: "Item duplicated successfully",
      item: populatedDuplicatedItem,
      originalItem: {
        id: originalItem._id,
        title: originalItem.title,
      },
    });
  } catch (error) {
    // Error is handled by response only, not logged
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid item ID",
          error: "The provided item ID is not valid",
        });
        return;
      }
      
      if (error.message.includes("duplicate key")) {
        res.status(409).json({
          message: "Item already exists",
          error: "An item with this title already exists",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error duplicating item",
      error: "Internal server error",
    });
  }
};

const favoriteItem = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate item ID parameter
    const validationResult = itemIdSchema.safeParse(req.params);
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

    const { itemId } = validationResult.data;

    // Find the item and ensure it belongs to the authenticated user
    const existingItem = await Item.findOne({
      _id: itemId,
      userId: req.user.userId,
      isDeleted: false,
    });

    if (!existingItem) {
      res.status(404).json({
        message: "Item not found",
        error: "The requested item does not exist or you don't have access to it",
      });
      return;
    }

    // Toggle the favorite status
    const newFavoriteStatus = !existingItem.isFavorite;

    // Update the item
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      {
        isFavorite: newFavoriteStatus,
        lastEditedAt: new Date(),
        lastEditedBy: req.user.userId,
        version: existingItem.version + 1,
      },
      { new: true, runValidators: true }
    )
      .populate("categories", "name")
      .populate("workspace", "name")
      .populate("lastEditedBy", "name");

    if (!updatedItem) {
      res.status(500).json({
        message: "Error updating item",
        error: "Failed to update the item",
      });
      return;
    }

    res.status(200).json({
      message: `Item ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`,
      item: updatedItem,
      isFavorite: newFavoriteStatus,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid item ID",
          error: "The provided item ID is not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error toggling favorite status",
      error: "Internal server error",
    });
  }
};

const archiveItem = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate item ID parameter
    const validationResult = itemIdSchema.safeParse(req.params);
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

    const { itemId } = validationResult.data;

    // Find the item and ensure it belongs to the authenticated user
    const existingItem = await Item.findOne({
      _id: itemId,
      userId: req.user.userId,
      isDeleted: false,
    });

    if (!existingItem) {
      res.status(404).json({
        message: "Item not found",
        error: "The requested item does not exist or you don't have access to it",
      });
      return;
    }

    // Toggle the archive status
    const newArchiveStatus = !existingItem.isArchived;

    // Update the item
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      {
        isArchived: newArchiveStatus,
        lastEditedAt: new Date(),
        lastEditedBy: req.user.userId,
        version: existingItem.version + 1,
      },
      { new: true, runValidators: true }
    )
      .populate("categories", "name")
      .populate("workspace", "name")
      .populate("lastEditedBy", "name");

    if (!updatedItem) {
      res.status(500).json({
        message: "Error updating item",
        error: "Failed to update the item",
      });
      return;
    }

    res.status(200).json({
      message: `Item ${newArchiveStatus ? 'archived' : 'unarchived'}`,
      item: updatedItem,
      isArchived: newArchiveStatus,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid item ID",
          error: "The provided item ID is not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error toggling archive status",
      error: "Internal server error",
    });
  }
};

const getItemAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate item ID parameter
    const validationResult = itemIdSchema.safeParse(req.params);
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

    const { itemId } = validationResult.data;

    // Find the item and ensure it belongs to the authenticated user
    const item = await Item.findOne({
      _id: itemId,
      userId: req.user.userId,
      isDeleted: false,
    }).lean();

    if (!item) {
      res.status(404).json({
        message: "Item not found",
        error: "The requested item does not exist or you don't have access to it",
      });
      return;
    }

    // Get analytics data
    const analytics = {
      itemId: item._id,
      title: item.title,
      type: item.type,
      
      // View statistics
      viewCount: item.viewCount,
      lastViewedAt: item.lastViewedAt,
      
      // Edit statistics
      version: item.version,
      lastEditedAt: item.lastEditedAt,
      lastEditedBy: item.lastEditedBy,
      
      // File statistics
      fileCount: item.files.length,
      totalFileSize: item.files.reduce((total, file) => total + (file.size || 0), 0),
      
      // Content statistics
      contentLength: item.content ? item.content.length : 0,
      wordCount: item.metadata?.wordCount || 0,
      readingTime: item.metadata?.readingTime || 0,
      
      // Status flags
      isPublic: item.isPublic,
      isFavorite: item.isFavorite,
      isArchived: item.isArchived,
      
      // Creation and update info
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      
      // AI data statistics
      aiData: {
        hasSummary: !!item.aiData?.summary,
        hasSentiment: !!item.aiData?.sentiment,
        hasComplexity: !!item.aiData?.complexity,
        suggestedTagsCount: item.aiData?.suggestedTags?.length || 0,
        suggestedCategoriesCount: item.aiData?.suggestedCategories?.length || 0,
        keyTopicsCount: item.aiData?.keyTopics?.length || 0,
        extractedEntitiesCount: item.aiData?.extractedEntities?.length || 0,
        lastProcessedAt: item.aiData?.lastProcessedAt,
      },
      
      // Collaboration statistics
      collaboratorsCount: item.collaborators?.length || 0,
      
      // Category and tag statistics
      categoriesCount: item.categories?.length || 0,
      tagsCount: item.tags?.length || 0,
    };

    res.status(200).json({
      message: "Item analytics retrieved successfully",
      analytics: analytics,
    });
  } catch (error) {
    // Error is handled by response only, not logged
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid item ID",
          error: "The provided item ID is not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error retrieving item analytics",
      error: "Internal server error",
    });
  }
};

export { createItem, getItems, getItem, updateItem, deleteItem, restoreItem, bulkDelete, bulkRestore, duplicateItem, favoriteItem, archiveItem, uploadFile, getItemAnalytics };
