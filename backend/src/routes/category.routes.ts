import { Router } from "express";
import { createCategory, getCategories, getCategory, updateCategory, deleteCategory, restoreCategory, bulkDeleteCategories, bulkRestoreCategories } from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createCategory);
router.delete("/bulk-delete", authMiddleware, bulkDeleteCategories);
router.patch("/bulk-restore", authMiddleware, bulkRestoreCategories);
router.get("/", authMiddleware, getCategories);
router.get("/:id", authMiddleware, getCategory);
router.put("/:id", authMiddleware, updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);
router.patch("/:id/restore", authMiddleware, restoreCategory);

export default router;
