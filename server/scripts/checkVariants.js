import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

await mongoose.connect(process.env.MONGODB_URI);

const names = ["tomato", "Fish", "Potato"];
for (const name of names) {
  const product = await Product.findOne({ name }).lean();
  console.log(`── ${name} ──`);
  console.log(JSON.stringify(product?.variants, null, 2));
  console.log();
}

process.exitCode = 0;