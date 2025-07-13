import { Request, Response } from "express";
import { Item } from "../models/index";
import {
  createItemSchema,
  getItemsQuerySchema,
  itemIdSchema,
} from "../validations/itemValidation";

interface AuthRequest extends Request {
  user?: { userId: string };
}

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
    console.error("Error creating item:", error);

    // Handle specific errors
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
    console.error("Error retrieving items:", error);

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

    const { id: itemId } = validationResult.data;

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
    console.error("Error retrieving item:", error);

    // Handle specific errors
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

export { createItem, getItems, getItem };
