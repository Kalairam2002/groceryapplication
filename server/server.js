import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// ================= CONFIG =================

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

// ================= ROUTES =================

import userRouter from "./routes/userRouter.js";
import sellerRouter from "./routes/sellerRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRouter.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import adminRouter from "./routes/adminRoutes.js";
import contactRouter from "./routes/contactRoute.js";
import brandRouter from "./routes/admin/Brandroute.js";
import adminRouterData from "./routes/admin/CategoryRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import subCategoryRoutes from "./routes/admin/subCategoryRoutes.js";
import variantRoutes from "./routes/admin/variantRoutes.js";
import testRoute from "./routes/testRoute.js";
import locationRoute from "./routes/locationRoute.js";
import returnRouter from "./routes/returnRoutes.js";
import deliveryRoutes from "./routes/deliveryRoute.js";
import aiRouter from "./routes/aiRouter.js";
import invoiceRouter from "./routes/invoiceRoute.js";

// ================= MODELS =================

import Product from "./models/Product.js";
import Order from "./models/orderModel.js";
import User from "./models/User.js";
import Invoice from "./models/Invoice.js";

// ================= UTILS =================

import sendEmail from "./utils/sendEmail.js";
import orderEmailTemplate from "./utils/orderEmailTemplate.js";
import { sendWhatsAppMessage } from "./utils/whatsapp.js";

// ================= ENV =================

dotenv.config();

// ================= APP =================

const app = express();

// Get the actual directory where server.js exists.
// This is safer than using path.resolve().
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hostinger provides PORT.
// Local development uses 5000.
const port = Number(process.env.PORT) || 5000;

// Hostinger needs the server accessible externally.
const host = "0.0.0.0";

// ================= DATABASE =================

try {
  await connectDB();
  console.log("Database Connected");
} catch (error) {
  console.error("Database connection failed:", error);
  process.exit(1);
}

// ================= CLOUDINARY =================

try {
  await connectCloudinary();
  console.log("Cloudinary Connected");
} catch (error) {
  console.error("Cloudinary connection failed:", error);
}

// ================= CORS =================

// Add your actual frontend domain here if it is different.
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",

  "http://31.97.237.98:5000",

  "https://online-store.staging-rdegi.com",

  "https://maligaijaman.com",

  "https://maligaijaman-demo.rdegi.com",
];

// Add CLIENT_URL automatically if it exists.
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// Remove duplicate domains.
const uniqueAllowedOrigins = [
  ...new Set(allowedOrigins)
];

const corsOptions = {
  origin: function (origin, callback) {

    // Allow requests without Origin
    // such as Postman/server-to-server requests.
    if (!origin) {
      return callback(null, true);
    }

    if (uniqueAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked CORS origin:", origin);

    return callback(
      new Error(`CORS blocked for origin: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ]
};

app.use(cors(corsOptions));

// ================= MIDDLEWARE =================

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

// ================= HEALTH CHECK =================

// Use this to check whether Hostinger backend is running.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Maligaijaman backend is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// ================= CASHFREE ENV =================

const {
  CF_APP_ID,
  CF_SECRET_KEY,
  CF_ENV
} = process.env;

// ================= CASHFREE CREATE ORDER =================

app.post("/api/create-order", async (req, res) => {

  try {

    const {
      amount,
      cart,
      user,
      deliveryAddress
    } = req.body;

    if (!amount || isNaN(amount)) {

      return res.status(400).json({
        error: "Invalid amount received"
      });

    }

    if (!CF_APP_ID || !CF_SECRET_KEY || !CF_ENV) {

      console.error(
        "Cashfree environment variables are missing"
      );

      return res.status(500).json({
        error: "Cashfree configuration is missing"
      });

    }

    const orderId =
      "order_" + Date.now();

    const payload = {

      order_amount: Number(amount),

      order_currency: "INR",

      customer_details: {

        customer_id:
          user?.username || "guest",

        customer_email:
          user?.email || "test@test.com",

        customer_phone:
          user?.phone ||
          user?.phoneNumber ||
          "9999999999"

      },

      order_meta: {

        return_url:
          `${process.env.CLIENT_URL}/payment-success?order_id=${orderId}`

      },

      order_id: orderId
    };

    const response = await axios.post(

      `https://${CF_ENV}.cashfree.com/pg/orders`,

      payload,

      {
        headers: {

          "x-client-id":
            CF_APP_ID,

          "x-client-secret":
            CF_SECRET_KEY,

          "x-api-version":
            "2023-08-01",

          "Content-Type":
            "application/json"

        }
      }

    );

    global.orders =
      global.orders || {};

    global.orders[orderId] = {

      cart,
      user,
      amount,
      deliveryAddress

    };

    res.json(response.data);

  } catch (err) {

    console.error(
      "Cashfree create order error:",
      err.response?.data ||
      err.message
    );

    res.status(500).json({
      error: "Order creation failed"
    });

  }

});

// ================= CASHFREE VERIFY PAYMENT =================

app.get(
  "/api/verify-payment/:orderId",
  async (req, res) => {

    try {

      const {
        orderId
      } = req.params;

      if (
        !CF_APP_ID ||
        !CF_SECRET_KEY ||
        !CF_ENV
      ) {

        return res.status(500).json({
          error:
            "Cashfree configuration is missing"
        });

      }

      const response =
        await axios.get(

          `https://${CF_ENV}.cashfree.com/pg/orders/${orderId}`,

          {
            headers: {

              "x-client-id":
                CF_APP_ID,

              "x-client-secret":
                CF_SECRET_KEY,

              "x-api-version":
                "2023-08-01"

            }
          }

        );

      if (
        response.data.order_status !==
        "PAID"
      ) {

        return res.json({
          success: false
        });

      }

      const savedOrder =
        global.orders?.[orderId];

      if (!savedOrder) {

        return res.status(400).json({
          error: "Order not found"
        });

      }

      const {
        cart,
        user,
        amount,
        deliveryAddress
      } = savedOrder;

      // ================= ENRICH PRODUCTS =================

      const enrichedProducts =
        await Promise.all(

          cart.map(async (item) => {

            const prod =
              await Product.findById(
                item._id
              ).populate(
                "seller",
                "name"
              );

            if (!prod) {

              throw new Error(
                "Product not found"
              );

            }

            const purchaseQty =
              Number(item.cartQty) ||
              Number(item.quantity) ||
              1;

            if (
              prod.stock <
              purchaseQty
            ) {

              throw new Error(
                `${prod.name} out of stock`
              );

            }

            prod.stock =
              Number(prod.stock) -
              purchaseQty;

            await prod.save();

            const matchedVariant =
              prod.variants?.find(

                (v) =>
                  v._id?.toString() ===
                  item.variant?._id?.toString()

              );

            const resolvedPrice =

              Number(item.price) ||

              Number(
                item.variant?.offerPrice
              ) ||

              Number(
                matchedVariant?.offerPrice
              ) ||

              Number(
                prod.variants?.[0]?.offerPrice
              ) ||

              0;

            return {

              id: prod._id,

              name: prod.name,

              quantity:
                purchaseQty,

              price:
                resolvedPrice,

              seller:
                prod.seller?._id ||
                null,

              sellerName:
                prod.seller?.name ||
                "N/A"

            };

          })

        );

      // ================= SAVE ORDER =================

      const newOrder =
        await Order.create({

          userId:
            user?.id ||
            user?._id,

          products:
            enrichedProducts,

          amount,

          paymentId:
            response.data.cf_order_id,

          orderId,

          status: "Paid",

          paymentGateway:
            "Cashfree",

          deliveryAddress:
            deliveryAddress || {}

        });

      // ================= CREATE INVOICES =================

      const sellerGroups = {};

      enrichedProducts.forEach(
        (item) => {

          const sId =
            item.seller?.toString() ||
            "unknown";

          if (!sellerGroups[sId]) {

            sellerGroups[sId] = [];

          }

          sellerGroups[sId].push(item);

        }
      );

      for (
        const [
          sellerId,
          sellerItems
        ]
        of Object.entries(
          sellerGroups
        )
      ) {

        if (
          sellerId === "unknown"
        ) {

          continue;

        }

        const safeItems =
          sellerItems.map(
            (item) => {

              const safePrice =
                Number(item.price) ||
                0;

              const safeQty =
                Number(item.quantity) ||
                0;

              return {

                name:
                  item.name,

                quantity:
                  safeQty,

                price:
                  safePrice,

                subtotal:
                  safePrice *
                  safeQty

              };

            }
          );

        const sellerTotal =
          safeItems.reduce(

            (sum, item) =>
              sum +
              item.subtotal,

            0

          );

        await Invoice.create({

          invoiceNumber:
            `INV-${Date.now()}-${sellerId.slice(-4)}`,

          orderId:
            newOrder._id,

          sellerId,

          userId:
            user?.id ||
            user?._id,

          items:
            safeItems,

          totalAmount:
            sellerTotal,

          paymentType:
            "ONLINE",

          razorpayPaymentId:
            response.data.cf_order_id

        });

      }

      // ================= EMAIL =================

      try {

        const dbUser =
          await User.findById(
            user?.id ||
            user?._id
          );

        if (dbUser) {

          const subtotal =
            Math.floor(
              amount / 1.05
            );

          const tax =
            amount -
            subtotal;

          const emailHTML =
            orderEmailTemplate({

              userName:
                dbUser.username,

              orderId,

              products:
                enrichedProducts,

              subtotal,

              tax,

              total:
                amount

            });

          await sendEmail(

            dbUser.email,

            "maligaijaman - Order Confirmation",

            emailHTML

          );

          console.log(
            "Order confirmation email sent to",
            dbUser.email
          );

        }

      } catch (emailErr) {

        console.error(
          "[verifyPayment] Email failed:",
          emailErr.message
        );

      }

      // ================= WHATSAPP =================

      try {

        const dbUser =
          await User.findById(
            user?.id ||
            user?._id
          );

        if (
          dbUser?.phoneNumber
        ) {

          const phone =
            `91${dbUser.phoneNumber}`;

          await sendWhatsAppMessage(

            phone,

            dbUser.username,

            orderId,

            amount

          );

        }

      } catch (whatsappErr) {

        console.error(
          "[verifyPayment] WhatsApp failed:",
          whatsappErr.message
        );

      }

      // Remove temporary order
      // after successful processing.
      delete global.orders[orderId];

      res.json({

        success: true,

        order:
          newOrder

      });

    } catch (err) {

      console.error(
        "Cashfree verify error:",
        err
      );

      res.status(500).json({
        error:
          err.message
      });

    }

  }
);

// ================= PHONE LOGIN =================

app.post(
  "/api/auth/phone-login",
  async (req, res) => {

    try {

      const {
        phoneNumber
      } = req.body;

      let user =
        await User.findOne({
          phoneNumber
        });

      if (!user) {

        return res.status(400).json({

          message:
            "User not found. Please register first."

        });

      }

      const token =
        jwt.sign(

          {
            id: user._id
          },

          process.env.JWT_SECRET,

          {
            expiresIn: "1d"
          }

        );

      res.json({

        user,

        token

      });

    } catch (error) {

      console.error(
        "Phone login error:",
        error
      );

      res.status(500).json({

        message:
          "Phone login failed"

      });

    }

  }
);

// ================= TEMP PRODUCTS =================

app.get(
  "/api/temp/products",
  async (req, res) => {

    try {

      const products =
        await Product.find(
          {},
          "name category"
        ).lean();

      res.json(products);

    } catch (error) {

      res.status(500).json({
        error:
          error.message
      });

    }

  }
);

// ================= TEMP CATEGORIES =================

app.get(
  "/api/temp/categories",
  async (req, res) => {

    try {

      const categories =
        await mongoose
          .connection
          .db
          .collection("categories")
          .find({})
          .toArray();

      res.json(categories);

    } catch (error) {

      res.status(500).json({
        error:
          error.message
      });

    }

  }
);

// ================= TEMP COLLECTIONS =================

app.get(
  "/api/temp/collections",
  async (req, res) => {

    try {

      const collections =
        await mongoose
          .connection
          .db
          .listCollections()
          .toArray();

      res.json(

        collections.map(
          (c) => c.name
        )

      );

    } catch (error) {

      res.status(500).json({
        error:
          error.message
      });

    }

  }
);

// ================= DEBUG CATEGORY =================

app.get(
  "/api/debug/category",
  async (req, res) => {

    try {

      const Category =
        mongoose
          .connection
          .db
          .collection(
            "categories"
          );

      const fruitsCategory =
        await Category.findOne({

          name: {
            $regex:
              "fruit",

            $options:
              "i"
          }

        });

      if (!fruitsCategory) {

        return res.status(404).json({

          error:
            "Fruits category not found"

        });

      }

      const products =
        await Product.find(

          {

            category:
              fruitsCategory
                ._id
                .toString()

          },

          "name category"

        ).lean();

      res.json({

        fruitsCategory,

        categoryId:
          fruitsCategory
            ._id
            .toString(),

        products

      });

    } catch (error) {

      res.status(500).json({
        error:
          error.message
      });

    }

  }
);

// =====================================================
// ROUTES
// =====================================================

app.use(
  "/api/admin",
  adminRouter
);

app.use(
  "/api/admindata",
  adminRouterData
);

app.use(
  "/api/user",
  userRouter
);

app.use(
  "/api/seller",
  sellerRouter
);

app.use(
  "/api/product",
  productRouter
);

app.use(
  "/api/cart",
  cartRouter
);

app.use(
  "/api/address",
  addressRouter
);

app.use(
  "/api/order",
  orderRouter
);

app.use(
  "/api/contact",
  contactRouter
);

app.use(
  "/api/payment",
  paymentRoutes
);

app.use(
  "/api/brand",
  brandRouter
);

app.use(
  "/api/subcategory",
  subCategoryRoutes
);

app.use(
  "/api/variant",
  variantRoutes
);

app.use(
  "/api/test",
  testRoute
);

app.use(
  "/api/loc",
  locationRoute
);

app.use(
  "/api/returns",
  returnRouter
);

app.use(
  "/api/delivery",
  deliveryRoutes
);

app.use(
  "/api/deliveryboy/registration",
  userRouter
);

app.use(
  "/api/ai",
  aiRouter
);

app.use(
  "/api/invoices",
  invoiceRouter
);

// =====================================================
// PRODUCTION FRONTEND
// =====================================================

if (
  process.env.NODE_ENV ===
  "production"
) {

  console.log(
    "Production mode enabled"
  );

  // server.js:
  // E:\groceryapplication-main\server\server.js
  //
  // The Hostinger deploy has "Root directory" set to "server",
  // so only the server/ folder is present at runtime.
  // The build script copies the finished React build into
  // server/client-build (see server/package.json "build" script),
  // so we serve it from there instead of the sibling
  // ../frontend/build folder, which does not exist in production.

  const frontendPath =
    path.join(
      __dirname,
      "client-build"
    );

  console.log(
    "Frontend path:",
    frontendPath
  );

  app.use(
    express.static(
      frontendPath
    )
  );

  // React SPA fallback.
  app.get(
    /^(?!\/api).*/,
    (req, res) => {

      res.sendFile(
        path.join(
          frontendPath,
          "index.html"
        )
      );

    }
  );

}

// =====================================================
// 404 API HANDLER
// =====================================================

app.use(
  "/api",
  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        "API route not found",

      path:
        req.originalUrl

    });

  }
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (err, req, res, next) => {

    console.error(
      "Server error:",
      err
    );

    if (
      err.message?.startsWith(
        "CORS blocked"
      )
    ) {

      return res.status(403).json({

        success: false,

        message:
          "CORS error",

        error:
          err.message

      });

    }

    res.status(
      err.status || 500
    ).json({

      success: false,

      message:
        err.message ||
        "Internal server error"

    });

  }
);

// =====================================================
// START SERVER
// =====================================================

app.listen(
  port,
  host,
  () => {

    console.log(
      `Server is running on http://${host}:${port}`
    );

    console.log(
      `Environment: ${
        process.env.NODE_ENV ||
        "development"
      }`
    );

  }
);
