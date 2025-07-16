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
import { authMiddleware, registrationCompleteMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

router.post("/create", createCategory);
router.get("/all", getCategories);
router.get("/:categoryId", getCategory);
router.get("/:categoryId/items", getCategoryItems);
router.put("/:categoryId", updateCategory);
router.delete("/:categoryId", deleteCategory);
router.patch("/:categoryId/restore", restoreCategory);
router.delete("/bulk-delete", bulkDeleteCategories);
router.patch("/bulk-restore", bulkRestoreCategories);
router.post("/reorder", reorderCategories);
router.post("/bulk-categorize", bulkCategorize);

export default router;
