import  express from 'express';
import authUser from '../middlewares/authUser.js';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderRazorPay, verifyPayment, getOrdersByUser,getOrdersBySeller } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.post('/online', placeOrderRazorPay);
orderRouter.post('/verifyPayment', verifyPayment);
// GET /api/orders/all  → get all orders
orderRouter.get("/all", getAllOrders);
// GET /api/orders/:userId  → get orders by userId
orderRouter.get("/:userId", getOrdersByUser);

// ✅ Get orders for logged-in seller
orderRouter.get("/seller/order", authSeller, getOrdersBySeller);

export default orderRouter;