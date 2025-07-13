import { Router } from "express";
import { createItem, getItems, getItem, updateItem, deleteItem } from "../controllers/item.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createItem);
router.get("/", authMiddleware, getItems);
router.get("/:id", authMiddleware, getItem);
router.put("/:id", authMiddleware, updateItem);
router.delete("/:id", authMiddleware, deleteItem);

export default router;