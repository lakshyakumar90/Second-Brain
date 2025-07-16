import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/db";
import "./models/index";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import itemRoutes from "./routes/item.routes";
import categoryRoutes from "./routes/category.routes";
import cleanupRoutes from "./routes/cleanup.routes";
import workspaceRoutes from "./routes/workspace.routes";
import cleanupService from "./services/cleanupService";
import shareRoutes from "./routes/share.routes";
import commentRoutes from "./routes/comment.routes";
import notificationRoutes from "./routes/notification.routes";
import aiRoutes from './routes/ai.routes';
import searchRoutes from "./routes/search.routes";
import analyticsRoutes from './routes/analytics.routes';
import whiteboardRoutes from './routes/whiteboard.routes';

connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/workspaces", workspaceRoutes);
app.use("/api/v1/shares", shareRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/cleanup", cleanupRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use('/api/whiteboards', whiteboardRoutes);

app.get("/", (req, res) => {
    res.send("Hello World");
});

// Start the cleanup service when the server starts
// This will automatically clean up soft-deleted items after 1 day
const startServer = async () => {
    try {
        // Start cleanup service
        cleanupService.start();
        console.log("✅ Cleanup service started successfully");
        
        // Start the server
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`🚀 Server is running on port ${port}`);
            console.log(`🧹 Cleanup service will permanently delete soft-deleted items after 1 day`);
        });
    } catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    cleanupService.stop();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    cleanupService.stop();
    process.exit(0);
});

startServer();
