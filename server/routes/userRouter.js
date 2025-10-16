import express from "express";
import { registerUser, loginUser, logoutUser, verifyOtp } from "../controllers/userController.js"; 

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
// router.post("/send-mobile-otp", sendMobileOtpToUser);
// router.post("/verify-mobile-otp", verifyMobileOtp);
router.post("/login", loginUser);
router.post("/logout", logoutUser); 

export default router;
