import { Router } from "express";
import { createItem, getItems, getItem } from "../controllers/item.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createItem);
router.get("/", authMiddleware, getItems);
router.get("/:id", authMiddleware, getItem);

export default router;