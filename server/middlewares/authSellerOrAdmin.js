import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";

// Accepts either a seller token or an admin token.
// - If the token belongs to a real Seller document, behaves exactly like
//   authSeller: sets req.sellerId / req.seller and proceeds.
// - Otherwise, treats it as an admin request: sets req.isAdmin = true and
//   req.adminId = decoded.id, and leaves it to the controller to read the
//   seller to attach the product to from the submitted form data
//   (productData.seller) instead of from the auth token.
const authSellerOrAdmin = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized: No Token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    const seller = await Seller.findById(decoded.id);

    if (seller) {
      req.sellerId = seller._id;
      req.seller = seller;
      req.isAdmin = false;
      return next();
    }

    // Not a seller token — treat as an admin token.
    req.isAdmin = true;
    req.adminId = decoded.id;
    next();
  } catch (error) {
    console.log("Auth Error:", error.message);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default authSellerOrAdmin;
