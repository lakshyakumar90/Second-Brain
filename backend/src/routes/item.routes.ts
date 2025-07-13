import { Router } from "express";
import { createItem, getItems, getItem, updateItem } from "../controllers/item.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createItem);
router.get("/", authMiddleware, getItems);
router.get("/:id", authMiddleware, getItem);
router.put("/:id", authMiddleware, updateItem);

export default router;