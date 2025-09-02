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
import { requireViewAccess, requireEditAccess, checkWorkspacePermission } from "../middlewares/workspacePermissionMiddleware";

const router = Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

router.post("/upload", uploadItemFile, handleUploadError, uploadFile);
router.post("/create", requireEditAccess, createItem);
router.delete("/bulk-delete", requireEditAccess, bulkDelete);
router.patch("/bulk-restore", requireEditAccess, bulkRestore);
router.get("/all", getItems);
router.get("/:itemId", checkWorkspacePermission({ checkWorkspaceParam: 'itemId' }), getItem);
router.put("/:itemId", checkWorkspacePermission({ requiredRole: 'edit', checkWorkspaceParam: 'itemId' }), updateItem);
router.delete("/:itemId", checkWorkspacePermission({ requiredRole: 'edit', checkWorkspaceParam: 'itemId' }), deleteItem);
router.patch("/:itemId/restore", checkWorkspacePermission({ requiredRole: 'edit', checkWorkspaceParam: 'itemId' }), restoreItem);
router.post("/duplicate/:itemId", checkWorkspacePermission({ requiredRole: 'edit', checkWorkspaceParam: 'itemId' }), duplicateItem);
router.post("/favorite/:itemId", checkWorkspacePermission({ checkWorkspaceParam: 'itemId' }), favoriteItem);
router.post("/archive/:itemId", checkWorkspacePermission({ requiredRole: 'edit', checkWorkspaceParam: 'itemId' }), archiveItem);
router.get("/analytics/:itemId", checkWorkspacePermission({ checkWorkspaceParam: 'itemId' }), getItemAnalytics);

export default router;
