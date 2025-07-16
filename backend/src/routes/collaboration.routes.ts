import { Router } from "express";
import {
  createCollaboration,
  getCollaborations,
  joinCollaboration,
  leaveCollaboration,
  updateCollaboration,
  getActiveUsers,
  saveCollaborativeChanges,
} from "../controllers/collaboration.controller";
import { authMiddleware, registrationCompleteMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware)

router.post("/create",  createCollaboration);
router.get("/list",  getCollaborations);
router.post("/join",  joinCollaboration);
router.post("/leave",  leaveCollaboration);
router.patch("/update",  updateCollaboration);
router.get("/active-users",  getActiveUsers);
router.post("/save",  saveCollaborativeChanges);

export default router;
