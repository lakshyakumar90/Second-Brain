import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./database/db";

connectDB();

const app = express();

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
