import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
dotenv.config();

const LLAMA_URL = process.env.TINYLLAMA_API_URL;

const askTinyLlama = async (prompt) => {
  try {
    const response = await axios.post(
      `${LLAMA_URL}/api/generate`,
      {
        model: "tinyllama",
        prompt: prompt,
        stream: false,
        options: {
            num_predict: 512,
            temperature: 0.1,
            stop: ["<|user|>", "<|system|>"]
          }
      },
      { timeout: 60000 }
    );
    return response.data.response.trim();
  } catch (error) {
    console.error("TinyLlama error:", error.message);
    return "I'm having trouble connecting right now. Please try again shortly!";
  }
};

// ── Extract Product Name ───────────────────────────────
const extractProductName = (query, stopWords) => {
  return query
    .toLowerCase()
    .split(" ")
    .filter((w) => !stopWords.includes(w) && w.length > 1)
    .join(" ");
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
        answer: "Hi! 👋 How can I help you today? Ask me about products, prices, tax, stock or anything!"
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
      return res.json({ answer: "You're welcome! 😊 Let me know if you need anything else." });
    }

    // ── Tax Question ───────────────────────────────────
    if (q.includes("tax")) {
      const stopWords = ["what", "is", "the", "tax", "of", "for", "tell", "me", "how", "much"];
      const productName = extractProductName(q, stopWords);

      const product = await Product.findOne({
        inStock: true,
        name: { $regex: productName, $options: "i" }
      }, "name variants").lean();

      if (product) {
        const taxInfo = product.variants
          .map((v) => `${v.quantity} ${v.unit}: ${v.tax}% tax`)
          .join(", ");
        return res.json({ answer: `${product.name} has the following tax: ${taxInfo}.` });
      }
      return res.json({ answer: "Sorry, I couldn't find that product. Please check the product name." });
    }

    // ── Stock Question ─────────────────────────────────
    if (q.includes("stock") && !q.includes("in stock")) {
      const stopWords = ["what", "is", "the", "stock", "of", "for", "tell", "me", "how", "many"];
      const productName = extractProductName(q, stopWords);

      const product = await Product.findOne({
        inStock: true,
        name: { $regex: productName, $options: "i" }
      }, "name variants").lean();

      if (product) {
        const stockInfo = product.variants
          .map((v) => `${v.quantity} ${v.unit}: ${v.stock} units available`)
          .join(", ");
        return res.json({ answer: `${product.name} stock details: ${stockInfo}.` });
      }
      return res.json({ answer: "Sorry, I couldn't find that product. Please check the product name." });
    }

    // ── Seller Question ────────────────────────────────
    if (q.includes("seller") || q.includes("sold by") || q.includes("vendor")) {
      const stopWords = ["who", "is", "the", "seller", "of", "for", "sold", "by", "vendor", "tell", "me"];
      const productName = extractProductName(q, stopWords);

      const product = await Product.findOne({
        inStock: true,
        name: { $regex: productName, $options: "i" }
      }, "name seller").populate("seller", "name").lean();

      if (product) {
        return res.json({ answer: `${product.name} is sold by ${product.seller?.name || "our verified vendor"}.` });
      }
      return res.json({ answer: "Sorry, I couldn't find that product. Please check the product name." });
    }

    // ── Price Question ─────────────────────────────────
    if (q.includes("price") || q.includes("cost") || q.includes("how much")) {
      const stopWords = ["what", "is", "the", "price", "of", "cost", "how", "much", "does", "tell", "me"];
      const productName = extractProductName(q, stopWords);

      const product = await Product.findOne({
        inStock: true,
        name: { $regex: productName, $options: "i" }
      }, "name variants").lean();

      if (product) {
        const prices = product.variants
          .map((v) => `${v.quantity} ${v.unit} for ₹${v.offerPrice}`)
          .join(", ");
        return res.json({ answer: `${product.name} is available at ${prices}.` });
      }
      return res.json({ answer: "Sorry, that product was not found. Please check the product name." });
    }

    // ── Availability Question ──────────────────────────
    if (q.includes("available") || q.includes("do you have") || q.includes("in stock")) {
      const stopWords = ["do", "you", "have", "is", "available", "in", "stock", "any", "what", "are"];
      const productName = extractProductName(q, stopWords);

      // Check if it's a category question first
      const Category = mongoose.connection.db.collection("categories");
      const allCategories = await Category.find({}).toArray();
      const matchedCategory = allCategories.find((cat) =>
        q.includes(cat.name.toLowerCase()) ||
        cat.name.toLowerCase().split(" ").some(word =>
          word.length > 3 && q.includes(word.toLowerCase())
        )
      );

      if (matchedCategory) {
        const products = await Product.find({
          inStock: true,
          category: matchedCategory._id.toString()
        }, "name variants").lean();

        if (products.length > 0) {
          const list = products
            .map((p) => `${p.name} (₹${p.variants[0]?.offerPrice}/${p.variants[0]?.unit})`)
            .join(", ");
          return res.json({
            answer: `We have these ${matchedCategory.name} available: ${list}.`
          });
        }
        return res.json({
          answer: `Sorry, no ${matchedCategory.name} products available right now.`
        });
      }

      // Search by exact product name
      const product = await Product.findOne({
        inStock: true,
        name: { $regex: `^${productName}$`, $options: "i" }
      }, "name variants").lean();

      if (product) {
        const prices = product.variants
          .map((v) => `${v.quantity} ${v.unit} for ₹${v.offerPrice}`)
          .join(", ");
        return res.json({ answer: `Yes! ${product.name} is available at ${prices}.` });
      }

      // Search by partial name
      const productPartial = await Product.findOne({
        inStock: true,
        name: { $regex: productName, $options: "i" }
      }, "name variants").lean();

      if (productPartial) {
        const prices = productPartial.variants
          .map((v) => `${v.quantity} ${v.unit} for ₹${v.offerPrice}`)
          .join(", ");
        return res.json({ answer: `Yes! ${productPartial.name} is available at ${prices}.` });
      }

      return res.json({ answer: "Sorry, that product is not available right now." });
    }

    // ── Category Questions → 100% Dynamic from DB ─────
    const Category = mongoose.connection.db.collection("categories");
    const allCategories = await Category.find({}).toArray();

    const matchedCategory = allCategories.find((cat) =>
      q.includes(cat.name.toLowerCase()) ||
      cat.name.toLowerCase().split(" ").some(word =>
        word.length > 3 && q.includes(word.toLowerCase())
      )
    );

    if (matchedCategory) {
      const products = await Product.find({
        inStock: true,
        category: matchedCategory._id.toString()
      }, "name variants").lean();

      if (products.length > 0) {
        const list = products
          .map((p) => `${p.name} (₹${p.variants[0]?.offerPrice}/${p.variants[0]?.unit})`)
          .join(", ");
        return res.json({
          answer: `We have these ${matchedCategory.name} available: ${list}.`
        });
      }
      return res.json({
        answer: `Sorry, no ${matchedCategory.name} products available right now.`
      });
    }

    // ── All Products Question ──────────────────────────
    if (q.includes("all products") || q.includes("what do you have") || q.includes("what do you sell")) {
      const products = await Product.find(
        { inStock: true },
        "name"
      ).limit(20).lean();

      const names = products.map((p) => p.name).join(", ");
      return res.json({
        answer: `We have these products available: ${names}. Ask me about any product for price and details!`
      });
    }

    // ── Tell Me About / Description Questions ──────────
    if (q.includes("tell me about") || q.includes("what is") || q.includes("about") || q.includes("describe")) {
      const stopWords = ["tell", "me", "about", "what", "is", "describe", "the", "a", "an"];
      const productName = extractProductName(q, stopWords);

      const product = await Product.findOne({
        inStock: true,
        name: { $regex: productName, $options: "i" }
      }, "name description variants").lean();

      if (product && product.description && product.description.length > 0) {
        const desc = Array.isArray(product.description)
          ? product.description.join(". ")
          : product.description;
        const price = product.variants?.[0]
          ? `Price starts from ₹${product.variants[0].offerPrice}/${product.variants[0].unit}.`
          : "";
        return res.json({ answer: `${product.name}: ${desc}. ${price}` });
      }
    }

    // ── General Questions → TinyLlama with LOCAL DB only
    const products = await Product.find(
      { inStock: true },
      "name description"
    ).limit(30).lean();

    const productData = products.map((p) => {
      const desc = Array.isArray(p.description)
        ? p.description.join(". ")
        : p.description || "";
      return `${p.name}: ${desc}`;
    }).join("\n");

    const prompt = `<|system|>
You are a grocery store assistant.
ONLY answer based on this store data below.
Do NOT use outside knowledge.
If not found in store data say "Sorry, I don't have that information."

STORE DATA:
${productData}

Answer in 2 sentences only.
<|user|>
${query}
<|assistant|>`;

    const answer = await askTinyLlama(prompt);
    res.json({ answer });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export { answerCustomerQuery };
