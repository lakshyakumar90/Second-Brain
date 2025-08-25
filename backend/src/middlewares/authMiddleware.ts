import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../models/interfaces/userModel.interface";

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    console.log('Auth middleware called for:', req.method, req.path);
    
    const token = req.cookies.token;
    if(!token) {
        console.log('No token found in cookies');
        res.status(401).json({ message: "Unauthorized wdjhwefjhwe fj" });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
        req.user = decoded as AuthRequest["user"];
        console.log('Auth middleware - user authenticated:', { userId: req.user?.userId, completedSteps: req.user?.completedSteps });
        next();
    } catch (error) {
        console.log('Invalid token error:', error);
        res.status(401).json({ message: "Invalid token" });
        return;
    }
}

export const registrationCompleteMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    console.log('Registration complete middleware called for:', req.method, req.path);
    console.log('User data:', req.user);
    
    if (!req.user || req.user.completedSteps !== 3) {
        console.log(`Blocking request - completedSteps: ${req.user?.completedSteps}, required: 3`);
        res.status(403).json({ message: "Please complete your registration properly." });
        return;
    }
    
    console.log('Registration complete middleware - allowing request');
    next();
}
