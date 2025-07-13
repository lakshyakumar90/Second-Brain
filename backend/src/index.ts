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

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
