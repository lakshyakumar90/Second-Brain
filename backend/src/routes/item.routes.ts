import { Router } from "express";
import {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
  restoreItem,
  bulkDelete,
  bulkRestore,
  duplicateItem,
  favoriteItem,
  archiveItem,
  uploadFiles,
  getItemAnalytics,
} from "../controllers/item.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createItem);
router.delete("/bulk-delete", authMiddleware, bulkDelete);
router.patch("/bulk-restore", authMiddleware, bulkRestore);
router.get("/all", authMiddleware, getItems);
router.get("/:itemId", authMiddleware, getItem);
router.put("/:itemId", authMiddleware, updateItem);
router.delete("/:itemId", authMiddleware, deleteItem);
router.patch("/:itemId/restore", authMiddleware, restoreItem);
router.post("/duplicate/:itemId", authMiddleware, duplicateItem);
router.post("/favorite/:itemId", authMiddleware, favoriteItem);
router.post("/archive/:itemId", authMiddleware, archiveItem);
router.post("/upload/:itemId", authMiddleware, uploadFiles);
router.get("/analytics/:itemId", authMiddleware, getItemAnalytics);

export default router;
