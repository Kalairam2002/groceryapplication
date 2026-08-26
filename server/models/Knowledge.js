import mongoose from "mongoose";

const knowledgeSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    keywords: [{ type: String }],
  },
  { timestamps: true }
);

const Knowledge = mongoose.models.Knowledge || 
  mongoose.model("Knowledge", knowledgeSchema);

export default Knowledge;