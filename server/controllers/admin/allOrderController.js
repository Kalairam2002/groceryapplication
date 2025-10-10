import Order from '../../models/orderModel.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("products.seller", "name"); // populate seller name only
    res.status(200).json({ orders }); // wrap in object
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};