import { Request, Response } from "express";
import { Category } from "../models/index";
import {
  createCategorySchema,
  getCategoriesQuerySchema,
  categoryIdSchema,
  updateCategorySchema,
} from "../validations/categoryValidation";

interface AuthRequest extends Request {
  user?: { userId: string };
}

const createCategory = async (req: AuthRequest, res: Response) => {
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
    const validationResult = createCategorySchema.safeParse(req.body);
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

    // Check if category name already exists for this user
    const existingCategory = await Category.findOne({
      userId: req.user.userId,
      name: validatedData.name,
    });

    if (existingCategory) {
      res.status(409).json({
        message: "Category already exists",
        error: "A category with this name already exists",
      });
      return;
    }

    // If parentId is provided, validate it exists and belongs to the user
    if (validatedData.parentId) {
      const parentCategory = await Category.findOne({
        _id: validatedData.parentId,
        userId: req.user.userId,
      });

      if (!parentCategory) {
        res.status(404).json({
          message: "Parent category not found",
          error: "The specified parent category does not exist or you don't have access to it",
        });
        return;
      }
    }

    // Create category object
    const categoryData = {
      userId: req.user.userId,
      name: validatedData.name,
      description: validatedData.description,
      color: validatedData.color,
      icon: validatedData.icon,
      parentId: validatedData.parentId,
      isDefault: validatedData.isDefault,
      isPublic: validatedData.isPublic,
      sortOrder: validatedData.sortOrder,
      autoClassify: validatedData.autoClassify,
      aiKeywords: validatedData.aiKeywords || [],
      itemCount: 0,
    };

    // Create the category
    const category = await Category.create(categoryData);

    // Populate references for response
    const populatedCategory = await Category.findById(category._id)
      .populate("parentId", "name color");

    res.status(201).json({
      message: "Category created successfully",
      category: populatedCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        res.status(409).json({
          message: "Category already exists",
          error: "A category with this name already exists",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error creating category",
      error: "Internal server error",
    });
  }
};

const getCategories = async (req: AuthRequest, res: Response) => {
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
    const validationResult = getCategoriesQuerySchema.safeParse(req.query);
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
      isDefault,
      isPublic,
      parentId,
      search,
      sortBy = "sortOrder",
      sortOrder = "asc",
    } = validationResult.data;

    // Build filter object
    const filter: any = {
      userId: req.user.userId,
    };

    // Boolean filters
    if (isDefault !== undefined) {
      filter.isDefault = isDefault;
    }

    if (isPublic !== undefined) {
      filter.isPublic = isPublic;
    }

    // Parent filter
    if (parentId) {
      filter.parentId = parentId;
    } else if (parentId === null) {
      // Get only root categories (no parent)
      filter.parentId = { $exists: false };
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [categories, totalCategories] = await Promise.all([
      Category.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("parentId", "name color")
        .lean(),
      Category.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCategories / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: "Categories retrieved successfully",
      data: {
        categories,
        pagination: {
          currentPage: page,
          totalPages,
          totalCategories,
          categoriesPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          applied: {
            isDefault,
            isPublic,
            parentId,
            search,
            sortBy,
            sortOrder,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error retrieving categories:", error);

    res.status(500).json({
      message: "Error retrieving categories",
      error: "Internal server error",
    });
  }
};

const getCategory = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate category ID parameter
    const validationResult = categoryIdSchema.safeParse(req.params);
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

    const { id: categoryId } = validationResult.data;

    // Find the category and ensure it belongs to the authenticated user
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.user.userId,
    })
      .populate("parentId", "name color")
      .lean();

    if (!category) {
      res.status(404).json({
        message: "Category not found",
        error: "The requested category does not exist or you don't have access to it",
      });
      return;
    }

    res.status(200).json({
      message: "Category retrieved successfully",
      category: category,
    });
  } catch (error) {
    console.error("Error retrieving category:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid category ID",
          error: "The provided category ID is not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error retrieving category",
      error: "Internal server error",
    });
  }
};

const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
        error: "Authentication required",
      });
      return;
    }

    // Validate category ID parameter
    const idValidationResult = categoryIdSchema.safeParse(req.params);
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

    // Validate request body
    const bodyValidationResult = updateCategorySchema.safeParse(req.body);
    if (!bodyValidationResult.success) {
      res.status(400).json({
        message: "Validation failed",
        error: bodyValidationResult.error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    const { id: categoryId } = idValidationResult.data;
    const validatedData = bodyValidationResult.data;

    // Find the category and ensure it belongs to the authenticated user
    const existingCategory = await Category.findOne({
      _id: categoryId,
      userId: req.user.userId,
    });

    if (!existingCategory) {
      res.status(404).json({
        message: "Category not found",
        error: "The requested category does not exist or you don't have access to it",
      });
      return;
    }

    // If name is being updated, check for duplicates (excluding current category)
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const duplicateCategory = await Category.findOne({
        userId: req.user.userId,
        name: validatedData.name,
        _id: { $ne: categoryId }, // Exclude current category
      });

      if (duplicateCategory) {
        res.status(409).json({
          message: "Category name already exists",
          error: "A category with this name already exists",
        });
        return;
      }
    }

    // If parentId is being updated, validate it exists and belongs to the user
    if (validatedData.parentId !== undefined) {
      // Prevent setting parent to itself
      if (validatedData.parentId === categoryId) {
        res.status(400).json({
          message: "Invalid parent category",
          error: "A category cannot be its own parent",
        });
        return;
      }

      // If setting a parent, validate it exists
      if (validatedData.parentId) {
        const parentCategory = await Category.findOne({
          _id: validatedData.parentId,
          userId: req.user.userId,
        });

        if (!parentCategory) {
          res.status(404).json({
            message: "Parent category not found",
            error: "The specified parent category does not exist or you don't have access to it",
          });
          return;
        }

        // Prevent circular references by checking if the parent is a descendant of this category
        const isCircular = await checkCircularReference(categoryId, validatedData.parentId, req.user.userId);
        if (isCircular) {
          res.status(400).json({
            message: "Circular reference detected",
            error: "Cannot set parent category as it would create a circular reference",
          });
          return;
        }
      }
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        ...validatedData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("parentId", "name color");

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid category ID",
          error: "The provided category ID is not valid",
        });
        return;
      }
      if (error.message.includes("duplicate key")) {
        res.status(409).json({
          message: "Category name already exists",
          error: "A category with this name already exists",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error updating category",
      error: "Internal server error",
    });
  }
};

// Helper function to check for circular references in category hierarchy
const checkCircularReference = async (
  categoryId: string,
  newParentId: string,
  userId: string
): Promise<boolean> => {
  let currentParentId: string | null = newParentId;
  const visited = new Set<string>();

  while (currentParentId) {
    if (visited.has(currentParentId)) {
      return true; // Circular reference detected
    }

    if (currentParentId === categoryId) {
      return true; // Direct circular reference
    }

    visited.add(currentParentId);

    const parent: any = await Category.findOne(
      { _id: currentParentId, userId },
      { parentId: 1 }
    );

    if (!parent) {
      break;
    }

    currentParentId = parent.parentId?.toString() || null;
  }

  return false;
};

export { createCategory, getCategories, getCategory, updateCategory };
