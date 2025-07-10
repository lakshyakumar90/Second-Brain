import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  login,
  logout,
  registerStep1,
  registerStep2,
  registerStep3,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register/step1", registerStep1);
router.post("/register/step2", authMiddleware, registerStep2);
router.post("/register/step3", authMiddleware, registerStep3);
router.post("/login", login);
router.post("/logout", logout);

export default router;
