import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { embedAllProducts, embedAllKnowledge } from "../services/embeddingService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

const embedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected ✅");

    console.log("Embedding products...");
    await embedAllProducts();

    console.log("Embedding knowledge base...");
    await embedAllKnowledge();

    console.log("✅ All data embedded successfully!");
    process.exitCode = 0;
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

embedData();