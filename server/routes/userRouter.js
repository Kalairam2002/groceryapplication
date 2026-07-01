import express from "express";
import {
  registerUser,
  verifyOtp,
  loginUser,
  logoutUser,
  registerUserWithMobileOtp,
  sendMobileOtp,
  verifyMobileOtp,
  forgotPassword,
  resetPassword,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

//  Email OTP Flow
router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);

//  Login & Logout
router.post("/login", loginUser);
router.post("/logout", logoutUser);

//  Mobile OTP Flow (2Factor)
router.post("/send-mobile-otp", sendMobileOtp);
router.post("/verify-mobile-otp", verifyMobileOtp);
router.post("/register-mobile", registerUserWithMobileOtp);


//  Password Reset Flow
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

//  User Profile Update
router.put("/profile", protect, updateUserProfile);
export default router;
