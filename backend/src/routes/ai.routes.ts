import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  summarizeContent,
  suggestTags,
  categorizeContent,
  chatWithAI,
  getAIInsights,
  generateContent,
  extractText,
  analyzeContent,
  getAIUsageStats,
} from "../controllers/ai.controller";

const router = Router();

router.post("/summarize", authMiddleware, summarizeContent);
router.post("/suggest-tags", authMiddleware, suggestTags);
router.post("/categorize", authMiddleware, categorizeContent);
router.post("/chat", authMiddleware, chatWithAI);
router.post("/insights", authMiddleware, getAIInsights);
router.post("/generate", authMiddleware, generateContent);
router.post("/extract-text", authMiddleware, extractText);
router.post("/analyze", authMiddleware, analyzeContent);
router.post("/usage-stats", authMiddleware, getAIUsageStats);

export default router;
