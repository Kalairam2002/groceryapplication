import express from "express";
import { addReview, getRatingSummary } from "../controllers/reviewController.js";
import authUser from "../middlewares/authUser.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authUser, addReview);
reviewRouter.post("/summary", getRatingSummary); // public — used to render stars on cards

export default reviewRouter;