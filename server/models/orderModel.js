import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    // Each product in the order
    products: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        quantity: Number,
        price: Number,

        // ✅ Store which seller sold this product
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Seller",
          required: true,
        },
      },
    ],

    amount: { type: Number, required: true },
    paymentId: String,
    orderId: String,
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
