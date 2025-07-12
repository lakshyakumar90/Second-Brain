import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  login,
  logout,
  registerStep1,
  registerStep2,
  registerStep3,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyPasswordResetOTP,
  resetPassword,
  refreshToken,
  checkRegistrationStep,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register/step1", registerStep1);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/register/step2", authMiddleware, registerStep2);
router.post("/register/step3", authMiddleware, registerStep3);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-password-reset-otp", verifyPasswordResetOTP);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);
router.get("/registration-step", authMiddleware, checkRegistrationStep);

export default router;
