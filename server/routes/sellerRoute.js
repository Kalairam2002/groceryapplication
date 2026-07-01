import express from 'express';
import {
  getSellerDetails,
  isSellerAuth,
  sellerLogin,
  sellerLogout,
  registerSeller,
  updateStatus,
  deleteSeller,
  sendOtp,
  verifyOtp,
  forgotSellerPassword,
  resetSellerPassword,
  updateSellerProfile
} from '../controllers/sellerController.js';
import authSeller from '../middlewares/authSeller.js';

const sellerRouter = express.Router();

// Routes for email verification 
sellerRouter.post('/sendotp', sendOtp);
sellerRouter.post('/verify-otp', verifyOtp);

// Registration & login
sellerRouter.post('/register', registerSeller);
sellerRouter.post('/login', sellerLogin);

// Auth check & logout
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', authSeller, sellerLogout);

// Seller management
sellerRouter.get('/seller-list', getSellerDetails);
sellerRouter.put('/update-status', updateStatus);
sellerRouter.delete('/delete/:id', deleteSeller);

// ✅ Password Reset Flow
sellerRouter.post('/forgot-password', forgotSellerPassword);
sellerRouter.post('/reset-password/:token', resetSellerPassword);

// ✅ Update seller profile (protected route)
sellerRouter.put('/profile', authSeller, updateSellerProfile);

export default sellerRouter;
