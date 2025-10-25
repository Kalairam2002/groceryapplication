import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: Array },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    inStock: { type: Boolean, default: true },
    unit: { type: String, required: true },
    stock: { type: Number, required: true },

    brand: { type: String, required: true },
    category: { type: String, required: true },

   
    subcategory: { type: String, required: true },

    barcode: { type: String, unique: true },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite (for dev hot reload)
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
