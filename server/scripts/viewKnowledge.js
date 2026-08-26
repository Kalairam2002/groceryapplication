import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Knowledge from "../models/Knowledge.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

await mongoose.connect(process.env.MONGODB_URI);
const entries = await Knowledge.find({}).lean();
entries.forEach((k) => console.log(k.topic, "→", k.content.substring(0, 80)));
process.exitCode = 0;