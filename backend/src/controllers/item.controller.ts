import { Request, Response } from "express";
import Item from "../models/item.model";
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
    const populatedItem = await Item.findById(item._id);
        
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

export { createItem };
