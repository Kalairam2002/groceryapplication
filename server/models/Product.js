import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  tax: { type: Number, default: 0 },       
  stock: { type: Number, default: 0 },
  expiryDate: { type: Date, default: null }, 
  sizeLabel: { type: String, default: "" },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: Array },
    image: { type: Array, required: true },
    inStock: { type: Boolean, default: true },

    //  Multiple variants stored here
    variants: [variantSchema],

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: { type: String, required: true },
    subcategory: { type: String },
    barcode: { type: String, unique: true },
    variantdata: { type: String, default: "" }, 
    // expiryDate: { type: Date, default: null }, 

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    returnable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;