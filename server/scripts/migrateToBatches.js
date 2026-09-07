// scripts/migrateToBatches.js
//
// One-time migration: converts every variant's legacy `stock` +
// `expiryDate` into a single batch inside the new `batches` array, so
// existing products keep working under the new batch-based model without
// losing any data.
//
// Run once with: node scripts/migrateToBatches.js
// Safe to re-run — skips any variant that already has batches.

import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js"; // adjust path to match your project

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const products = await Product.find({});
  let productsUpdated = 0;
  let variantsMigrated = 0;

  for (const product of products) {
    let changed = false;

    for (const variant of product.variants) {
      // Skip variants that already have batches (already migrated, or
      // created after this migration was rolled out).
      if (variant.batches && variant.batches.length > 0) continue;

      // Only create a batch if there's something meaningful to carry over.
      if ((variant.stock || 0) > 0 || variant.expiryDate) {
        variant.batches = [
          {
            stock: variant.stock || 0,
            expiryDate: variant.expiryDate || null,
            addedDate: product.createdAt || new Date(),
          },
        ];
        variantsMigrated += 1;
        changed = true;
      }
    }

    if (changed) {
      await product.save();
      productsUpdated += 1;
    }
  }

  console.log(`Done. Products updated: ${productsUpdated}, variants migrated: ${variantsMigrated}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});