import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import path from "path"
import connectDB from './configs/db.js';
import dotenv from 'dotenv';
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

const app = express();
const __dirname = path.resolve();
const port = process.env.PORT || 4000;


dotenv.config(); // Load .env file

// Connect DB 
await connectDB() ; 
await connectCloudinary();

// 🔑 Whitelisted origins
const allowedOrigins = [
  "http://localhost:3000",           // local React dev
  "http://localhost:4000",  
  "http://31.97.237.98:5000" ,"https://onlinestore.staging-rdegi.com"// replace with actual Render frontend URL
];

// ✅ Define corsOptions BEFORE using it
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

// ✅ Apply middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));     
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Admin routes
app.use('/api/admin', adminRouter);
app.use('/api/admindata',adminRouterData);


app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/contact', contactRouter);
// Routes
app.use("/api/payment", paymentRoutes);
app.use("/api/brand", brandRouter);

if(process.env.NODE_ENV === "Production"){
    console.log("Production mode")
    app.use(express.static(path.join(__dirname, "frontend", "build")))
    app.get(/(.*)/, (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
    });
     
 

}


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port} ` )
})


