import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

await mongoose.connect(process.env.MONGODB_URI);
const products = await Product.find({ inStock: true }, "name category").limit(40).lean();
products.forEach((p) => console.log(p.name));
process.exitCode = 0;