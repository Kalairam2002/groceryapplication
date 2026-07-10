import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

const updateCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected ✅");

    // ── Step 1: Fetch all categories from DB ──────────
    const categories = await mongoose.connection.db
      .collection("categories")
      .find({})
      .toArray();

    console.log("\n📋 Categories found:");
    categories.forEach((c) => console.log(`  ${c.name} → ${c._id}`));

    // ── Step 2: Map category names to IDs ─────────────
    const getCategoryId = (name) => {
      const cat = categories.find((c) =>
        c.name.toLowerCase().includes(name.toLowerCase())
      );
      return cat ? cat._id.toString() : null;
    };

    const fruitsId        = getCategoryId("fruit");
    const vegetablesId    = getCategoryId("vegetable");
    const nonVegId        = getCategoryId("non vegetable");
    const groceryId       = getCategoryId("grocery");
    const freshId         = getCategoryId("fresh");
    const electronicsId   = getCategoryId("electrical");
    const clothingId      = getCategoryId("clothing");
    const automobileId    = getCategoryId("automobile");
    const dairyId         = getCategoryId("health");
    const snacksId        = getCategoryId("snack");

    console.log("\n🗂️ Category IDs:");
    console.log("Fruits:", fruitsId);
    console.log("Vegetables:", vegetablesId);
    console.log("Non Vegetables:", nonVegId);
    console.log("Grocery:", groceryId);
    console.log("Fresh:", freshId);
    console.log("Electronics:", electronicsId);
    console.log("Clothing:", clothingId);
    console.log("Automobile:", automobileId);

    // ── Step 3: Define product → category mapping ─────
    const productCategoryMap = [
      // Fruits
      { names: ["apple", "mango", "banana", "cherry", "strawberry", "grapes", "orange", "lime", "green lemon", "grapefruit", "red banana", "straw berry"], categoryId: fruitsId, label: "Fruits" },

      // Vegetables
      { names: ["tomato", "potato", "red amaranth", "spinach", "carrot", "onion"], categoryId: vegetablesId, label: "Vegetables" },

      // Non Vegetables / Meat
      { names: ["fish", "boneless mutton", "chicken"], categoryId: nonVegId, label: "Non Vegetables" },

      // Grocery / Spices
      { names: ["chilli powder", "turmeric powder", "chicken masala", "chilli masala", "cashew nuts", "choco cookie"], categoryId: groceryId, label: "Grocery" },

      // Dairy
      { names: ["raw full cream milk", "milk", "curd", "cheese"], categoryId: freshId, label: "Fresh/Dairy" },

      // Electronics
      { names: ["refrigerator", "washing machine", "samsung led tv", "tv-test", "lg top load", "lg front load", "samsung top load", "samsung front-load", "samsung - 80l"], categoryId: electronicsId, label: "Electronics" },

      // Clothing
      { names: ["white formal", "blue formal", "blue jean", "white premium short", "soft sandal"], categoryId: clothingId, label: "Clothing" },

      // Automobile
      { names: ["blue color leather", "red leather seat", "brown leather seat cover"], categoryId: automobileId, label: "Automobile" },
    ];

    // ── Step 4: Update products ────────────────────────
    let totalUpdated = 0;
    let totalSkipped = 0;

    for (const { names, categoryId, label } of productCategoryMap) {
      if (!categoryId) {
        console.log(`\n⚠️ Category not found for: ${label}`);
        continue;
      }

      for (const name of names) {
        const result = await Product.updateMany(
          { name: { $regex: name, $options: "i" } },
          { $set: { category: categoryId } }
        );

        if (result.modifiedCount > 0) {
          console.log(`✅ Updated ${result.modifiedCount} product(s): ${name} → ${label}`);
          totalUpdated += result.modifiedCount;
        } else {
          console.log(`⚠️ Not found: ${name}`);
          totalSkipped++;
        }
      }
    }

    console.log(`\n✅ Done!`);
    console.log(`Total Updated: ${totalUpdated}`);
    console.log(`Total Skipped: ${totalSkipped}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

updateCategories();