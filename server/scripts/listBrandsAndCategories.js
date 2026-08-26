import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Brand from "../models/admin/Brand.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

await mongoose.connect(process.env.MONGODB_URI);

console.log("── Brands ──");
const brands = await Brand.find({}).lean();
brands.forEach((b) => console.log(b.name));

console.log("\n── Categories ──");
const CategoryCol = mongoose.connection.db.collection("categories");
const categories = await CategoryCol.find({}).toArray();
categories.forEach((c) => console.log(c.name, "→", c._id.toString()));

process.exitCode = 0;