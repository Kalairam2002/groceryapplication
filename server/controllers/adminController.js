import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

// Register Admin with Email OTP
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.json({ success: false, message: "Admin Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
    });

    await newAdmin.save();

    const html = `<p>Hello ${name},</p><p>Your OTP for admin registration is: <strong>${otp}</strong></p>`;
    await sendEmail(email, "Admin Registration OTP", html);

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
    });
  } catch (error) {
    console.log("Admin registration error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify Admin OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ success: false, message: "Admin not found" });

    if (admin.otp !== otp || admin.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    admin.isVerified = true;
    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "OTP verified. Admin registration complete.",
      admin: { email: admin.email, name: admin.name },
    });
  } catch (error) {
    console.log("OTP verification error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login Admin
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.json({ success: false, message: "Invalid Email" });
    }

    if (!admin.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email with OTP before logging in." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      admin: { email: admin.email, name: admin.name, adminId: admin._id },
    });
  } catch (error) {
    console.log("Login error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Check Admin Auth
export const isAuth = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");

    if (!admin) {
      return res.json({ success: false, message: "Admin Not Found" });
    }

    return res.json({ success: true, admin });
  } catch (error) {
    console.log("Auth check error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

// Logout Admin
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.log("Logout Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
