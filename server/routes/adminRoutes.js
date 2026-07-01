import express from 'express';
import {
  isAuth, register, login, logout,
  verifyOtp, forgotAdminPassword, resetAdminPassword
} from '../controllers/adminController.js';
import { productList } from '../controllers/admin/allProductController.js';
import {
  getAllOrders,
  assignDeliveryBoy,
  updateDeliveryStatus,
  getNotifications,
  markAllRead,
  setDeliveryTimeSlot,
  getSellerNotifications,
  markSellerNotificationsRead,
} from '../controllers/admin/allOrderController.js';
import authAdmin from '../middlewares/authAdmin.js';

const adminRouter = express.Router();

adminRouter.post('/register', register);
adminRouter.post('/verify-otp', verifyOtp);
adminRouter.post('/login', login);
adminRouter.get('/is-auth', authAdmin, isAuth);
adminRouter.get('/logout', authAdmin, logout);
adminRouter.post('/forgot-password', forgotAdminPassword);
adminRouter.post('/reset-password/:token', resetAdminPassword);
adminRouter.get('/getProductList', productList);
adminRouter.get('/getOrderList', getAllOrders);
adminRouter.put('/assignDeliveryBoy/:orderId', assignDeliveryBoy);
adminRouter.put('/updateDeliveryStatus/:orderId', updateDeliveryStatus);
adminRouter.get('/notifications', getNotifications);
adminRouter.put('/notifications/mark-read', markAllRead);
adminRouter.put('/setTimeSlot/:orderId', setDeliveryTimeSlot);
adminRouter.get('/seller-notifications/:sellerId', getSellerNotifications);
adminRouter.put('/seller-notifications/mark-read/:sellerId', markSellerNotificationsRead);

export default adminRouter;