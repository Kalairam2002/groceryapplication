import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

await mongoose.connect(process.env.MONGODB_URI);

const ids = ["68fb751898555e2fd4ffa7a8", "6965f7f9c5f5c85c71567cfe"];
for (const id of ids) {
  const count = await Product.countDocuments({ category: id });
  console.log(`Category ID ${id} → ${count} product(s)`);
}

process.exitCode = 0;