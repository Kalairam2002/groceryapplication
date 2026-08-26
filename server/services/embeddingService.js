import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Knowledge from "../models/Knowledge.js";
import Brand from "../models/admin/Brand.model.js";

const CHROMA_URL = process.env.CHROMA_URL || "http://20.244.42.204:8010";
const COLLECTION_NAME = "grocery_knowledge_base";
 
const client = new ChromaClient({ path: CHROMA_URL });
const embedder = new DefaultEmbeddingFunction();

let collectionInstance = null;

async function getCollection() {
  if (collectionInstance) return collectionInstance;
  collectionInstance = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
  });
  return collectionInstance;
}

async function addDocuments({ ids, documents, metadatas }) {
  const collection = await getCollection();
  await collection.upsert({ ids, documents, metadatas });
}

async function queryDocuments(queryText, nResults = 5) {
  const collection = await getCollection();
  const results = await collection.query({
    queryTexts: [queryText],
    nResults,
  });
  return results;
}

async function addInBatches(items, batchSize = 50) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await addDocuments({
      ids: batch.map((b) => b.id),
      documents: batch.map((b) => b.document),
      metadatas: batch.map((b) => b.metadata),
    });
    console.log(`  → embedded ${Math.min(i + batchSize, items.length)}/${items.length}`);
  }
}

async function embedAllProducts() {
  const products = await Product.find({}).lean();
  if (!products.length) {
    console.log("No products found to embed.");
    return;
  }

  // Look up real brand names (brand field on Product stores a Brand _id)
  const brands = await Brand.find({}).lean();
  const brandMap = new Map(brands.map((b) => [b._id.toString(), b.name]));

  // Look up real category names (raw "categories" collection, same as your controllers use)
  const CategoryCol = mongoose.connection.db.collection("categories");
  const allCategories = await CategoryCol.find({}).toArray();
  const categoryMap = new Map(allCategories.map((c) => [c._id.toString(), c.name]));

  const items = products.map((p) => {
    const descText = Array.isArray(p.description)
      ? p.description.join(" ")
      : (p.description || "");

    const brandName = brandMap.get(p.brand?.toString()) || p.brand || "Unknown brand";
    const categoryName = categoryMap.get(p.category?.toString()) || p.category || "Uncategorized";

    let variantText = (p.variants || [])
  .map(
    (v) =>
      `${v.sizeLabel || ""} ${v.quantity}${v.unit} - price ₹${v.offerPrice} (MRP ₹${v.price}), stock: ${v.stock}`
  )
  .join(" | ");

// Fallback for older products that store price/stock directly on the product (no variants array)
if (!variantText && p.price != null) {
  variantText = `${p.unit || ""} - price ₹${p.offerPrice} (MRP ₹${p.price}), stock: ${p.stock}`;
}

    const document = [
      `Product: ${p.name}`,
      `Brand: ${brandName}`,
      `Category: ${categoryName}`,
      descText ? `Description: ${descText}` : "",
      variantText ? `Variants: ${variantText}` : "",
      `In stock: ${p.inStock ? "yes" : "no"}`,
    ]
      .filter(Boolean)
      .join(". ");

    return {
      id: `product_${p._id.toString()}`,
      document,
      metadata: {
        type: "product",
        productId: p._id.toString(),
        name: p.name,
        brand: brandName,
        category: categoryName,
      },
    };
  });

  await addInBatches(items);
}

async function embedAllKnowledge() {
  const entries = await Knowledge.find({}).lean();
  if (!entries.length) {
    console.log("No knowledge entries found to embed.");
    return;
  }

  const items = entries.map((k) => {
    const document = [
      `Topic: ${k.topic}`,
      `Category: ${k.category}`,
      k.content,
      k.keywords?.length ? `Keywords: ${k.keywords.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    return {
      id: `knowledge_${k._id.toString()}`,
      document,
      metadata: {
        type: "knowledge",
        knowledgeId: k._id.toString(),
        topic: k.topic,
        category: k.category,
      },
    };
  });

  await addInBatches(items);
}

export {
  getCollection,
  addDocuments,
  queryDocuments,
  embedAllProducts,
  embedAllKnowledge,
};