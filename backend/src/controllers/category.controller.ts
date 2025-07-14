import { Request, Response } from "express";
import mongoose from "mongoose";
import { Category, Item } from "../models/index";
import {
  createCategorySchema,
  getCategoriesQuerySchema,
  categoryIdSchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  getCategoryItemsQuerySchema,
  bulkCategorizeSchema,
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
          error:
            "The specified parent category does not exist or you don't have access to it",
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
    const populatedCategory = await Category.findById(category._id).populate(
      "parentId",
      "name color"
    );

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
      isDeleted: false, // Exclude deleted categories
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

    const { categoryId } = validationResult.data;

    // Find the category and ensure it belongs to the authenticated user
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.user.userId,
      isDeleted: false, // Exclude deleted categories
    })
      .populate("parentId", "name color")
      .lean();

    if (!category) {
      res.status(404).json({
        message: "Category not found",
        error:
          "The requested category does not exist or you don't have access to it",
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

    const { categoryId } = idValidationResult.data;
    const validatedData = bodyValidationResult.data;

    // Find the category and ensure it belongs to the authenticated user
    const existingCategory = await Category.findOne({
      _id: categoryId,
      userId: req.user.userId,
      isDeleted: false, // Exclude deleted categories
    });

    if (!existingCategory) {
      res.status(404).json({
        message: "Category not found",
        error:
          "The requested category does not exist or you don't have access to it",
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
            error:
              "The specified parent category does not exist or you don't have access to it",
          });
          return;
        }

        // Prevent circular references by checking if the parent is a descendant of this category
        const isCircular = await checkCircularReference(
          categoryId,
          validatedData.parentId,
          req.user.userId
        );
        if (isCircular) {
          res.status(400).json({
            message: "Circular reference detected",
            error:
              "Cannot set parent category as it would create a circular reference",
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

const deleteCategory = async (req: AuthRequest, res: Response) => {
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

    const { categoryId } = validationResult.data;

    // Find the category and ensure it belongs to the authenticated user
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.user.userId,
      isDeleted: false,
    });

    if (!category) {
      res.status(404).json({
        message: "Category not found",
        error:
          "The requested category does not exist or you don't have access to it",
      });
      return;
    }

    // Check if category has child categories
    const childCategories = await Category.countDocuments({
      parentId: categoryId,
      userId: req.user.userId,
      isDeleted: false,
    });

    if (childCategories > 0) {
      res.status(400).json({
        message: "Cannot delete category",
        error:
          "This category has child categories. Please move or delete child categories first.",
      });
      return;
    }

    // Check if category has items
    if (category.itemCount > 0) {
      res.status(400).json({
        message: "Cannot delete category",
        error:
          "This category contains items. Please move or delete all items first.",
      });
      return;
    }

    // Soft delete the category
    const deletedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    ).populate("parentId", "name color");

    res.status(200).json({
      message: "Category deleted successfully",
      category: deletedCategory,
    });
  } catch (error) {
    console.error("Error deleting category:", error);

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
      message: "Error deleting category",
      error: "Internal server error",
    });
  }
};

const restoreCategory = async (req: AuthRequest, res: Response) => {
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

    const { categoryId } = validationResult.data;

    // Find the deleted category and ensure it belongs to the authenticated user
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.user.userId,
      isDeleted: true,
    });

    if (!category) {
      res.status(404).json({
        message: "Deleted category not found",
        error:
          "The requested deleted category does not exist or you don't have access to it",
      });
      return;
    }

    // Check if parent category still exists (if category had a parent)
    if (category.parentId) {
      const parentCategory = await Category.findOne({
        _id: category.parentId,
        userId: req.user.userId,
        isDeleted: false,
      });

      if (!parentCategory) {
        res.status(400).json({
          message: "Cannot restore category",
          error:
            "The parent category no longer exists. Please restore the parent category first or remove the parent reference.",
        });
        return;
      }
    }

    // Check for name conflicts with existing categories
    const existingCategoryWithSameName = await Category.findOne({
      userId: req.user.userId,
      name: category.name,
      isDeleted: false,
      _id: { $ne: categoryId },
    });

    if (existingCategoryWithSameName) {
      res.status(409).json({
        message: "Cannot restore category",
        error:
          "A category with this name already exists. Please rename the category before restoring.",
      });
      return;
    }

    // Restore the category
    const restoredCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        isDeleted: false,
        deletedAt: undefined,
      },
      { new: true }
    ).populate("parentId", "name color");

    res.status(200).json({
      message: "Category restored successfully",
      category: restoredCategory,
    });
  } catch (error) {
    console.error("Error restoring category:", error);

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
      message: "Error restoring category",
      error: "Internal server error",
    });
  }
};

const bulkDeleteCategories = async (req: AuthRequest, res: Response) => {
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
    const { ids: categoryIds } = req.body;

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      res.status(400).json({
        message: "Validation failed",
        error: "categoryIds must be a non-empty array",
      });
      return;
    }

    if (categoryIds.length > 50) {
      res.status(400).json({
        message: "Validation failed",
        error: "Cannot delete more than 50 categories at once",
      });
      return;
    }

    // Validate each category ID
    for (const id of categoryIds) {
      if (typeof id !== "string" || id.trim() === "") {
        res.status(400).json({
          message: "Validation failed",
          error: "All category IDs must be valid strings",
        });
        return;
      }
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          message: "Validation failed",
          error: `Invalid ObjectId format: ${id}`,
        });
        return;
      }
    }

    // Find all categories that belong to the user and are not deleted
    const categories = await Category.find({
      _id: { $in: categoryIds },
      userId: req.user.userId,
      isDeleted: false,
    });

    if (categories.length === 0) {
      res.status(404).json({
        message: "No valid categories found",
        error:
          "None of the provided category IDs exist or you don't have access to them",
      });
      return;
    }

    // Check for categories with child categories
    const categoryIdsToDelete = categories.map((cat) => cat._id.toString());
    const categoriesWithChildren = await Category.find({
      parentId: { $in: categoryIdsToDelete },
      userId: req.user.userId,
      isDeleted: false,
    });

    if (categoriesWithChildren.length > 0) {
      const parentNames = categoriesWithChildren.map((child) => {
        const parent = categories.find(
          (cat) => cat._id.toString() === child.parentId?.toString()
        );
        return parent?.name || "Unknown";
      });

      res.status(400).json({
        message: "Cannot delete categories",
        error: `The following categories have child categories: ${parentNames.join(
          ", "
        )}. Please move or delete child categories first.`,
      });
      return;
    }

    // Check for categories with items
    const categoriesWithItems = categories.filter((cat) => cat.itemCount > 0);
    if (categoriesWithItems.length > 0) {
      const categoryNames = categoriesWithItems
        .map((cat) => cat.name)
        .join(", ");

      res.status(400).json({
        message: "Cannot delete categories",
        error: `The following categories contain items: ${categoryNames}. Please move or delete all items first.`,
      });
      return;
    }

    // Soft delete all categories
    const deleteResult = await Category.updateMany(
      {
        _id: { $in: categoryIdsToDelete },
        userId: req.user.userId,
        isDeleted: false,
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    );

    // Get the deleted categories for response
    const deletedCategories = await Category.find({
      _id: { $in: categoryIdsToDelete },
      userId: req.user.userId,
      isDeleted: true,
    }).populate("parentId", "name color");

    res.status(200).json({
      message: `Successfully deleted ${deleteResult.modifiedCount} categories`,
      deletedCount: deleteResult.modifiedCount,
      categories: deletedCategories,
    });
  } catch (error) {
    console.error("Error bulk deleting categories:", error);
    console.error("Request body:", req.body);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid category ID",
          error: "One or more category IDs are not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error bulk deleting categories",
      error: "Internal server error",
    });
  }
};

const bulkRestoreCategories = async (req: AuthRequest, res: Response) => {
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
    const { ids: categoryIds } = req.body;

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      res.status(400).json({
        message: "Validation failed",
        error: "categoryIds must be a non-empty array",
      });
      return;
    }

    if (categoryIds.length > 50) {
      res.status(400).json({
        message: "Validation failed",
        error: "Cannot restore more than 50 categories at once",
      });
      return;
    }

    // Validate each category ID
    for (const id of categoryIds) {
      if (typeof id !== "string" || id.trim() === "") {
        res.status(400).json({
          message: "Validation failed",
          error: "All category IDs must be valid strings",
        });
        return;
      }
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          message: "Validation failed",
          error: `Invalid ObjectId format: ${id}`,
        });
        return;
      }
    }

    // Find all deleted categories that belong to the user
    const deletedCategories = await Category.find({
      _id: { $in: categoryIds },
      userId: req.user.userId,
      isDeleted: true,
    });

    if (deletedCategories.length === 0) {
      res.status(404).json({
        message: "No deleted categories found",
        error:
          "None of the provided category IDs exist as deleted categories or you don't have access to them",
      });
      return;
    }

    // Check if parent categories still exist for categories that had parents
    const categoriesWithParents = deletedCategories.filter(
      (cat) => cat.parentId
    );
    const parentIds = [
      ...new Set(categoriesWithParents.map((cat) => cat.parentId)),
    ];

    if (parentIds.length > 0) {
      const existingParents = await Category.find({
        _id: { $in: parentIds },
        userId: req.user.userId,
        isDeleted: false,
      });

      const existingParentIds = existingParents.map((p) => p._id.toString());
      const missingParentIds = parentIds.filter(
        (id) => !existingParentIds.includes(id || "")
      );

      if (missingParentIds.length > 0) {
        const categoriesWithMissingParents = deletedCategories.filter((cat) =>
          missingParentIds.includes(cat.parentId?.toString() || "")
        );

        const categoryNames = categoriesWithMissingParents
          .map((cat) => cat.name)
          .join(", ");

        res.status(400).json({
          message: "Cannot restore categories",
          error: `The following categories have missing parent categories: ${categoryNames}. Please restore parent categories first or remove parent references.`,
        });
        return;
      }
    }

    // Check for name conflicts with existing categories
    const categoryNames = deletedCategories.map((cat) => cat.name);
    const existingCategoriesWithSameNames = await Category.find({
      userId: req.user.userId,
      name: { $in: categoryNames },
      isDeleted: false,
    });

    if (existingCategoriesWithSameNames.length > 0) {
      const conflictingNames = existingCategoriesWithSameNames
        .map((cat) => cat.name)
        .join(", ");

      res.status(409).json({
        message: "Cannot restore categories",
        error: `The following category names already exist: ${conflictingNames}. Please rename these categories before restoring.`,
      });
      return;
    }

    // Restore all categories
    const restoreResult = await Category.updateMany(
      {
        _id: { $in: categoryIds },
        userId: req.user.userId,
        isDeleted: true,
      },
      {
        isDeleted: false,
        deletedAt: undefined,
      }
    );

    // Get the restored categories for response
    const restoredCategories = await Category.find({
      _id: { $in: categoryIds },
      userId: req.user.userId,
      isDeleted: false,
    }).populate("parentId", "name color");

    res.status(200).json({
      message: `Successfully restored ${restoreResult.modifiedCount} categories`,
      restoredCount: restoreResult.modifiedCount,
      categories: restoredCategories,
    });
  } catch (error) {
    console.error("Error bulk restoring categories:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid category ID",
          error: "One or more category IDs are not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error bulk restoring categories",
      error: "Internal server error",
    });
  }
};

const reorderCategories = async (req: AuthRequest, res: Response) => {
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
    const validationResult = reorderCategoriesSchema.safeParse(req.body);
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

    const { categoryOrders } = validationResult.data;

    // Validate all category IDs are valid ObjectIds
    for (const order of categoryOrders) {
      if (!mongoose.Types.ObjectId.isValid(order.categoryId)) {
        res.status(400).json({
          message: "Validation failed",
          error: `Invalid ObjectId format: ${order.categoryId}`,
        });
        return;
      }
    }

    // Get all category IDs to check ownership
    const categoryIds = categoryOrders.map(order => order.categoryId);

    // Verify all categories belong to the user
    const userCategories = await Category.find({
      _id: { $in: categoryIds },
      userId: req.user.userId,
      isDeleted: false,
    });

    if (userCategories.length !== categoryIds.length) {
      res.status(404).json({
        message: "Some categories not found",
        error: "One or more categories do not exist or you don't have access to them",
      });
      return;
    }

    // Update sort orders in bulk
    const updateOperations = categoryOrders.map(order => ({
      updateOne: {
        filter: { _id: order.categoryId, userId: req.user?.userId },
        update: { sortOrder: order.sortOrder }
      }
    }));

    const result = await Category.bulkWrite(updateOperations);

    if (result.modifiedCount !== categoryOrders.length) {
      res.status(500).json({
        message: "Error updating category orders",
        error: "Some categories could not be updated",
      });
      return;
    }

    // Get updated categories for response
    const updatedCategories = await Category.find({
      _id: { $in: categoryIds },
      userId: req.user.userId,
      isDeleted: false,
    })
      .populate("parentId", "name color")
      .sort({ sortOrder: 1 });

    res.status(200).json({
      message: `Successfully reordered ${result.modifiedCount} categories`,
      categories: updatedCategories,
    });
  } catch (error) {
    console.error("Error reordering categories:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid category ID",
          error: "One or more category IDs are not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error reordering categories",
      error: "Internal server error",
    });
  }
};

const getCategoryItems = async (req: AuthRequest, res: Response) => {
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

    // Validate query parameters
    const queryValidationResult = getCategoryItemsQuerySchema.safeParse(req.query);
    if (!queryValidationResult.success) {
      res.status(400).json({
        message: "Validation failed",
        error: queryValidationResult.error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    const { categoryId } = idValidationResult.data;
    const {
      page = 1,
      limit = 20,
      type,
      isPublic,
      isFavorite,
      isArchived,
      search,
      tags,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryValidationResult.data;

    // Validate category ID format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({
        message: "Invalid category ID",
        error: "The provided category ID is not valid",
      });
      return;
    }

    // Verify category exists and belongs to user
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.user.userId,
      isDeleted: false,
    });

    if (!category) {
      res.status(404).json({
        message: "Category not found",
        error: "The requested category does not exist or you don't have access to it",
      });
      return;
    }

    // Build filter object for items
    const filter: any = {
      userId: req.user.userId,
      categories: categoryId,
      isDeleted: false,
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

    // Search filter
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

    res.status(200).json({
      message: "Category items retrieved successfully",
      data: {
        category: {
          id: category._id,
          name: category.name,
          description: category.description,
          color: category.color,
          icon: category.icon,
          itemCount: category.itemCount,
        },
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
            tags,
            sortBy,
            sortOrder,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error retrieving category items:", error);

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
      message: "Error retrieving category items",
      error: "Internal server error",
    });
  }
};

const bulkCategorize = async (req: AuthRequest, res: Response) => {
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
    const validationResult = bulkCategorizeSchema.safeParse(req.body);
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

    const { itemIds, categoryIds, operation = "add" } = validationResult.data;

    // Validate all IDs are valid ObjectIds
    const allIds = [...itemIds, ...categoryIds];
    for (const id of allIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          message: "Validation failed",
          error: `Invalid ObjectId format: ${id}`,
        });
        return;
      }
    }

    // Verify all items belong to the user
    const userItems = await Item.find({
      _id: { $in: itemIds },
      userId: req.user.userId,
      isDeleted: false,
    });

    if (userItems.length !== itemIds.length) {
      res.status(404).json({
        message: "Some items not found",
        error: "One or more items do not exist or you don't have access to them",
      });
      return;
    }

    // Verify all categories belong to the user
    const userCategories = await Category.find({
      _id: { $in: categoryIds },
      userId: req.user.userId,
      isDeleted: false,
    });

    if (userCategories.length !== categoryIds.length) {
      res.status(404).json({
        message: "Some categories not found",
        error: "One or more categories do not exist or you don't have access to them",
      });
      return;
    }

    // Prepare update operations based on operation type
    let updateOperations: any[] = [];
    let updateObject: any = {};

    switch (operation) {
      case "add":
        // Add categories to existing categories array
        updateObject = {
          $addToSet: { categories: { $each: categoryIds } },
          lastEditedAt: new Date(),
          lastEditedBy: req.user.userId,
        };
        break;

      case "replace":
        // Replace existing categories with new ones
        updateObject = {
          categories: categoryIds,
          lastEditedAt: new Date(),
          lastEditedBy: req.user.userId,
        };
        break;

      case "remove":
        // Remove specified categories from items
        updateObject = {
          $pullAll: { categories: categoryIds },
          lastEditedAt: new Date(),
          lastEditedBy: req.user.userId,
        };
        break;

      default:
        res.status(400).json({
          message: "Invalid operation",
          error: "Operation must be 'add', 'replace', or 'remove'",
        });
        return;
    }

    // Update all items
    const result = await Item.updateMany(
      { _id: { $in: itemIds }, userId: req.user.userId },
      updateObject
    );

    if (result.modifiedCount !== itemIds.length) {
      res.status(500).json({
        message: "Error updating items",
        error: "Some items could not be updated",
      });
      return;
    }

    // Update category item counts
    await updateCategoryItemCounts(categoryIds, req.user.userId);

    // Get updated items for response
    const updatedItems = await Item.find({
      _id: { $in: itemIds },
      userId: req.user.userId,
      isDeleted: false,
    })
      .populate("categories", "name color icon")
      .populate("workspace", "name description")
      .populate("lastEditedBy", "name username");

    res.status(200).json({
      message: `Successfully ${operation === "add" ? "added" : operation === "replace" ? "replaced" : "removed"} categories for ${result.modifiedCount} items`,
      operation,
      updatedCount: result.modifiedCount,
      items: updatedItems,
    });
  } catch (error) {
    console.error("Error bulk categorizing items:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          message: "Invalid ID",
          error: "One or more IDs are not valid",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error bulk categorizing items",
      error: "Internal server error",
    });
  }
};

// Helper function to update category item counts
const updateCategoryItemCounts = async (categoryIds: string[], userId: string) => {
  try {
    // Get item counts for each category
    const itemCounts = await Item.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $unwind: "$categories",
      },
      {
        $group: {
          _id: "$categories",
          count: { $sum: 1 },
        },
      },
    ]);

    // Create a map of category ID to item count
    const countMap = new Map();
    itemCounts.forEach((item) => {
      countMap.set(item._id.toString(), item.count);
    });

    // Update all categories with their current item counts
    const updateOperations = categoryIds.map((categoryId) => ({
      updateOne: {
        filter: { _id: categoryId, userId },
        update: { itemCount: countMap.get(categoryId) || 0 }
      }
    }));

    if (updateOperations.length > 0) {
      await Category.bulkWrite(updateOperations);
    }
  } catch (error) {
    console.error("Error updating category item counts:", error);
    // Don't throw error as this is a background operation
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

export {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  bulkDeleteCategories,
  bulkRestoreCategories,
  reorderCategories,
  getCategoryItems,
  bulkCategorize,
};
