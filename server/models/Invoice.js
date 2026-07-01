import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    userId: { type: String },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
        subtotal: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentType: { type: String, enum: ["COD", "ONLINE"], required: true },
    razorpayPaymentId: { type: String },
    status: { type: String, default: "Generated" },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);