import mongoose from "mongoose";

const expiredVariantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    price: { type: Number },
    offerPrice: { type: Number },
    stock: { type: Number },
    expiryDate: { type: Date },
    deletedAt: { type: Date, default: Date.now }, 
  },
  { timestamps: true }
);

const ExpiredVariant =
  mongoose.models.ExpiredVariant ||
  mongoose.model("ExpiredVariant", expiredVariantSchema);

export default ExpiredVariant;