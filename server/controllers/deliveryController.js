import DeliveryBoy from "../models/DeliveryModel.js";
import Order from "../models/orderModel.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto"; 

const generateToken = (id) => {
  return jwt.sign({ id, role: "deliveryboy" }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// REGISTER 
export const registerDeliveryBoy = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (await DeliveryBoy.findOne({ email })) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    if (await DeliveryBoy.findOne({ phone })) {
      return res.status(400).json({ success: false, message: "Phone number already registered" });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const deliveryBoy = await DeliveryBoy.create({
      name, email, phone, password,
      otp, otpExpires, isVerified: false,
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="background: #1B5E20; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: #fff; margin: 0;">🛵 Delivery Boy Registration</h2>
        </div>
        <div style="padding: 24px;">
          <p>Hello <b>${name}</b>,</p>
          <p>Your OTP for registration verification is:</p>
          <div style="background: #e8f5e9; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
            <h1 style="color: #1B5E20; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p style="color: #555; font-size: 13px;">This OTP is valid for <b>10 minutes</b>. Do not share it with anyone.</p>
          <p>Thank you for registering with <b>maligaijaman</b> 🙏</p>
        </div>
      </div>
    `;

    await sendEmail(email, "maligaijaman - Delivery Boy Registration OTP", html);

    res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
      data: { id: deliveryBoy._id, name: deliveryBoy.name, email: deliveryBoy.email, phone: deliveryBoy.phone }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// VERIFY OTP 
export const verifyDeliveryBoyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const deliveryBoy = await DeliveryBoy.findOne({ email });

    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: "Delivery boy not found" });
    }

    if (!deliveryBoy.otp || deliveryBoy.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (deliveryBoy.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired. Please register again." });
    }

    deliveryBoy.isVerified = true;
    deliveryBoy.otp = undefined;
    deliveryBoy.otpExpires = undefined;
    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Wait for admin approval to login.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// LOGIN 
export const loginDeliveryBoy = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ success: false, message: "Email/Phone and password are required" });
    }

    const deliveryBoy = await DeliveryBoy.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
    });

    if (!deliveryBoy || !(await deliveryBoy.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!deliveryBoy.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email first" });
    }

    if (!deliveryBoy.isApproved) {
      return res.status(403).json({ success: false, message: "Account pending admin approval" });
    }

    if (!deliveryBoy.isActive) {
      return res.status(403).json({ success: false, message: "Account deactivated. Contact support." });
    }

    const token = generateToken(deliveryBoy._id);

    res.cookie("deliveryBoyToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: { id: deliveryBoy._id, name: deliveryBoy.name, email: deliveryBoy.email, phone: deliveryBoy.phone }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// LOGOUT 
export const logoutDeliveryBoy = async (req, res) => {
  try {
    res.cookie("deliveryBoyToken", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// GET PROFILE 
export const getDeliveryBoyProfile = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id).select("-password");
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: "Delivery boy not found" });
    }
    res.status(200).json({ success: true, data: deliveryBoy });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// GET ALL DELIVERY BOYS 
export const getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: deliveryBoys });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// APPROVE DELIVERY BOY 
export const approveDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id, { isApproved: true }, { new: true }
    ).select("-password");
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: "Delivery boy not found" });
    }
    res.status(200).json({ success: true, message: "Delivery boy approved!", data: deliveryBoy });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// REJECT DELIVERY BOY
export const rejectDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id, { isApproved: false, isActive: false }, { new: true }
    ).select("-password");
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: "Delivery boy not found" });
    }
    res.status(200).json({ success: true, message: "Delivery boy rejected!", data: deliveryBoy });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// GET MY ORDERS
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      assignedDeliveryBoy: req.deliveryBoy._id,
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

//  FORGOT PASSWORD 
export const forgotDeliveryBoyPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const deliveryBoy = await DeliveryBoy.findOne({ email });
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    deliveryBoy.resetPasswordToken   = resetToken;
    deliveryBoy.resetPasswordExpires = Date.now() + 3600000;
    await deliveryBoy.save();

    const resetLink = `${process.env.CLIENT_URL}/delivery/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="background: #1B5E20; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: #fff; margin: 0;">🔐 Password Reset Request</h2>
        </div>
        <div style="padding: 24px;">
          <p>Hello <b>${deliveryBoy.name}</b>,</p>
          <p>We received a request to reset your delivery boy account password.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="background: #1B5E20; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
              Reset My Password
            </a>
          </div>
          <p style="color: #555; font-size: 13px;">This link expires in <b>1 hour</b>. If you did not request this, please ignore this email.</p>
          <p>Thank you, <b>maligaijaman</b> 🙏</p>
        </div>
      </div>
    `;

    await sendEmail(email, "maligaijaman - Delivery Boy Password Reset", html);

    res.status(200).json({ success: true, message: "Password reset link sent to your email!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

//  RESET PASSWORD 
export const resetDeliveryBoyPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const deliveryBoy = await DeliveryBoy.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!deliveryBoy) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link" });
    }

    deliveryBoy.password             = newPassword;
    deliveryBoy.resetPasswordToken   = undefined;
    deliveryBoy.resetPasswordExpires = undefined;
    await deliveryBoy.save();

    res.status(200).json({ success: true, message: "Password reset successful! Please login with your new password." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};