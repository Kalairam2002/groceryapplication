import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
      subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory", 
        required: true,
      },
  },
  { timestamps: true }
);

const Variant = mongoose.model("Variant", VariantSchema);
export default Variant;
