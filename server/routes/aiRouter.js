import express from "express";
import { answerCustomerQuery } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", answerCustomerQuery);

export default router;