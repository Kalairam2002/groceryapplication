import express from "express";
import {
  submitReturn,
  getReturnsByOrder,
  getSellerReturns,
  updateReturnStatus,
  markReturnRefunded,
  getDeliveryBoysForSeller,
  assignReturnPickup,
} from "../controllers/returnController.js";
import authSeller from "../middlewares/authSeller.js";

const returnRouter = express.Router();

// User routes
returnRouter.post("/submit", submitReturn);
returnRouter.get("/order/:orderId", getReturnsByOrder);

// Seller routes
returnRouter.get("/seller", authSeller, getSellerReturns);
returnRouter.get("/seller/delivery-boys", authSeller, getDeliveryBoysForSeller); // ✅ delivery boys the seller can pick from
returnRouter.put("/seller/:returnId", authSeller, updateReturnStatus);
returnRouter.put("/seller/:returnId/assign-pickup", authSeller, assignReturnPickup); // ✅ assign / change the pickup delivery boy
returnRouter.put("/seller/:returnId/refund", authSeller, markReturnRefunded);

export default returnRouter;