import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const deliveryBoySchema = new mongoose.Schema({
  name:                 { type: String, required: true, trim: true },
  email:                { type: String, required: true, unique: true, lowercase: true },
  phone:                { type: String, required: true, unique: true },
  password:             { type: String, required: true, minlength: 6 },
  isApproved:           { type: Boolean, default: false },
  isActive:             { type: Boolean, default: true },
  otp:                  { type: String },
  otpExpires:           { type: Date },
  isVerified:           { type: Boolean, default: false },
  resetPasswordToken:   { type: String },   
  resetPasswordExpires: { type: Date },     
}, { timestamps: true });

deliveryBoySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

deliveryBoySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const DeliveryBoy = mongoose.models.DeliveryBoy || mongoose.model("DeliveryBoy", deliveryBoySchema);

export default DeliveryBoy;