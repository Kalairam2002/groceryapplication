import express from "express";
import {
  submitReturn,
  getReturnsByOrder,
  getSellerReturns,
  updateReturnStatus,
} from "../controllers/returnController.js";
import authSeller from "../middlewares/authSeller.js";

const returnRouter = express.Router();

// User routes
returnRouter.post("/submit", submitReturn);
returnRouter.get("/order/:orderId", getReturnsByOrder);

// Seller routes
returnRouter.get("/seller", authSeller, getSellerReturns);
returnRouter.put("/seller/:returnId", authSeller, updateReturnStatus);

export default returnRouter;