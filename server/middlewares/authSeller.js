import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";

const authSeller = async (req, res, next) => {
  try {
    // ✅ Get token from cookie or header (for flexibility)
    const token =
      req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized: No Token" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Optional: Verify that seller exists
    const seller = await Seller.findById(decoded.id);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // ✅ Attach seller info to request for later use
    req.sellerId = seller._id;
    req.seller = seller;

    next();
  } catch (error) {
    console.log("Auth Error:", error.message);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default authSeller;
