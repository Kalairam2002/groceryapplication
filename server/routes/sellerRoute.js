import express from 'express';
import { getSellerDetails, isSellerAuth, sellerLogin, sellerLogout, sellerRegister, updateStatus,deleteSeller,sendOtp,verifyOtp } from '../controllers/sellerController.js';
import authSeller from '../middlewares/authSeller.js';


const sellerRouter = express.Router();
// Routes for email verification 
sellerRouter.post('/sendotp', sendOtp)
sellerRouter.post('/verify-otp', verifyOtp);
//closed
sellerRouter.post('/register', sellerRegister);
sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', authSeller, sellerLogout);
sellerRouter.get('/seller-list',getSellerDetails);
sellerRouter.put('/update-status',updateStatus);

// ✅ Delete seller by ID
sellerRouter.delete("/delete/:id", deleteSeller);

export default sellerRouter;
