import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    tempmail: { type: String },
    password: { type: String, required: true },
    phonenumber: { type: String, required: true },
    gstnumber: { type: String, required: true },
    address: { type: String },
    status: { type: Boolean, default: false }, //  keep only one, Boolean
    otp: { type: String },
    isVerified: { type: Boolean, default: false },
    otpExpires: { type: Date },
    resetPasswordToken: { type:String },
    resetPasswordExpires: { type : Date }
  },
  { timestamps: true }
);

//  Correct model export
const Seller = mongoose.models.Seller || mongoose.model("Seller", sellerSchema);

export default Seller;
