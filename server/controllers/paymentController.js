import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/orderModel.js";
import Product from "../models/Product.js"; 
import dotenv from "dotenv";
import orderEmailTemplate from "../utils/orderEmailTemplate.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import {sendWhatsAppMessage} from "../utils/whatsapp.js";
import Invoice from "../models/Invoice.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    let { amount, currency = "INR", products, userId } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount received" });
    }

    amount = Math.round(amount);

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
      deliveryAddress,
    } = req.body;

    //  Verify Razorpay signature — untouched
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const enrichedProducts = await Promise.all(
      products.map(async (item) => {
        //  populate seller to get name and ID
        const prod = await Product.findById(item._id).populate("seller", "name");
        if (!prod) throw new Error(`Product not found: ${item._id}`);

        console.log("Product name:", prod.name);
        console.log("Product seller:", prod.seller);

        //  Find the correct variant
        const variant = prod.variants.id(item.variant?._id);
        if (!variant) throw new Error(`Variant not found for: ${prod.name}`);

        //  Get quantity safely
        const qty = Number(item.quantity) || Number(item.cartQty) || 1;
        console.log("Item qty fields:", { cartQty: item.cartQty, quantity: item.quantity, qty });

        //  Check stock
        if (variant.stock < qty) {
          throw new Error(`${prod.name} is out of stock`);
        }

        // Deduct stock safely
        variant.stock = Number(variant.stock) - qty;
        await prod.save();

        // Get seller ID safely — from product or from cart item
        const sellerId = prod.seller?._id 
          || item.seller 
          || item.sellerId 
          || null;

        const sellerName = prod.seller?.name 
          || item.sellerName 
          || "N/A";

        console.log("Final sellerId:", sellerId);
        console.log("Final sellerName:", sellerName);

        return {
          id:         prod._id,
          name:       prod.name,
          quantity:   qty,
          price:      item.variant?.offerPrice || item.price || 0,
          seller:     sellerId,
          sellerName: sellerName,
        };
      })
    );

    //  Save order in DB 
    const newOrder = await Order.create({
      userId,
      products: enrichedProducts,
      amount,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "Paid",
      deliveryAddress: deliveryAddress || {},
    });

    //  Create Invoices per seller
    const sellerGroups = {};
    enrichedProducts.forEach((item) => {
      const sId = item.seller?.toString() || "unknown";
      if (!sellerGroups[sId]) sellerGroups[sId] = [];
      sellerGroups[sId].push(item);
    });

    for (const [sellerId, sellerItems] of Object.entries(sellerGroups)) {
      if (sellerId === "unknown") continue;

      const safeItems = sellerItems.map((item) => {
        const safePrice = Number(item.price) || 0;
        const safeQty = Number(item.quantity) || 0;
        return {
          name: item.name,
          quantity: safeQty,
          price: safePrice,
          subtotal: safePrice * safeQty,
        };
      });

      const sellerTotal = safeItems.reduce((sum, item) => sum + item.subtotal, 0);

      await Invoice.create({
        invoiceNumber: `INV-${Date.now()}-${sellerId.slice(-4)}`,
        orderId: newOrder._id,
        sellerId: sellerId,
        userId: userId,
        items: safeItems,
        totalAmount: sellerTotal,
        paymentType: "ONLINE",
        razorpayPaymentId: razorpay_payment_id,
      });
    }

    //  Email
    try {
      const user     = await User.findOne({ username: userId });
      const subtotal = Math.floor(amount / 1.02);
      const tax      = amount - subtotal;

      const emailHTML = orderEmailTemplate({
        userName:  user.username,
        orderId:   newOrder.orderId,
        products:  enrichedProducts,
        subtotal,
        tax,
        total:     amount,
        dbOrderId: newOrder._id,
      });

      await sendEmail(user.email, 'maligaijaman - Order Confirmation', emailHTML);
      console.log('Order confirmation email sent to', user.email);
    } catch (emailErr) {
      console.error('[verifyPayment] Email failed (non-fatal):', emailErr.message);
    }

    //  WhatsApp
    const user = await User.findOne({ username: userId });
    const phoneWithCountryCode = `91${user.phoneNumber}`;
    await sendWhatsAppMessage(
      phoneWithCountryCode,
      user.username,
      newOrder.orderId,
      amount
    );

    res.json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    res.status(500).json({ error: err.message });
  }
};