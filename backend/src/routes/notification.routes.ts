import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  updateNotificationPreferences,
} from "../controllers/notification.controller";
import { authMiddleware, registrationCompleteMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

router.get("/", getNotifications);
router.patch("/:notificationId/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/:notificationId", deleteNotification);
router.get("/unread/count", getUnreadCount);
router.patch("/preferences", updateNotificationPreferences);

export default router; 