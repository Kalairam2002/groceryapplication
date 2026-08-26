import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

const SNACKS_CATEGORY_ID = "6970884da40c5e0b7d4c5fc0";

const fixes = [
  { name: "tomato", brand: "Freash to Home" },
  { name: "Potato", brand: "Freash to Home" },
  { name: "Dessert", brand: "Freash to Home", category: SNACKS_CATEGORY_ID },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB Connected ✅\n");

  for (const fix of fixes) {
    const update = { brand: fix.brand };
    if (fix.category) update.category = fix.category;

    const result = await Product.updateOne({ name: fix.name }, { $set: update });

    if (result.matchedCount === 0) {
      console.log(`⚠️  No product found with name "${fix.name}"`);
    } else {
      console.log(`✅ Updated "${fix.name}" →`, update);
    }
  }

  process.exitCode = 0;
};

run();