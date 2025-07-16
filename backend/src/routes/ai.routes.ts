import { Router } from "express";
import { authMiddleware, registrationCompleteMiddleware } from "../middlewares/authMiddleware";
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

router.post("/summarize", authMiddleware, registrationCompleteMiddleware, summarizeContent);
router.post("/suggest-tags", authMiddleware, registrationCompleteMiddleware, suggestTags);
router.post("/categorize", authMiddleware, registrationCompleteMiddleware, categorizeContent);
router.post("/chat", authMiddleware, registrationCompleteMiddleware, chatWithAI);
router.post("/insights", authMiddleware, registrationCompleteMiddleware, getAIInsights);
router.post("/generate", authMiddleware, registrationCompleteMiddleware, generateContent);
router.post("/extract-text", authMiddleware, registrationCompleteMiddleware, extractText);
router.post("/analyze", authMiddleware, registrationCompleteMiddleware, analyzeContent);
router.post("/usage-stats", authMiddleware, registrationCompleteMiddleware, getAIUsageStats);

export default router;
