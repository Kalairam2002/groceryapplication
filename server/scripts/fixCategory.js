import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

// Using the first "Vegetables" category ID found earlier
const VEGETABLES_CATEGORY_ID = "68fb751898555e2fd4ffa7a8";

const fixes = [
  { name: "tomato", category: VEGETABLES_CATEGORY_ID },
  { name: "Potato", category: VEGETABLES_CATEGORY_ID },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB Connected ✅\n");

  for (const fix of fixes) {
    const result = await Product.updateOne({ name: fix.name }, { $set: { category: fix.category } });
    if (result.matchedCount === 0) {
      console.log(`⚠️  No product found with name "${fix.name}"`);
    } else {
      console.log(`✅ Updated "${fix.name}" → category: ${fix.category}`);
    }
  }

  process.exitCode = 0;
};

run();