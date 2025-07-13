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
router.get("/", authMiddleware, getCategories);
router.get("/:id", authMiddleware, getCategory);
router.get("/:id/items", authMiddleware, getCategoryItems);
router.put("/:id", authMiddleware, updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);
router.patch("/:id/restore", authMiddleware, restoreCategory);
router.delete("/bulk-delete", authMiddleware, bulkDeleteCategories);
router.patch("/bulk-restore", authMiddleware, bulkRestoreCategories);
router.post("/reorder", authMiddleware, reorderCategories);
router.post("/bulk-categorize", authMiddleware, bulkCategorize);

export default router;
