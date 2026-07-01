import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // the document will be removed after 5 minutes in the database
  }
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
