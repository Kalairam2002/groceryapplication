import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

// ======================================================
// Register User with Email OTP
// ======================================================
export const registerUser = async (req, res) => {
  try {
    // 🔹 MODIFIED: added firstName, lastName
    const { firstName, lastName, username, email, password, phoneNumber } = req.body;

    

    const existingUser = await User.findOne({ email });
    const existingphonenumber = await User.findOne({ phoneNumber });

    if (existingphonenumber) {
      return res.status(400).json({ message: "User already exists with this phone number" });
    }

    if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ email });
    }

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // 🔹 MODIFIED: saving firstName & lastName
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      otp,
      otpExpires,
      isVerified: false,
    });

    await newUser.save();

    const html = `<p>Hello ${firstName},</p><p>Your OTP is: <strong>${otp}</strong></p>`;
    await sendEmail(email, "Verify your account - OTP", html);

    res.status(201).json({
      message: "OTP sent to your email. Please verify to complete registration.",
    });
  } catch (error) {
    console.error("Email OTP registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// Register User with Verified Mobile OTP (2Factor)
// ======================================================
export const registerUserWithMobileOtp = async (req, res) => {
  try {
    // 🔹 MODIFIED: added firstName, lastName
    const { firstName, lastName, phoneNumber, username } = req.body;

    if (!phoneNumber || !username) {
      return res.status(400).json({ message: "Phone number and username are required" });
    }

    const existingUser = await User.findOne({ phoneNumber });

    if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ _id: existingUser._id });
    }

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists with this phone number" });
    }

    // 🔹 MODIFIED: saving firstName & lastName
    const newUser = new User({
      firstName,
      lastName,
      username,
      phoneNumber,
      isVerified: true,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered via mobile OTP" });
  } catch (error) {
    console.error("Mobile OTP registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// Send OTP via 2Factor (SMS only)
// ======================================================
export const sendMobileOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const isphonenumber = await User.findOne({ phoneNumber });
    console.log("isphonenumber", isphonenumber);
    if (!isphonenumber) {
      return res.status(400).json({ message: "Phone number not registered. Please register first." });
    }

    const apiKey = process.env.TWO_FACTOR_API_KEY;
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/+91${phoneNumber}/AUTOGEN`;
    const response = await axios.get(url);

    if (response.data.Status === "Success") {
      return res.status(200).json({
        message: "OTP sent via SMS",
        sessionId: response.data.Details,
      });
    } else {
      return res.status(400).json({
        message: "Failed to send OTP",
        details: response.data.Details,
      });
    }
  } catch (error) {
    console.error("2Factor SMS OTP send error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ======================================================
// Verify Mobile OTP
// ======================================================
export const verifyMobileOtp = async (req, res) => {
  try {
    const { sessionId, otp, phoneNumber } = req.body;

    if (!sessionId || !otp || !phoneNumber) {
      return res.status(400).json({ message: "Session ID, OTP, and phone number are required" });
    }

    const apiKey = process.env.TWO_FACTOR_API_KEY;
    const response = await axios.get(
      `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`
    );

    if (response.data.Details === "OTP Matched") {
      const existingUser = await User.findOne({ phoneNumber });

      if (!existingUser) {
        return res.status(400).json({ message: "User not found. Please register first." });
      }

      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // 🔹 MODIFIED: return firstName & lastName
      res.json({
        message: "Login successful",
        token,
        user: {
          id: existingUser._id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          username: existingUser.username,
          email: existingUser.email,
          phoneNumber: existingUser.phoneNumber 
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid OTP", details: response.data.Details });
    }
  } catch (error) {
    console.error("2Factor OTP verification error:", error.response?.data || error.message);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ======================================================
// Verify Email OTP
// ======================================================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified. Registration complete." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ======================================================
// Login User
// ======================================================
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your account with OTP before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 🔹 MODIFIED: return firstName & lastName
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ======================================================
// Logout User
// ======================================================
export const logoutUser = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

// ======================================================
// Forgot Password
// ======================================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = `<p>Hello ${user.firstName},</p>
                  <p>Click below to reset your password:</p>
                  <a href="${resetLink}">${resetLink}</a>`;

    await sendEmail(user.email, "Password Reset", html);

    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// Reset Password
// ======================================================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful. Please log in with your new password." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
   
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    user.username = req.body.username || user.username;
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


