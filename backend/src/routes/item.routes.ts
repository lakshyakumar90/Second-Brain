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
  uploadFile,
  getItemAnalytics,
} from "../controllers/item.controller";
import { authMiddleware, registrationCompleteMiddleware } from "../middlewares/authMiddleware";
import { uploadItemFile, handleUploadError } from "../middlewares/uploadMiddleware";

const router = Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

router.post("/upload", uploadItemFile, handleUploadError, uploadFile);
router.post("/create", createItem);
router.delete("/bulk-delete", bulkDelete);
router.patch("/bulk-restore", bulkRestore);
router.get("/all", getItems);
router.get("/:itemId", getItem);
router.put("/:itemId", updateItem);
router.delete("/:itemId", deleteItem);
router.patch("/:itemId/restore", restoreItem);
router.post("/duplicate/:itemId", duplicateItem);
router.post("/favorite/:itemId", favoriteItem);
router.post("/archive/:itemId", archiveItem);
router.get("/analytics/:itemId", getItemAnalytics);

export default router;
