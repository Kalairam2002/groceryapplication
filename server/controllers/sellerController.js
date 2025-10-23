import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";

// Register Seller with Email OTP
export const registerSeller = async (req, res) => {
  try {
    const { name, email, password, phonenumber, gstnumber } = req.body;

    if (!name || !email || !password || !phonenumber || !gstnumber) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ success: false, message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      phonenumber,
      gstnumber,
      otp,
      otpExpires,
      isVerified: false,
    });

    await newSeller.save();

    const html = `<p>Hello ${name},</p><p>Your OTP for seller registration is: <strong>${otp}</strong></p>`;
    await sendEmail(email, "Seller Registration OTP", html);

    // ✅ This response now includes success: true
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

    // ✅ Log for debugging
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
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

          res.status(200).json({
        success: true,
        message: "OTP verified. Registration complete. Waiting for admin approval.",
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


// Seller Login
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(400).json({ message: "Invalid credentials" });

    if (!seller.isVerified) {
      return res.status(403).json({ message: "Please verify your email with OTP before logging in." });
    }

    if (!seller.status) {
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
      seller: { email: seller.email, name: seller.name, sellerId: seller._id },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
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
