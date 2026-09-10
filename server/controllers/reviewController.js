import Review from "../models/Review.js";
import Order from "../models/orderModel.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
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

    let ownsOrder = order.userId === userId;
    if (!ownsOrder) {
      const userByUsername = await User.findOne({ username: order.userId });
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

// Get all reviews for a specific seller's products
export const getReviewsBySeller = async (req, res) => {
  try {
    const sellerId = req.sellerId;

    const products = await Product.find({ seller: sellerId }, "_id");
    const productIds = products.map((p) => p._id);

    const reviews = await Review.find({ product: { $in: productIds } })
      .populate("product", "name")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0;

    res.json({ success: true, reviews, avgRating, total: reviews.length });
  } catch (error) {
    console.error("getReviewsBySeller error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get every review across all sellers — admin moderation view
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate({ path: "product", populate: { path: "seller", select: "name" }, select: "name seller" })
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    console.error("getAllReviews error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin-only: remove a review (moderation)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.json({ success: true, message: "Review removed" });
  } catch (error) {
    console.error("deleteReview error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Pending ratings — delivered products (within the last 3 days) this user
// hasn't rated yet, used for the post-login/home-page prompt
export const getPendingReviews = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const identifiers = [userId];
    if (user?.username) identifiers.push(user.username);

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      userId: { $in: identifiers },
      deliveryStatus: "Delivered",
      updatedAt: { $gte: threeDaysAgo },
    }).sort({ updatedAt: -1 });

    const pending = [];
    for (const order of orders) {
      for (const p of order.products) {
        if (!p.id) continue;
        const existing = await Review.findOne({ product: p.id, order: order._id, userId });
        if (!existing) {
          pending.push({
            orderId: order._id,
            orderCode: order.orderId,
            productId: p.id,
            productName: p.name,
            deliveredAt: order.updatedAt,
          });
        }
      }
    }

    res.json({ success: true, pending });
  } catch (error) {
    console.error("getPendingReviews error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};