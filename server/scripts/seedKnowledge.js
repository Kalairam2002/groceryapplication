import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Knowledge from "../models/Knowledge.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

const knowledgeData = [
  // ── Payment ───────────────────────────────────────
  {
    topic: "payment methods",
    category: "payment",
    content: "We accept online payments via Cashfree and Razorpay payment gateway including UPI, Credit Cards, Debit Cards and Net Banking. Cash on Delivery is not available currently.",
    keywords: ["payment", "pay", "upi", "card", "net banking", "cashfree", "cod", "cash"]
  },
  {
    topic: "payment process",
    category: "payment",
    content: "To pay: Go to cart → Click Checkout → Fill delivery address → Click Pay Now → Complete payment via UPI, Card or Net Banking. Payment is secure and encrypted.",
    keywords: ["how to pay", "payment process", "checkout", "pay now"]
  },
  {
    topic: "payment failure",
    category: "payment",
    content: "If your payment fails, the amount will be automatically refunded to your account within 5-7 business days. You can try placing the order again.",
    keywords: ["payment failed", "payment failure", "refund", "money deducted"]
  },

  // ── Cart ──────────────────────────────────────────
  {
    topic: "add to cart",
    category: "cart",
    content: "To add a product to cart, click the Add to Cart button on any product card. Select your preferred variant first, then click Add to Cart. You can view your cart by clicking the cart icon at the top right.",
    keywords: ["add to cart", "cart", "how to add", "shopping cart"]
  },
  {
    topic: "cart management",
    category: "cart",
    content: "You can view your cart by clicking the cart icon at the top right. From cart you can update quantities, remove items and proceed to checkout.",
    keywords: ["cart", "update cart", "remove from cart", "view cart"]
  },

  // ── Orders ────────────────────────────────────────
  {
    topic: "place order",
    category: "order",
    content: "To place an order: Browse products → Add to Cart → Go to Cart → Click Checkout → Fill delivery address → Choose payment → Pay. You will receive email confirmation after successful order.",
    keywords: ["place order", "how to order", "buy", "purchase", "order process"]
  },
  {
    topic: "track order",
    category: "order",
    content: "To track your order, go to My Orders section from the top navigation menu. You can see all your orders and their current status including Processing, Shipped and Delivered.",
    keywords: ["track order", "order status", "where is my order", "order tracking"]
  },
  {
    topic: "cancel order",
    category: "order",
    content: "To cancel an order, go to My Orders section and click on the order you want to cancel. Contact our support team through the Contact Us page for assistance with cancellation.",
    keywords: ["cancel order", "order cancellation", "cancel my order"]
  },
  {
    topic: "order confirmation",
    category: "order",
    content: "After placing an order you will receive an email confirmation with your order details. You will also receive WhatsApp notification with order summary.",
    keywords: ["order confirmation", "order email", "order notification"]
  },

  // ── Delivery ──────────────────────────────────────
  {
    topic: "delivery information",
    category: "delivery",
    content: "We deliver to your doorstep. Add your delivery address at checkout. Delivery time varies by location. You will receive order status updates via email.",
    keywords: ["delivery", "deliver", "shipping", "delivery time", "how long"]
  },
  {
    topic: "delivery charges",
    category: "delivery",
    content: "Delivery charges depend on your location and order value. You can see the exact delivery charges at the checkout page before making payment.",
    keywords: ["delivery charges", "shipping charges", "delivery fee", "free delivery", "free shipping"]
  },
  {
    topic: "delivery address",
    category: "delivery",
    content: "You can add your delivery address during checkout. Make sure to provide complete address including house number, street, city and pincode for successful delivery.",
    keywords: ["delivery address", "shipping address", "address", "pincode"]
  },

  // ── Returns ───────────────────────────────────────
  {
    topic: "return policy",
    category: "return",
    content: "Returns are only accepted within 24 hours of placing your order. After payment, a 'Return Product' button will appear where you can submit a return request — select the product, choose a reason (damaged, wrong item, quality issue, or changed your mind), and provide your bank details for the refund. Note that some products may not be eligible for return.",
    keywords: ["return", "return policy", "how to return", "return product", "24 hours"]
  },
  {
    topic: "refund policy",
    category: "return",
    content: "Once your return is approved, the refund will be processed to the bank account details you provided during the return request within 5-7 business days.",
  },

  // ── Account ───────────────────────────────────────
  {
    topic: "login",
    category: "account",
    content: "Click on the user icon at the top right corner to login. You can login using your phone number. New users can register by clicking the Register button.",
    keywords: ["login", "sign in", "log in", "how to login"]
  },
  {
    topic: "register",
    category: "account",
    content: "Click on the user icon at the top right corner and select Register to create a new account. Fill in your name, email and phone number to complete registration.",
    keywords: ["register", "sign up", "create account", "new account", "how to register"]
  },
  {
    topic: "account management",
    category: "account",
    content: "Click on the user icon at the top right to access your account settings, view orders and update your profile information.",
    keywords: ["account", "profile", "my account", "account settings"]
  },
  {
    topic: "forgot password",
    category: "account",
    content: "If you forgot your password, click on Login and then click Forgot Password. Enter your registered email to receive password reset instructions.",
    keywords: ["forgot password", "reset password", "password", "change password"]
  },

  // ── Seller ────────────────────────────────────────
  {
    topic: "become seller",
    category: "seller",
    content: "Want to sell on our platform? Click on Become a Seller in the top navigation menu. Fill in your seller details and start selling your products to thousands of customers.",
    keywords: ["become seller", "sell", "seller", "how to sell", "register as seller", "vendor"]
  },
  {
    topic: "seller benefits",
    category: "seller",
    content: "As a seller you can list unlimited products, manage inventory, track orders and receive payments directly. Our platform provides easy to use seller dashboard.",
    keywords: ["seller benefits", "why sell", "seller features", "seller dashboard"]
  },

  // ── Wishlist ──────────────────────────────────────
  {
    topic: "wishlist",
    category: "wishlist",
    content: "Click the heart icon on any product card to add it to your wishlist. You can view and manage your wishlist from the top navigation menu.",
    keywords: ["wishlist", "favourite", "favorite", "save product", "heart icon"]
  },

  // ── Support ───────────────────────────────────────
  {
    topic: "contact support",
    category: "support",
    content: "You can reach us by phone at +91 8682860385 or +91 7845298544, or by email at info@rdegi.com. You can also visit our Contact Us page from the navigation menu for more support options.",
    keywords: ["contact", "support", "help", "customer care", "contact us", "helpline", "phone number", "email"]
  },
  {
    topic: "about store",
    category: "about",
    content: "We are Grocery Shop, an innovative team of food suppliers, part of RDEG Software Services. We are located at Instaspace, Near Kotak Mahindra Bank, Hosur - 635126. We connect buyers with verified sellers for the best shopping experience.",
    keywords: ["about", "about us", "who are you", "what is this store", "store info", "address", "location"]
  },
];

const seedKnowledge = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected ✅");

    // Clear existing knowledge
    await Knowledge.deleteMany({});
    console.log("Cleared existing knowledge ✅");

    // Insert new knowledge
    await Knowledge.insertMany(knowledgeData);
    console.log(`✅ Added ${knowledgeData.length} knowledge entries!`);

    console.log("\n📋 Topics added:");
    knowledgeData.forEach((k) => console.log(`  ✅ ${k.topic}`));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedKnowledge();