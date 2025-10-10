import express from "express";
import { addToCart, getCart } from "../controllers/cartController.js";
// Make sure the path is correct relative to this file:
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart);
router.get("/", protect, getCart);

export default router;
