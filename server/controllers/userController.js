import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js"; 
// import sendMobileOtp from "../utils/sendMobileOtp.js";

// Register User with OTP
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
    });

    await newUser.save();

    const html = `<p>Hello ${username},</p><p>Your OTP is: <strong>${otp}</strong></p>`;
    await sendEmail(email, "Verify your account - OTP", html);

    res.status(201).json({ message: "OTP sent to your email. Please verify to complete registration." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
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

// Login User 
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email with OTP before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Logout 
export const logoutUser = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

// Send OTP to Mobile Number
// export const sendMobileOtpToUser = async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;

//     const user = await User.findOne({ phoneNumber });
//     if (!user) return res.status(404).json({ message: "User with this mobile number not found" });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

//     user.otp = otp;
//     user.otpExpires = otpExpires;
//     await user.save();

//     await sendMobileOtp(phoneNumber, otp);

//     res.status(200).json({ message: "OTP sent to your mobile number" });
//   } catch (error) {
//     console.error("Mobile OTP error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// Verify Mobile OTP
// export const verifyMobileOtp = async (req, res) => {
//   try {
//     const { phoneNumber, otp } = req.body;

//     const user = await User.findOne({ phoneNumber });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.otp !== otp || user.otpExpires < Date.now()) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     user.isVerified = true;
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     await user.save();

//     res.status(200).json({ message: "Mobile OTP verified successfully" });
//   } catch (error) {
//     console.error("OTP verification error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
