import express from "express";
import {
  createShare,
  getShares,
  getShare,
  updateShare,
  deleteShare,
  accessShare,
  checkSharePassword,
  getShareAnalytics,
} from "../controllers/share.controller";
import { authMiddleware, registrationCompleteMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/:shareId", getShare);
router.post("/:shareId/access", accessShare);

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

// Authenticated routes
router.post("/create", createShare);
router.get("/all", getShares);
router.patch("/:shareId", updateShare);
router.delete("/:shareId", deleteShare);
router.get("/:shareId/analytics", getShareAnalytics);
router.post("/:shareId/check-password", checkSharePassword);


export default router;
