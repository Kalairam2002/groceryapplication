import Review from "../models/Review.js";
import Order from "../models/orderModel.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Submit a rating — only allowed if the order belongs to this customer,
// is Delivered, and actually contains this product.
export const addReview = async (req, res) => {
    try {
      const userId = req.userId;
      const { orderId, productId, rating, comment } = req.body;
  
      if (!orderId || !productId || !rating) {
        return res.status(400).json({ success: false, message: "orderId, productId and rating are required" });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
      }
  
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
  
      console.log("DEBUG order.userId:", order.userId, "| type:", typeof order.userId);
      console.log("DEBUG req.userId:", userId, "| type:", typeof userId);
  
      // order.userId is a Mongo _id for Cashfree orders, but a username string
      // for Razorpay orders — check both against the logged-in user's id.
      let ownsOrder = order.userId === userId;
      if (!ownsOrder) {
        const userByUsername = await User.findOne({ username: order.userId });
        console.log("DEBUG userByUsername:", userByUsername);
        ownsOrder = userByUsername && userByUsername._id.toString() === userId;
      }
      if (!ownsOrder) {
        return res.status(403).json({ success: false, message: "This order does not belong to you" });
      }
  
      if (order.deliveryStatus !== "Delivered") {
        return res.status(400).json({ success: false, message: "You can only rate products after delivery" });
      }
  
      const productInOrder = order.products.some((p) => p.id.toString() === productId);
      if (!productInOrder) {
        return res.status(400).json({ success: false, message: "This product is not part of that order" });
      }
  
      const review = await Review.create({
        product: productId,
        order: orderId,
        userId,
        rating,
        comment: comment || "",
      });
  
      res.status(201).json({ success: true, message: "Thanks for rating!", review });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: "You've already rated this product for this order" });
      }
      console.error("addReview error:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

// Batch rating summary — given a list of product IDs, returns average
// rating + count for each. Called once by the product list page instead
// of one request per card.
export const getRatingSummary = async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.json({ success: true, summary: {} });
    }

    const results = await Review.aggregate([
      { $match: { product: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const summary = {};
    results.forEach((r) => {
      summary[r._id.toString()] = {
        avgRating: Math.round(r.avgRating * 10) / 10,
        count: r.count,
      };
    });

    res.json({ success: true, summary });
  } catch (error) {
    console.error("getRatingSummary error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};