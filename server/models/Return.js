import mongoose from "mongoose";

const bankDetailsSchema = new mongoose.Schema(
  {
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // ✅ auto uppercase — "sbin0001234" → "SBIN0001234"
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false } // ✅ sub-document la separate _id வேண்டாம்
);

const returnSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
    },
    reason: {
      type: String,
      enum: [
        "Damaged product",
        "Wrong item received",
        "Quality not as expected",
        "Changed my mind",
      ],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    returnDeadline: {
      type: Date,
      required: true,
    },

    // ✅ Bank details — mandatory at return submit time
    bankDetails: {
      type: bankDetailsSchema,
      required: true,
    },
  },
  { timestamps: true }
);

const Return = mongoose.models.Return || mongoose.model("Return", returnSchema);
export default Return;