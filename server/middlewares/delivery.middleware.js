import jwt from "jsonwebtoken";
import DeliveryBoy from "../models/DeliveryModel.js";

export const protectDeliveryBoy = async (req, res, next) => {
  try {
    let token = req.cookies.deliveryBoyToken;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.deliveryBoy = await DeliveryBoy.findById(decoded.id).select("-password");

    if (!req.deliveryBoy) {
      return res.status(401).json({ success: false, message: "Delivery agent not found" });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};