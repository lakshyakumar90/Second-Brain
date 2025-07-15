import { z } from "zod";

export const getNotificationsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default(1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default(20),
  isRead: z.string().transform(val => val === "true").optional(),
  type: z.string().optional(),
});

export const notificationIdSchema = z.object({
  notificationId: z.string().min(1, "Notification ID is required"),
});

export const updateNotificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
}); 