import { Router } from "express";
import { createItem, getItems, getItem, updateItem, deleteItem, restoreItem } from "../controllers/item.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createItem);
router.get("/", authMiddleware, getItems);
router.get("/:id", authMiddleware, getItem);
router.put("/:id", authMiddleware, updateItem);
router.delete("/:id", authMiddleware, deleteItem);
router.patch("/:id/restore", authMiddleware, restoreItem);

export default router;