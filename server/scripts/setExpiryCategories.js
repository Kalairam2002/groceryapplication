import dotenv from "dotenv";
import connectDB from "../configs/db.js";
import Category from "../models/admin/Category.model.js";

dotenv.config();

const expiryCategoryNames = [
  "Non Vegetables", "Vegetables", "Fruits", "Snacks",
  "Fresh", "Grocery", "Health and wellness Products",
];

async function run() {
  await connectDB();
  const result = await Category.updateMany(
    { name: { $in: expiryCategoryNames } },
    { $set: { requiresExpiry: true } }
  );
  console.log(`Updated ${result.modifiedCount} categories`);
  process.exit(0);
}

run();