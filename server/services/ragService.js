import Product from "../models/Product.js";
import Knowledge from "../models/Knowledge.js";
import mongoose from "mongoose";
import { queryDocuments } from "./embeddingService.js";



// ── Extract Keywords ───────────────────────────────
export const extractKeywords = (query) => {
  const stopWords = [
    "what", "is", "the", "are", "tell", "me", "about",
    "how", "much", "does", "cost", "price", "of", "for",
    "do", "you", "have", "any", "show", "list", "give",
    "available", "in", "stock", "a", "an", "and", "or",
    "please", "can", "i", "get", "find", "search", "where",
    "when", "which", "who", "why", "this", "that", "these"
  ];

  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .filter((w) => w.length > 2 && !stopWords.includes(w));
};

// ── Retrieve Product Documents ─────────────────────
export const retrieveProductDocuments = async (query) => {
  const keywords = extractKeywords(query);
  const q = query.toLowerCase();
  let documents = [];

  // 1. Search by product name
  if (keywords.length > 0) {
    const nameSearch = await Product.find({
      inStock: true,
      $or: keywords.map((kw) => ({
        name: { $regex: kw, $options: "i" }
      }))
    }, "name description category variants seller")
      .populate("seller", "name")
      .limit(5)
      .lean();
    documents = [...nameSearch];
  }

  // 2. Search by description
  if (keywords.length > 0) {
    const descSearch = await Product.find({
      inStock: true,
      $or: keywords.map((kw) => ({
        description: { $elemMatch: { $regex: kw, $options: "i" } }
      }))
    }, "name description category variants seller")
      .populate("seller", "name")
      .limit(5)
      .lean();

    descSearch.forEach((p) => {
      if (!documents.find((d) => d._id.toString() === p._id.toString())) {
        documents.push(p);
      }
    });
  }

  // 3. Search by category
  const Category = mongoose.connection.db.collection("categories");
  const allCategories = await Category.find({}).toArray();
  const matchedCategory = allCategories.find((cat) =>
    q.includes(cat.name.toLowerCase()) ||
    cat.name.toLowerCase().split(" ").some(
      (word) => word.length > 3 && q.includes(word.toLowerCase())
    )
  );

  if (matchedCategory) {
    const categoryProducts = await Product.find({
      inStock: true,
      category: matchedCategory._id.toString()
    }, "name description category variants seller")
      .populate("seller", "name")
      .limit(10)
      .lean();

    categoryProducts.forEach((p) => {
      if (!documents.find((d) => d._id.toString() === p._id.toString())) {
        documents.push(p);
      }
    });
  }

  return { documents, matchedCategory };
};

// ── Retrieve Knowledge Documents ───────────────────
export const retrieveKnowledgeDocuments = async (query) => {
  const keywords = extractKeywords(query);
  const q = query.toLowerCase();

  // Search knowledge base by keywords
  const knowledge = await Knowledge.find({
    $or: [
      // Search by keywords array
      { keywords: { $in: keywords.map(kw => new RegExp(kw, "i")) } },
      // Search by topic
      { topic: { $regex: keywords.join("|"), $options: "i" } },
      // Search by content
      { content: { $regex: keywords.join("|"), $options: "i" } },
      // Search by category
      { category: { $regex: keywords.join("|"), $options: "i" } },
    ]
  }).limit(3).lean();

  return knowledge;
};

// ── Format Product Documents ───────────────────────
export const formatProductDocuments = (documents) => {
  if (documents.length === 0) return "";

  return documents.map((p) => {
    const desc = Array.isArray(p.description)
      ? p.description.join(". ")
      : p.description || "No description available";

    const prices = p.variants
      ?.map((v) => `${v.quantity} ${v.unit} for ₹${v.offerPrice} (Tax: ${v.tax}%, Stock: ${v.stock} units)`)
      .join(", ") || "Price not available";

    const seller = p.seller?.name || "Our store";

    return `Product: ${p.name}
Description: ${desc}
Price: ${prices}
Sold by: ${seller}`;
  }).join("\n\n---\n\n");
};

// ── Format Knowledge Documents ─────────────────────
export const formatKnowledgeDocuments = (knowledge) => {
  if (knowledge.length === 0) return "";
  return knowledge.map((k) => `${k.topic}: ${k.content}`).join("\n\n");
};



// ── Vector-based Retrieval (ChromaDB) ──────────────
export const retrieveRelevantContext = async (query, nResults = 5) => {
  const results = await queryDocuments(query, nResults);

  // results.documents[0], results.metadatas[0] correspond to the first (only) query text
  const docs = results.documents?.[0] || [];
  const metadatas = results.metadatas?.[0] || [];

  const productContext = [];
  const knowledgeContext = [];

  docs.forEach((doc, i) => {
    const meta = metadatas[i] || {};
    if (meta.type === "product") {
      productContext.push(doc);
    } else if (meta.type === "knowledge") {
      knowledgeContext.push(doc);
    }
  });

  return {
    productContext: productContext.join("\n\n---\n\n"),
    knowledgeContext: knowledgeContext.join("\n\n"),
    combinedContext: docs.join("\n\n---\n\n"),
  };
};

// ── Build the final prompt for TinyLlama ───────────
export const buildRAGPrompt = (userQuery, combinedContext) => {
  return `You are a helpful assistant for a grocery e-commerce store. Use the context below to answer the customer's question accurately. If the context doesn't contain relevant information, say you don't have that information rather than guessing.

Context:
${combinedContext}

Customer question: ${userQuery}

Answer:`;
};