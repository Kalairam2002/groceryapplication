import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import nodemailer from "nodemailer";
import crypto from "crypto";


// Register Seller with Email OTP
export const registerSeller = async (req, res) => {
  try {
    const { name, email, password, phonenumber, gstnumber, address } = req.body;

    if (!name || !email || !password || !phonenumber || !gstnumber || !address) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ success: false, message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      phonenumber,
      gstnumber,
      address,
      otp,
      otpExpires,
      isVerified: false,
    });

    await newSeller.save();

    const html = `<p>Hello ${name},</p><p>Your OTP for seller registration is: <strong>${otp}</strong></p>`;
    await sendEmail(email, "Seller Registration OTP", html);

    res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
    });

  } catch (error) {
    console.error("Seller registration error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify Seller OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(400).json({ success: false, message: "Seller not found" });
    }

    const enteredOtp = otp?.trim().toLowerCase();
    const storedOtp = seller.otp?.trim().toLowerCase();

    console.log("Entered OTP:", enteredOtp);
    console.log("Stored OTP:", storedOtp);
    console.log("OTP Expiry:", new Date(seller.otpExpires).toLocaleString());

    if (!storedOtp || storedOtp !== enteredOtp || seller.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    seller.isVerified = true;
    seller.otp = undefined;
    seller.otpExpires = undefined;
    await seller.save();

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "OTP verified. Registration complete. Waiting for admin approval.",
      token: token,
      seller: {
        email: seller.email,
        name: seller.name,
        sellerId: seller._id,
      },
    });

  } catch (error) {
    console.error("OTP verification error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Seller Login — Step 1: validate credentials, email a login OTP
// (no token is issued here anymore; that now happens in verifyLoginOtp below)
export const sellerLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const seller = await Seller.findOne({
      $or: [{ email: identifier }, { name: identifier }]
    });

    if (!seller) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (!seller.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your account with OTP before logging in." });
    }

    if (!seller.status) {
      return res.status(403).json({ success: false, message: "Your account is pending admin approval." });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Credentials check out — generate and email a numeric login OTP
    // instead of issuing the session token directly.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    seller.otp = otp;
    seller.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await seller.save();

    const html = `<p>Hello ${seller.name},</p><p>Your OTP to log in is: <strong>${otp}</strong></p><p>This code expires in 5 minutes.</p>`;
    await sendEmail(seller.email, "Your Login OTP", html);

    res.json({
      success: true,
      message: "OTP sent to your registered email. Please verify to complete login.",
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Seller Login — Step 2: verify the OTP and actually issue the session token.
// Mirrors verifyOtp above, but completes a login instead of a registration.
export const verifyLoginOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: "Identifier and OTP are required" });
    }

    const seller = await Seller.findOne({
      $or: [{ email: identifier }, { name: identifier }]
    });

    if (!seller) {
      return res.status(400).json({ success: false, message: "Seller not found" });
    }

    const enteredOtp = otp?.toString().trim();
    const storedOtp = seller.otp?.toString().trim();

    if (!storedOtp || storedOtp !== enteredOtp || seller.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP is correct — clear it so it can't be reused, then log the seller in
    seller.otp = undefined;
    seller.otpExpires = undefined;
    await seller.save();

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      seller: { email: seller.email, name: seller.name, sellerId: seller._id },
    });
  } catch (error) {
    console.error("Login OTP verification error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Send OTP for Seller
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    seller.otp = otp;
    seller.otpExpires = Date.now() + 5 * 60 * 1000;
    await seller.save();

    const html = `<p>Hello ${seller.name},</p><p>Your OTP for verification is: <strong>${otp}</strong></p>`;
    await sendEmail(email, "Your OTP for Seller Verification", html);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// Seller Logout
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Seller Auth Check
export const isSellerAuth = async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    console.error("Auth check error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get Seller List
export const getSellerDetails = async (req, res) => {
  try {
    const sellers = await Seller.find({}, "name email status");
    res.status(200).json({ success: true, data: sellers });
  } catch (error) {
    console.error("Error fetching sellers:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update Seller Status
export const updateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Seller ID is required" });
    }

    const updatedSeller = await Seller.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedSeller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    res.status(200).json({
      success: true,
      message: "Seller status updated successfully",
      data: updatedSeller,
    });
  } catch (error) {
    console.error("Status update error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete Seller
export const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSeller = await Seller.findByIdAndDelete(id);
    if (!deletedSeller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }
    res.json({ success: true, message: "Seller deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password for Seller
export const forgotSellerPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(400).json({ success: false, message: "Seller not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    seller.resetPasswordToken = resetToken;
    seller.resetPasswordExpires = Date.now() + 3600000;
    await seller.save();

    const resetLink = `${process.env.CLIENT_URL}/seller/reset-password/${resetToken}`;
    const html = `<p>Hello ${seller.name},</p>
                  <p>Click below to reset your password:</p>
                  <a href="${resetLink}">${resetLink}</a>
                  <p>This link expires in 1 hour.</p>`;

    await sendEmail(seller.email, "Seller Password Reset", html);

    res.json({
      success: true,
      message: "Password reset link sent to seller email.",
      token: resetToken
    });

  } catch (error) {
    console.error("Forgot seller password error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reset Password for Seller
export const resetSellerPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const seller = await Seller.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!seller) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    seller.password = await bcrypt.hash(newPassword, 10);
    seller.resetPasswordToken = undefined;
    seller.resetPasswordExpires = undefined;
    await seller.save();

    res.json({ success: true, message: "Seller password reset successful. Please log in with your new password." });
  } catch (error) {
    console.error("Reset seller password error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Seller Profile
export const updateSellerProfile = async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const { name, phonenumber, gstnumber, address } = req.body;

    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

    seller.name = name || seller.name;
    seller.phonenumber = phonenumber || seller.phonenumber;
    seller.gstnumber = gstnumber || seller.gstnumber;
    seller.address = address || seller.address;

    await seller.save();
    res.json({ success: true, message: "Profile updated successfully", seller });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Request Email Change for Seller
export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const sellerId = req.sellerId;

    if (!newEmail) return res.status(400).json({ success: false, message: "New email required" });

    const existingSeller = await Seller.findOne({ email: newEmail });
    if (existingSeller) return res.status(400).json({ success: false, message: "Email already in use" });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 15 * 60 * 1000;

    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

    seller.resetPasswordToken = token;
    seller.resetPasswordExpires = expires;
    seller.tempEmail = newEmail;
    await seller.save();

    const verifyLink = `${process.env.CLIENT_URL}/seller/verify-email-change/${token}`;
    const html = `<p>Hello ${seller.name},</p><p>Click below to verify your new email:</p><a href="${verifyLink}">${verifyLink}</a>`;

    await sendEmail(newEmail, "Verify your new email", html);

    res.json({ success: true, message: "Verification link sent to new email" });
  } catch (error) {
    console.error("Request email change error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify Email Change for Seller
export const verifyEmailChange = async (req, res) => {
  try {
    const { token } = req.params;

    const seller = await Seller.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!seller) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    seller.email = seller.tempEmail;
    seller.tempEmail = undefined;
    seller.resetPasswordToken = undefined;
    seller.resetPasswordExpires = undefined;
    await seller.save();

    res.json({ success: true, message: "Email updated successfully" });
  } catch (error) {
    console.error("Verify email change error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
