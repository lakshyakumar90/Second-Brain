import { Router } from "express";
import { 
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
  bulkCategorize
} from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createCategory);
router.get("/all", authMiddleware, getCategories);
router.get("/:categoryId", authMiddleware, getCategory);
router.get("/:categoryId/items", authMiddleware, getCategoryItems);
router.put("/:categoryId", authMiddleware, updateCategory);
router.delete("/:categoryId", authMiddleware, deleteCategory);
router.patch("/:categoryId/restore", authMiddleware, restoreCategory);
router.delete("/bulk-delete", authMiddleware, bulkDeleteCategories);
router.patch("/bulk-restore", authMiddleware, bulkRestoreCategories);
router.post("/reorder", authMiddleware, reorderCategories);
router.post("/bulk-categorize", authMiddleware, bulkCategorize);

export default router;
