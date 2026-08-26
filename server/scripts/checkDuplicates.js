import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

await mongoose.connect(process.env.MONGODB_URI);

const names = ["tomato", "Fish", "Potato", "Dessert"];
for (const name of names) {
  const matches = await Product.find({ name }).lean();
  console.log(`── "${name}" — ${matches.length} match(es) ──`);
  matches.forEach((p) => {
    console.log(`  _id: ${p._id}, brand: ${p.brand}, variants count: ${p.variants?.length ?? 0}`);
  });
  console.log();
}

process.exitCode = 0;