import { Router } from "express";
import { createCategory, getCategories, getCategory, updateCategory } from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createCategory);
router.get("/", authMiddleware, getCategories);
router.get("/:id", authMiddleware, getCategory);
router.put("/:id", authMiddleware, updateCategory);

export default router;
