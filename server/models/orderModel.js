import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    products: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        quantity: Number,
        price: Number,
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Seller",
          required: false, 
          default: null,
        },
        sellerName: { type: String, default: "N/A" }, 
      },
    ],

    amount: { type: Number, required: true },
    paymentId: String,
    orderId: String,
    status: { type: String, default: "Pending" },

    deliveryAddress: {
      fullName: { type: String, default: "" },
      phone:    { type: String, default: "" },
      address:  { type: String, default: "" },
      landmark: { type: String, default: "" },
      city:     { type: String, default: "" },
      state:    { type: String, default: "" },
      pincode:  { type: String, default: "" },
    },

    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy",
      default: null,
    },

    deliveryStatus: {
      type: String,
      enum: ["Pending", "Picked Up", "Out for Delivery", "Delivered"],
      default: "Pending",
    },

    deliveryTimeSlot: {
      type: String,
      default: "",
    },

  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);