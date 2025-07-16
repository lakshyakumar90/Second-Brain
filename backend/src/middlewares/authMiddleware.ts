import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../models/interfaces/userModel.interface";

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.cookies.token;
    if(!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
        req.user = decoded as AuthRequest["user"];
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
}

export const registrationCompleteMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.completedSteps !== 3) {
        console.log(req.user);
        res.status(403).json({ message: "Please complete your registration properly." });
        return;
    }
    next();
}
