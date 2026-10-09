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

    // ✅ Return pickup — the delivery boy who collects the product from the
    // customer and brings it back to the seller. Kept separate from `status`
    // and `refundStatus`, because approval, pickup and refund are three
    // different real-world events that happen at different times.
    //
    // Flow:  Not Assigned -> Assigned (seller picks a delivery boy)
    //        -> Picked Up (delivery boy collected it from the customer)
    //        -> Delivered to Seller (delivery boy handed it back)
    //
    // NOTE: returns created before this change have none of these fields.
    // Treat a missing pickupStatus as "Not Assigned" wherever it is read.
    pickupStatus: {
      type: String,
      enum: ["Not Assigned", "Assigned", "Picked Up", "Delivered to Seller"],
      default: "Not Assigned",
    },
    pickupDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy", // ⚠️ change this if your delivery boy model is registered under a different name
      default: null,
    },
    pickupAssignedAt: {
      type: Date,
      default: null,
    },
    pickupPickedUpAt: {
      type: Date,
      default: null,
    },
    pickupDeliveredAt: {
      type: Date,
      default: null,
    },

    // ✅ Refund tracking — kept separate from `status` above, because
    // "return approved" and "money actually sent" are two different
    // real-world events that can happen days apart.
    refundStatus: {
      type: String,
      enum: ["Not Initiated", "Processing", "Completed", "Failed"],
      default: "Not Initiated",
    },
    refundAmount: {
      type: Number,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundTransactionRef: {
      type: String,
      default: "",
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      default: null,
    },
  },
  { timestamps: true }
);

const Return = mongoose.models.Return || mongoose.model("Return", returnSchema);
export default Return;