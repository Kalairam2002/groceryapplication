import { createRequire } from 'module';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import path from "path"
import connectDB from './configs/db.js';
import dotenv from 'dotenv';
import axios from 'axios';
import userRouter from './routes/userRouter.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRouter.js';
import addressRouter from './routes/addressRoute.js'
import orderRouter from './routes/orderRoute.js';
import adminRouter from './routes/adminRoutes.js';
import contactRouter from './routes/contactRoute.js';
import brandRouter from './routes/admin/Brandroute.js'
import admin from './models/Admin.js';
import adminRouterData from './routes/admin/CategoryRoute.js'
import paymentRoutes from './routes/paymentRoute.js'
import subCategoryRoutes from "./routes/admin/subCategoryRoutes.js";
import variantRoutes from "./routes/admin/variantRoutes.js";
import testRoute from './routes/testRoute.js';
import locationRoute from './routes/locationRoute.js';
import Product from './models/Product.js';
import Order from './models/orderModel.js';
import User from './models/User.js';
import sendEmail from './utils/sendEmail.js';
import orderEmailTemplate from './utils/orderEmailTemplate.js';
import { sendWhatsAppMessage } from './utils/whatsapp.js';
import jwt from "jsonwebtoken";
import returnRouter from './routes/returnRoutes.js';
import deliveryRoutes from "./routes/deliveryRoute.js";
import aiRouter from './routes/aiRouter.js';
import Invoice from './models/Invoice.js';
import invoiceRouter from './routes/invoiceRoute.js';
import mongoose from "mongoose";


dotenv.config();

const app = express();
const __dirname = path.resolve();
const port = process.env.PORT || 5000;

await connectDB();
await connectCloudinary();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "http://31.97.237.98:5000",
  "https://online-store.staging-rdegi.com",
  "https://maligaijaman.com",
  "https://maligaijaman-demo.rdegi.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const { CF_APP_ID, CF_SECRET_KEY, CF_ENV } = process.env;

// ================= CASHFREE CREATE ORDER — untouched =================
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, cart, user, deliveryAddress } = req.body;

    const orderId = "order_" + Date.now();

    const payload = {
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: user?.username || "guest",
        customer_email: user?.email || "test@test.com",
        customer_phone: user?.phone || "9999999999"
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/payment-success?order_id=${orderId}`
      },
      order_id: orderId
    };

    const response = await axios.post(
      `https://${CF_ENV}.cashfree.com/pg/orders`,
      payload,
      {
        headers: {
          "x-client-id": CF_APP_ID,
          "x-client-secret": CF_SECRET_KEY,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
      }
    );

    global.orders = global.orders || {};
    global.orders[orderId] = { cart, user, amount, deliveryAddress };

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// ================= CASHFREE VERIFY PAYMENT =================
app.get("/api/verify-payment/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await axios.get(
      `https://${CF_ENV}.cashfree.com/pg/orders/${orderId}`,
      {
        headers: {
          "x-client-id": CF_APP_ID,
          "x-client-secret": CF_SECRET_KEY,
          "x-api-version": "2023-08-01",
        },
      }
    );

    if (response.data.order_status !== "PAID") {
      return res.json({ success: false });
    }

    const savedOrder = global.orders?.[orderId];

    if (!savedOrder) {
      return res.status(400).json({ error: "Order not found" });
    }

    const { cart, user, amount, deliveryAddress } = savedOrder;

    // ================= ENRICH PRODUCTS + REDUCE STOCK =================
    const enrichedProducts = await Promise.all(
      cart.map(async (item) => {
        // populate seller to get name and ID correctly
        const prod = await Product.findById(item._id).populate("seller", "name");

        if (!prod) throw new Error("Product not found");

        const purchaseQty = Number(item.cartQty) || Number(item.quantity) || 1;

        if (prod.stock < purchaseQty) {
          throw new Error(`${prod.name} out of stock`);
        }

        prod.stock -= purchaseQty;
        await prod.save();

        // Resolve a reliable price: prefer cart item price, fallback to variant offerPrice, fallback to matched/first variant
        const matchedVariant = prod.variants?.find(
          (v) => v._id?.toString() === item.variant?._id?.toString()
        );
        const resolvedPrice =
          Number(item.price) ||
          Number(item.variant?.offerPrice) ||
          Number(matchedVariant?.offerPrice) ||
          Number(prod.variants?.[0]?.offerPrice) ||
          0;

        return {
          id:         prod._id,
          name:       prod.name,
          quantity:   purchaseQty,
          price:      resolvedPrice,
          seller:     prod.seller._id,   //  save only ObjectId
          sellerName: prod.seller.name,  //  save seller name
        };
      })
    );

    // ================= SAVE ORDER — untouched =================
    const newOrder = await Order.create({
      userId: user.id,
      products: enrichedProducts,
      amount,
      paymentId: response.data.cf_order_id,
      orderId,
      status: "Paid",
      paymentGateway: "Cashfree",
      deliveryAddress: deliveryAddress || {},
    });

    // ================= CREATE INVOICES PER SELLER =================
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
        userId: user.id,
        items: safeItems,
        totalAmount: sellerTotal,
        paymentType: "ONLINE",
        razorpayPaymentId: response.data.cf_order_id,
      });
    }

    // ================= EMAIL — untouched =================
    const dbUser = await User.findById(user.id);

    const subtotal = Math.floor(amount / 1.05);
    const tax = amount - subtotal;

    const emailHTML = orderEmailTemplate({
      userName: dbUser.username,
      orderId,
      products: enrichedProducts,
      subtotal,
      tax,
      total: amount,
    });

    await sendEmail(
      dbUser.email,
      "maligaijaman - Order Confirmation",
      emailHTML
    );

    // ================= WHATSAPP =================
    const phone = `91${dbUser.phoneNumber}`;

    await sendWhatsAppMessage(
      phone,
      dbUser.username,
      orderId,
      amount
    );

    delete global.orders[orderId];

    res.json({ success: true, order: newOrder });

  } catch (err) {
    console.error("Cashfree verify error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= PHONE LOGIN =================
app.post("/api/auth/phone-login", async (req, res) => {
  const { phoneNumber } = req.body;

  let user = await User.findOne({ phoneNumber });

  if (!user) {
    return res.status(400).json({ message: "User not found. Please register first." });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.json({ user, token });
});

app.get("/api/temp/products", async (req, res) => {
  const products = await Product.find({}, "name category").lean();
  res.json(products);
});

app.get("/api/temp/categories", async (req, res) => {
  try {
    const categories = await mongoose.connection.db
      .collection("categories")
      .find({})
      .toArray();
    res.json(categories);
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get("/api/temp/collections", async (req, res) => {
  try {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    res.json(collections.map(c => c.name));
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get("/api/debug/category", async (req, res) => {
  try {
    const Category = mongoose.connection.db.collection("categories");
    const fruitsCategory = await Category.findOne({ 
      name: { $regex: "fruit", $options: "i" } 
    });
    
    const products = await Product.find({
      category: fruitsCategory._id.toString()
    }, "name category").lean();

    res.json({ 
      fruitsCategory,
      categoryId: fruitsCategory._id.toString(),
      products 
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});


// ================= ROUTES =================
app.use('/api/admin', adminRouter);
app.use('/api/admindata', adminRouterData);
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/contact', contactRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/brand", brandRouter);
app.use("/api/subcategory", subCategoryRoutes);
app.use("/api/variant", variantRoutes);
app.use("/api/test", testRoute);
app.use("/api/loc", locationRoute);
app.use('/api/returns', returnRouter);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/deliveryboy/registration", userRouter);
app.use("/api/ai", aiRouter);
app.use('/api/invoices', invoiceRouter);



if (process.env.NODE_ENV === "Production") {
  console.log("Production mode")
  app.use(express.static(path.join(__dirname, "frontend", "build")))
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}`)
});

