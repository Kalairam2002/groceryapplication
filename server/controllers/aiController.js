import axios from "axios";
import dotenv from "dotenv";
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
          temperature: 0.7,
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

const answerCustomerQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const q = query.toLowerCase().trim();

    // ── Short Greetings ────────────────────────────────
const greetings = ["hi", "hii", "hello", "hey", "heyy", "hai", "helo"];
if (greetings.includes(q)) {
  return res.json({
    answer: "Hi! 👋 How can I help you today? Ask me about products, prices, or recipes!"
  });
}

// ── Short Farewells ────────────────────────────────
const farewells = ["bye", "goodbye", "ok bye", "see you", "good bye", "tata"];
if (farewells.includes(q)) {
  return res.json({
    answer: "Goodbye! Have a great day! 😊🛒"
  });
}

// ── Short Thank you ────────────────────────────────
const thanks = ["thank you", "thanks", "thank u", "thankyou", "thx"];
if (thanks.includes(q)) {
  return res.json({
    answer: "You're welcome! 😊 Let me know if you need anything else."
  });
}

    // ── Price Question ─────────────────────────────────
    if (q.includes("price") || q.includes("cost") || q.includes("how much")) {
      const stopWords = ["what","is","the","price","of","cost","how","much","does","tell","me"];
      const productName = q.split(" ").filter((w) => !stopWords.includes(w) && w.length > 1).join(" ");

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
    }

    // ── Availability Question ──────────────────────────
    if (q.includes("available") || q.includes("do you have") || q.includes("in stock")) {
      const stopWords = ["do","you","have","is","available","in","stock","any"];
      const productName = q.split(" ").filter((w) => !stopWords.includes(w) && w.length > 1).join(" ");

      const product = await Product.findOne({
        inStock: true,
        name: { $regex: productName, $options: "i" }
      }, "name variants").lean();

      if (product) {
        const prices = product.variants
          .map((v) => `${v.quantity} ${v.unit} for ₹${v.offerPrice}`)
          .join(", ");
        return res.json({ answer: `Yes! ${product.name} is available at ${prices}.` });
      }
    }

    // ── Category Questions ─────────────────────────────
    const categoryMap = {
      "fruit": "Fruits",
      "vegetable": "Vegetables",
      "snack": "Snacks",
      "spice": "Spices",
      "masala": "Spices",
      "dairy": "Dairy",
      "beverage": "Beverages",
      "drink": "Beverages",
    };

    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (q.includes(keyword) && (q.includes("available") || q.includes("have") || q.includes("what") || q.includes("show") || q.includes("list"))) {
        const products = await Product.find(
          { inStock: true, category: { $regex: category, $options: "i" } },
          "name variants"
        ).limit(10).lean();

        if (products.length > 0) {
          const list = products
            .map((p) => `${p.name} (₹${p.variants[0]?.offerPrice}/${p.variants[0]?.unit})`)
            .join(", ");
          return res.json({ answer: `We have these ${category} available: ${list}.` });
        }
      }
    }

    // ── All Products Question ──────────────────────────
    if (q.includes("all products") || q.includes("what do you have") || q.includes("what do you sell")) {
      const products = await Product.find(
        { inStock: true },
        "name category"
      ).limit(20).lean();

      const categoryGroups = {};
      products.forEach((p) => {
        if (!categoryGroups[p.category]) categoryGroups[p.category] = [];
        categoryGroups[p.category].push(p.name);
      });

      const summary = Object.entries(categoryGroups)
        .map(([cat, names]) => `${cat}: ${names.slice(0, 3).join(", ")}`)
        .join(" | ");

      return res.json({ answer: `Here's what we sell — ${summary}. Ask me about any product for price and availability!` });
    }

    // ── Everything else → TinyLlama AI ────────────────
    const prompt = `<|system|>
You are a friendly and professional grocery store AI assistant for an online grocery store.
Your job is to help customers with:
- Product information and recommendations
- Cooking tips and recipes
- Grocery shopping advice
- General food questions
- Greetings and conversations

Always be helpful, friendly, and concise. Reply in 2-3 sentences maximum.
Never make up product prices — only mention prices if you know them.
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
