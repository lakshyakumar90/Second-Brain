import express from 'express';
import { authMiddleware, registrationCompleteMiddleware } from '../middlewares/authMiddleware';
import {
  getDashboardData,
  getUsageAnalytics,
  getItemAnalytics,
  getCategoryAnalytics,
  getShareAnalytics,
  getAIAnalytics,
  exportAnalytics
} from '../controllers/analytics.controller';

const router = express.Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

router.get('/dashboard', getDashboardData);
router.get('/usage', getUsageAnalytics);
router.get('/item', getItemAnalytics);
router.get('/category', getCategoryAnalytics);
router.get('/share', getShareAnalytics);
router.get('/ai', getAIAnalytics);
router.get('/export', exportAnalytics);

export default router; 