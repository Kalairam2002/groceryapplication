import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/userController.js"; // 👈 add .js

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser); // optional backend logout

export default router;
