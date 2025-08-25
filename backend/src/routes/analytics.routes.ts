import express from "express";
import {
  authMiddleware,
  registrationCompleteMiddleware,
} from "../middlewares/authMiddleware";
import {
  getDashboardData,
  getUsageAnalytics,
  getItemAnalytics,
  getCategoryAnalytics,
  getShareAnalytics,
  getAIAnalytics,
  getActivityFeed,
  getTimeBasedAnalytics,
  getGrowthAnalytics,
  getMostUsedCategories,
  getActivityTrends,
  exportAnalytics,
} from "../controllers/analytics.controller";

const router = express.Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

// Basic analytics endpoints
router.get("/dashboard", getDashboardData);
router.get("/usage", getUsageAnalytics);
router.get("/item", getItemAnalytics);
router.get("/category", getCategoryAnalytics);
router.get("/share", getShareAnalytics);
router.get("/ai", getAIAnalytics);

// Enhanced analytics endpoints
router.get("/activity", getActivityFeed);
router.get("/time-based", getTimeBasedAnalytics);
router.get("/growth", getGrowthAnalytics);
router.get("/categories/most-used", getMostUsedCategories);
router.get("/activity/trends", getActivityTrends);
router.get("/export", exportAnalytics);

export default router;
