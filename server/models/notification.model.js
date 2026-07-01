import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  message:  { type: String, required: true },
  orderId:  { type: String, required: true },
  status:   { type: String, required: true },
  isRead:   { type: Boolean, default: false },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;