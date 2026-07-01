import express from "express";
import {
  registerDeliveryBoy,
  loginDeliveryBoy,
  logoutDeliveryBoy,
  getAllDeliveryBoys,
  approveDeliveryBoy,
  rejectDeliveryBoy,
  getDeliveryBoyProfile,
  getMyOrders,
  verifyDeliveryBoyOtp,
  forgotDeliveryBoyPassword, 
  resetDeliveryBoyPassword,  
} from "../controllers/deliveryController.js";
import { protectDeliveryBoy } from "../middlewares/delivery.middleware.js";

const router = express.Router();

router.post("/register",              registerDeliveryBoy);
router.post("/verify-otp",            verifyDeliveryBoyOtp);
router.post("/login",                 loginDeliveryBoy);
router.post("/logout",                protectDeliveryBoy, logoutDeliveryBoy);
router.get("/profile",                protectDeliveryBoy, getDeliveryBoyProfile);
router.get("/all",                    getAllDeliveryBoys);
router.put("/approve/:id",            approveDeliveryBoy);
router.put("/reject/:id",             rejectDeliveryBoy);
router.get("/my-orders",              protectDeliveryBoy, getMyOrders);
router.post("/forgot-password",       forgotDeliveryBoyPassword); 
router.post("/reset-password/:token", resetDeliveryBoyPassword);

export default router;