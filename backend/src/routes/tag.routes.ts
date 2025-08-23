import { Router } from "express";
import { 
  createTag, 
  getTags, 
  getTag, 
  updateTag, 
  deleteTag, 
  restoreTag, 
  getTagSuggestions,
  bulkDeleteTags, 
  bulkRestoreTags,
} from "../controllers/tag.controller";
import { authMiddleware, registrationCompleteMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

// Tag CRUD operations
router.post("/create", createTag);
router.get("/", getTags);
router.get("/suggestions", getTagSuggestions);
router.get("/:tagId", getTag);
router.put("/:tagId", updateTag);
router.delete("/:tagId", deleteTag);
router.patch("/:tagId/restore", restoreTag);

// Bulk operations
router.post("/bulk-delete", bulkDeleteTags);
router.post("/bulk-restore", bulkRestoreTags);

export default router;
