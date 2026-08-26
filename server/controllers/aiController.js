import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { retrieveRelevantContext } from "../services/ragService.js";
dotenv.config();

const LLAMA_URL = process.env.TINYLLAMA_API_URL;

const askTinyLlama = async (prompt) => {
  try {
    const response = await axios.post(
      `${LLAMA_URL}/api/generate`,
      {
        model: "phi3:mini",
        prompt: prompt,
        stream: false,
        options: {
          num_predict: 90,
          temperature: 0.05,
          stop: ["<|user|>", "<|system|>"],
        },
      },
      { timeout: 90000 }
    );
    return response.data.response.trim();
  } catch (error) {
    console.error("TinyLlama error:", error.message);
    return "I'm having trouble connecting right now. Please try again shortly!";
  }
};

const extractProductName = (query, stopWords) => {
  return query
    .toLowerCase()
    .split(" ")
    .filter((w) => !stopWords.includes(w) && w.length > 1)
    .join(" ");
};

const formatProductPriceUnit = (p) => {
  const variant = p.variants?.[0];
  const price = variant?.offerPrice ?? p.offerPrice;
  const unit = variant?.unit ?? p.unit;
  return price != null ? `${p.name} (₹${price}/${unit})` : `${p.name} (price not available)`;
};

const GENERIC_CATEGORY_WORDS = new Set(["products", "items", "and", "goods", "things", "material", "materials"]);

const normalizeWord = (w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w);

const findMatchedCategory = (q, allCategories) => {
  const exactMatch = allCategories.find((cat) => q.includes(cat.name.toLowerCase()));
  if (exactMatch) return exactMatch;

  const qWordsNormalized = q.split(" ").map(normalizeWord);

  return allCategories.find((cat) => {
    const catNameLower = cat.name.toLowerCase();
    const isNegatedCategory = catNameLower.startsWith("non ");
    if (isNegatedCategory && !q.includes("non ")) return false;

    const catWords = catNameLower
      .split(" ")
      .filter((w) => w.length > 3 && !GENERIC_CATEGORY_WORDS.has(w));

    return catWords.some((word) => qWordsNormalized.includes(normalizeWord(word)));
  });
};

const COMMON_WORDS = new Set([
  "the", "and", "for", "you", "your", "with", "this", "that", "from", "have",
  "are", "our", "can", "will", "please", "these", "those", "about", "into",
  "also", "note", "well", "some", "any", "not", "but", "was", "were", "been",
  "them", "they", "their", "here", "there", "would", "could", "should",
]);

const significantWords = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !COMMON_WORDS.has(w));

const isAnswerGrounded = (answer, context) => {
  if (!context) return true;
  const contextWords = new Set(significantWords(context));
  const answerWords = significantWords(answer);
  if (answerWords.length === 0) return true;

  const overlapCount = answerWords.filter((w) => contextWords.has(w)).length;
  const overlapRatio = overlapCount / answerWords.length;

  return overlapRatio >= 0.3;
};

const buildSafeFallback = (shortContext) => {
  const realProductNames = [...new Set(
    [...shortContext.matchAll(/Product:\s*([^.]+)\./g)].map((m) => m[1].trim())
  )];

  if (realProductNames.length > 0) {
    return `We have these available: ${realProductNames.join(", ")}.`;
  }

  const trimmed = shortContext.split("\n\n")[0]?.substring(0, 300);
  return trimmed || "Sorry, we don't have a specific match for that right now.";
};

// ── Core RAG fallback — called whenever a fast-path can't find an exact match ──
const answerViaRAG = async (query, res) => {
  console.log("RAG section reached:", query);

  const { combinedContext } = await retrieveRelevantContext(query, 6);
  console.log("Context length:", combinedContext.length);

  const shortContext = combinedContext.substring(0, 900);

  let prompt;
  if (shortContext) {
    prompt = `<|system|>
You are a grocery store assistant. Below is REAL information from our store database.
RULES:
- ONLY use facts from the information below.
- Do NOT invent products, brands, steps, or details that are not written below.
- If the information doesn't answer the customer's question, say so honestly.
- If MULTIPLE relevant products are listed below, mention ALL of them by name, not just one.
- Keep your answer to 2-3 sentences.

STORE INFORMATION:
${shortContext}
<|user|>
${query}
<|assistant|>
Based on our store's information,`;
  } else {
    prompt = `<|system|>
You are a grocery store assistant. We don't have matching information in our database for this query. Politely say so in 1 sentence. Do not invent an answer.
<|user|>
${query}
<|assistant|>`;
  }

  console.log("Sending to phi3:mini...");
  const answer = await askTinyLlama(prompt);
  console.log("Answer received:", answer);

  if (shortContext && !isAnswerGrounded(answer, shortContext)) {
    console.log("⚠️ Hallucination guard triggered — answer not sufficiently grounded in real context");
    return res.json({ answer: buildSafeFallback(shortContext) });
  }

  if (/\[insert.*?\]/i.test(answer)) {
    console.log("⚠️ Hallucination guard triggered — unfilled placeholder detected");
    return res.json({ answer: buildSafeFallback(shortContext) });
  }

  return res.json({ answer });
};

const answerCustomerQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const q = query.toLowerCase().trim();

    // ── Greetings ──────────────────────────────────────
    const greetings = ["hi", "hii", "hello", "hey", "heyy", "hai", "helo"];
    if (greetings.includes(q)) {
      return res.json({
        answer:
          "Hi! 👋 Welcome to our store! Ask me about products, prices, stock, categories or anything!",
      });
    }

    // ── Farewells ──────────────────────────────────────
    const farewells = ["bye", "goodbye", "ok bye", "see you", "good bye", "tata"];
    if (farewells.includes(q)) {
      return res.json({ answer: "Goodbye! Have a great day! 😊🛒" });
    }

    // ── Thank You ──────────────────────────────────────
    const thanks = ["thank you", "thanks", "thank u", "thankyou", "thx"];
    if (thanks.includes(q)) {
      return res.json({
        answer: "You're welcome! 😊 Let me know if you need anything else.",
      });
    }

    // ── Tax Question → Direct MongoDB, falls through to RAG if not found ──
    if (q.includes("tax")) {
      const stopWords = ["what", "is", "the", "tax", "of", "for", "tell", "me", "how", "much"];
      const productName = extractProductName(q, stopWords);
      const product = await Product.findOne(
        { inStock: true, name: { $regex: productName, $options: "i" } },
        "name variants"
      ).lean();

      if (product) {
        const taxInfo = product.variants?.length
          ? product.variants.map((v) => `${v.quantity} ${v.unit}: ${v.tax}% tax`).join(", ")
          : "tax details not available";
        return res.json({ answer: `${product.name} has the following tax: ${taxInfo}.` });
      }
      // no exact match — fall through to RAG below instead of dead-ending
    }

    // ── Stock Question → Direct MongoDB, falls through to RAG if not found ──
    if (q.includes("stock") && !q.includes("in stock")) {
      const stopWords = ["what", "is", "the", "stock", "of", "for", "tell", "me", "how", "many"];
      const productName = extractProductName(q, stopWords);
      const product = await Product.findOne(
        { inStock: true, name: { $regex: productName, $options: "i" } },
        "name variants stock"
      ).lean();

      if (product) {
        const stockInfo = product.variants?.length
          ? product.variants.map((v) => `${v.quantity} ${v.unit}: ${v.stock} units available`).join(", ")
          : product.stock != null
          ? `${product.stock} units available`
          : "stock details not available";
        return res.json({ answer: `${product.name} stock details: ${stockInfo}.` });
      }
      // no exact match — fall through to RAG below
    }

    // ── Seller Question → Direct MongoDB, falls through to RAG if not found ──
    if ((q.includes("seller") || q.includes("sold by") || q.includes("vendor")) && !q.includes("become")) {
      const stopWords = ["who", "is", "the", "seller", "of", "for", "sold", "by", "vendor", "tell", "me"];
      const productName = extractProductName(q, stopWords);
      const product = await Product.findOne(
        { inStock: true, name: { $regex: productName, $options: "i" } },
        "name seller"
      )
        .populate("seller", "name")
        .lean();

      if (product) {
        return res.json({
          answer: `${product.name} is sold by ${product.seller?.name || "our verified vendor"}.`,
        });
      }
      // no exact match — fall through to RAG below
    }

    // ── Price Question → Direct MongoDB, falls through to RAG if not found ──
    if (q.includes("price") || q.includes("cost") || q.includes("how much")) {
      const stopWords = ["what", "is", "the", "price", "of", "cost", "how", "much", "does", "tell", "me"];
      const productName = extractProductName(q, stopWords);
      const product = await Product.findOne(
        { inStock: true, name: { $regex: productName, $options: "i" } },
        "name variants price offerPrice unit"
      ).lean();

      if (product) {
        const prices = product.variants?.length
          ? product.variants.map((v) => `${v.quantity} ${v.unit} for ₹${v.offerPrice}`).join(", ")
          : product.offerPrice != null
          ? `${product.unit || ""} for ₹${product.offerPrice}`
          : "price not available";
        return res.json({ answer: `${product.name} is available at ${prices}.` });
      }
      // no exact match — fall through to RAG below
    }

    // ── Availability → Direct MongoDB, falls through to RAG if not found ──
    if (q.includes("available") || q.includes("do you have") || q.includes("in stock")) {
      const stopWords = ["do", "you", "have", "is", "available", "in", "stock", "any", "what", "are"];
      const productName = extractProductName(q, stopWords);

      const Category = mongoose.connection.db.collection("categories");
      const allCategories = await Category.find({}).toArray();
      const matchedCategory = findMatchedCategory(q, allCategories);

      if (matchedCategory) {
        const products = await Product.find(
          { inStock: true, category: matchedCategory._id.toString() },
          "name variants price offerPrice unit"
        ).lean();

        if (products.length > 0) {
          const list = products.map(formatProductPriceUnit).join(", ");
          return res.json({ answer: `We have these ${matchedCategory.name} available: ${list}.` });
        }
      }

      const product = await Product.findOne(
        { inStock: true, name: { $regex: productName, $options: "i" } },
        "name variants price offerPrice unit"
      ).lean();

      if (product) {
        const prices = product.variants?.length
          ? product.variants.map((v) => `${v.quantity} ${v.unit} for ₹${v.offerPrice}`).join(", ")
          : product.offerPrice != null
          ? `${product.unit || ""} for ₹${product.offerPrice}`
          : "price not available";
        return res.json({ answer: `Yes! ${product.name} is available at ${prices}.` });
      }
      // no exact match — fall through to RAG below (this fixes "what meat product do you have")
    }

    // ── Category Questions → Dynamic DB, falls through to RAG if not found ──
    const CategoryCol = mongoose.connection.db.collection("categories");
    const allCats = await CategoryCol.find({}).toArray();
    const matchedCat = findMatchedCategory(q, allCats);

    if (matchedCat) {
      const products = await Product.find(
        { inStock: true, category: matchedCat._id.toString() },
        "name variants price offerPrice unit"
      ).lean();

      if (products.length > 0) {
        const list = products.map(formatProductPriceUnit).join(", ");
        return res.json({ answer: `We have these ${matchedCat.name} available: ${list}.` });
      }
      // category matched but has zero products — fall through to RAG below
    }

    // ── All Products ───────────────────────────────────
    if (q.includes("all products") || q.includes("what do you have") || q.includes("what do you sell")) {
      const products = await Product.find({ inStock: true }, "name").limit(20).lean();
      const names = products.map((p) => p.name).join(", ");
      return res.json({ answer: `We have: ${names}. Ask me about any product for details!` });
    }

    // ── RAG — final fallback for everything above that didn't find an exact match ──
    return await answerViaRAG(query, res);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export { answerCustomerQuery };