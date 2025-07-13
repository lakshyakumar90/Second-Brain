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
} from "../controllers/item.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createItem);
router.delete("/bulk-delete", authMiddleware, bulkDelete);
router.patch("/bulk-restore", authMiddleware, bulkRestore);
router.get("/", authMiddleware, getItems);
router.get("/:id", authMiddleware, getItem);
router.put("/:id", authMiddleware, updateItem);
router.delete("/:id", authMiddleware, deleteItem);
router.patch("/:id/restore", authMiddleware, restoreItem);
router.post("/duplicate/:id", authMiddleware, duplicateItem);
router.post("/favorite/:id", authMiddleware, favoriteItem);
router.post("/archive/:id", authMiddleware, archiveItem);

export default router;
