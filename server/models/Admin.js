import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    name : {type: String, required: true},
    email : {type: String, required: true, unique: true},
    password: {type: String, required: true},
    otp: {type: String},
    otpExpires: {type: Date},
    isVerified: {type: Boolean, default: false}
})

const admin = mongoose.model.admin || mongoose.model('admin', adminSchema );

export default admin;