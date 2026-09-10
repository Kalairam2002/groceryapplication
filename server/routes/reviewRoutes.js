import express from "express";
import {
  addReview,
  getRatingSummary,
  getReviewsBySeller,
  getAllReviews,
  deleteReview,
  getPendingReviews,
} from "../controllers/reviewController.js";
import authUser from "../middlewares/authUser.js";
import authSeller from "../middlewares/authSeller.js";
import authAdmin from "../middlewares/authAdmin.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authUser, addReview);
reviewRouter.post("/summary", getRatingSummary); // public — used to render stars on cards
reviewRouter.get("/pending", authUser, getPendingReviews);
reviewRouter.get("/seller", authSeller, getReviewsBySeller);
reviewRouter.get("/all", authAdmin, getAllReviews);
reviewRouter.delete("/:id", authAdmin, deleteReview);

export default reviewRouter;