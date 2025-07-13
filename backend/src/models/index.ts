// Import all models to ensure they are registered with Mongoose
import User from "./user.model";
import Item from "./item.model";
import Category from "./category.model";
import Workspace from "./workspace.model";
import Share from "./share.model";
import Comment from "./comment.model";
import Collaboration from "./collaboration.model";
import AIChat from "./aiChat.model";
import AIUsage from "./aiUsage.model";
import ActivityLog from "./activity.model";
import Notification from "./notification.model";

// Export all models
export {
  User,
  Item,
  Category,
  Workspace,
  Share,
  Comment,
  Collaboration,
  AIChat,
  AIUsage,
  ActivityLog,
  Notification,
};

// This file ensures all models are registered with Mongoose
// before any database operations are performed 