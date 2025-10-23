import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/orderModel.js";
import Product from "../models/Product.js"; 
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    let { amount, currency = "INR", products, userId } = req.body;

    // ✅ Ensure amount is in paise and integer
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount received" });
    }

    amount = Math.round(amount); // convert to integer paise

    const options = {
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        items: JSON.stringify(products),
      },
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("🔴 Error creating Razorpay order:", err);
    res.status(500).json({ error: err.message });
  }
};


// Verify payment + Save order
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      products,
      amount,
    } = req.body;

    // ✅ Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ✅ Enrich products with seller info and reduce stock
    const enrichedProducts = await Promise.all(
      products.map(async (item) => {
        const prod = await Product.findById(item._id);
        if (!prod) throw new Error(`Product not found: ${item._id}`);

        if (prod.stock < item.quantity) {
          throw new Error(`${prod.name} is out of stock`);
        }

        // ✅ Decrease product stock
        prod.stock -= item.quantity;
        await prod.save();

        return {
          id: prod._id,
          name: prod.name,
          quantity: item.quantity,
          price: item.price,
          seller: prod.seller, // ✅ Add seller ID here
          sellerName: prod.seller.name,
        };
      })
    );

    // ✅ Save order in DB
    const newOrder = await Order.create({
      userId,
      products: enrichedProducts,
      amount,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "Paid",
    });

    res.json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    res.status(500).json({ error: err.message });
  }
};
