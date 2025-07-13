import { Router } from "express";
import { createItem } from "../controllers/item.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createItem);

export default router;