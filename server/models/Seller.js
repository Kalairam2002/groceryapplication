import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phonenumber: { type: Number, required: true },
    gstnumber: { type: String, required: true },
    status: { type: Boolean, default: false }, // ✅ keep only one, Boolean
  },
  { timestamps: true }
);

// ✅ Correct model export
const Seller = mongoose.models.Seller || mongoose.model("Seller", sellerSchema);

export default Seller;
