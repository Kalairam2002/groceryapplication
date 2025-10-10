import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";
import Otp from "../models/otp.model.js";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import dotenv from "dotenv";
dotenv.config();

// Register Seller : /api/seller/register
export const sellerRegister = async (req, res) => {
  try {
    const { name, email, password, phonenumber, gstnumber } = req.body;

    if (!name || !email || !password || !phonenumber || !gstnumber) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.json({
        success: false,
        message: "Seller Email  Already Registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await Seller.create({
      name,
      email,
      password: hashedPassword,
      phonenumber,
      gstnumber,
    });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      Seller: { email: seller.email, name: seller.name },
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: true, message: error.message });
  }
};

// Login Seller : /api/seller/login

export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and Password are must required",
      });
    }

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.json({ success: false, message: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password" });
    }
    const sellerStatus = seller.status;

    if (!sellerStatus) {
      return res.json({
        success: false,
        message: "Waiting for the Approval confirmation from the Admin side",
      });
    }
    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      Seller: { email: seller.email, name: seller.name },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Seller isAuth : /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId).select("-password");

    if (!seller) {
      return res.json({ success: false, message: "Seller Not Found" });
    }
    return res.json({ success: true, seller });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Logout Seller : /api/seller/logout

export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ GET all sellers - /api/seller/seller-list
export const getSellerDetails = async (req, res) => {
  try {
    // Fetch only required fields
    const sellers = await Seller.find({}, "name email status");

    res.status(200).json({
      success: true,
      data: sellers,
    });
  } catch (error) {
    console.error("Error fetching sellers:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ UPDATE seller status - /api/seller/update-status
export const updateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Seller status updated successfully",
      data: updatedSeller,
    });
  } catch (error) {
    console.error("Error updating status:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ New: Delete seller
export const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params; // ID comes from URL
    const deletedSeller = await Seller.findByIdAndDelete(id);

    if (!deletedSeller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    res.json({ success: true, message: "Seller deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send OTP : /api/seller/send-otp
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }
  const otp = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
  });
  try {
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });
    // Configure nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    let mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP for Email Verification",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP : /api/seller/verify-otp
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }
    try {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
        await Otp.deleteMany({ email }); // Delete the OTP after verification
        res.json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}