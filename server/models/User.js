import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {

    username: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, unique: true , sparse: true },
    otp: { type: String }, //otp verification
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Prevent model overwrite error in development
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
