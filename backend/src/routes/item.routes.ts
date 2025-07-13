import { Router } from "express";
import { createItem, getItems } from "../controllers/item.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createItem);
router.get("/", authMiddleware, getItems);

export default router;