import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";

// Accepts either a seller session or an admin session.
// - Seller sessions live in the "sellerToken" cookie.
// - Admin sessions live in the "token" cookie.
// - The admin add-product form sends productData.seller (the seller to assign
//   the product to); the seller form never does. That decides which session
//   is used, so a leftover admin login can no longer hijack a seller request.
const authSellerOrAdmin = async (req, res, next) => {
  try {
    let adminForm = false;
    try {
      adminForm = !!JSON.parse(req.body?.productData || "{}").seller;
    } catch (e) {
      // productData missing or not JSON: treat as a seller request
    }

    const bearer = req.headers.authorization?.split(" ")[1];
    const sellerToken = req.cookies.sellerToken || bearer;
    const adminToken = req.cookies.token || bearer;

    // Seller request
    if (sellerToken && !adminForm) {
      const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
      const seller = decoded.id && (await Seller.findById(decoded.id));
      if (seller) {
        req.sellerId = seller._id;
        req.seller = seller;
        req.isAdmin = false;
        return next();
      }
    }

    // Admin request
    if (adminToken) {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
      if (decoded.id && !(await Seller.findById(decoded.id))) {
        req.isAdmin = true;
        req.adminId = decoded.id;
        return next();
      }
    }

    return res
      .status(401)
      .json({ success: false, message: "Not Authorized: No Token" });
  } catch (error) {
    console.log("Auth Error:", error.message);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default authSellerOrAdmin;