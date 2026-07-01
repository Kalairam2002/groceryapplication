import Return from "../models/Return.js";
import Order from "../models/orderModel.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

// export const submitReturn = async (req, res) => {
//   try {
//     console.log('[submitReturn] body:', req.body);
//     const { orderId, productId, reason, description } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

//     const orderTime = new Date(order.createdAt).getTime();
//     const hoursDiff = (Date.now() - orderTime) / (1000 * 60 * 60);
//     if (hoursDiff > 24) {
//       return res.status(400).json({ success: false, message: "Return window of 24 hours has expired" });
//     }

//     const item = order.products.find((i) => i.id.toString() === productId);
//     if (!item) return res.status(404).json({ success: false, message: "Product not found in order" });

//     const existing = await Return.findOne({ orderId, product: productId });
//     if (existing) {
//       return res.status(400).json({ success: false, message: "Return already submitted for this product" });
//     }

//     const newReturn = await Return.create({
//       orderId,
//       userId:      order.userId,
//       seller:      item.seller,
//       product:     productId,
//       productName: item.name,
//       reason,
//       description,
//       returnDeadline: new Date(orderTime + 24 * 60 * 60 * 1000),
//     });

//     return res.json({ success: true, message: "Return request submitted", return: newReturn });
//   } catch (error) {
//     console.error("submitReturn error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };




export const submitReturn = async (req, res) => {
  try {
    console.log('[submitReturn] body:', req.body);

    const { orderId, productId, reason, description, bankDetails } = req.body;

    // ✅ Bank details mandatory check
    if (
      !bankDetails ||
      !bankDetails.accountHolderName ||
      !bankDetails.accountNumber ||
      !bankDetails.ifscCode ||
      !bankDetails.bankName
    ) {
      return res.status(400).json({
        success: false,
        message: "Bank details are required (accountHolderName, accountNumber, ifscCode, bankName)",
      });
    }

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    const orderTime = new Date(order.createdAt).getTime();
    const hoursDiff = (Date.now() - orderTime) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      return res.status(400).json({
        success: false,
        message: "Return window of 24 hours has expired",
      });
    }

    const item = order.products.find((i) => i.id.toString() === productId);
    if (!item)
      return res.status(404).json({
        success: false,
        message: "Product not found in order",
      });

    const existing = await Return.findOne({ orderId, product: productId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Return already submitted for this product",
      });
    }

    const newReturn = await Return.create({
      orderId,
      userId:      order.userId,
      seller:      item.seller,
      product:     productId,
      productName: item.name,
      reason,
      description,
      returnDeadline: new Date(orderTime + 24 * 60 * 60 * 1000),

      // ✅ Bank details save
      bankDetails: {
        accountHolderName: bankDetails.accountHolderName.trim(),
        accountNumber:     bankDetails.accountNumber.trim(),
        ifscCode:          bankDetails.ifscCode.trim().toUpperCase(),
        bankName:          bankDetails.bankName.trim(),
      },
    });

    return res.json({
      success: true,
      message: "Return request submitted",
      return: newReturn,
    });
  } catch (error) {
    console.error("submitReturn error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getReturnsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const returns = await Return.find({ orderId }).populate("product", "name image");
    return res.json({ success: true, returns });
  } catch (error) {
    console.error("getReturnsByOrder error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSellerReturns = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const returns = await Return.find({ seller: sellerId })
      .populate("product", "name image")
      .populate("orderId", "razorpayOrderId amount createdAt")
      .sort({ createdAt: -1 });

    // Attach firstName to each return for display
    const returnsWithName = await Promise.all(
      returns.map(async (r) => {
        const user = await User.findOne({ username: r.userId }, "firstName");
        return { ...r.toObject(), userFirstName: user?.firstName || r.userId };
      })
    );

    return res.json({ success: true, returns: returnsWithName });
  } catch (error) {
    console.error("getSellerReturns error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateReturnStatus = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { returnId } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const returnDoc = await Return.findOne({ _id: returnId, seller: sellerId });
    if (!returnDoc) return res.status(404).json({ success: false, message: "Return not found" });

    returnDoc.status = status;
    await returnDoc.save();

    // ── Send email to user (non-blocking) ────────────────────────────────
    try {
      const user = await User.findOne({ username: returnDoc.userId });
      if (user) {
        const firstName = user.firstName || user.username;
        const productName = returnDoc.productName;

        const subject = status === "Approved"
          ? "Your return request has been approved!"
          : "Update on your return request";

        const html = status === "Approved"
          ? `
            <h2>Return Request Approved ✅</h2>
            <p>Hi <b>${firstName}</b>,</p>
            <p>Great news! Your return request for <b>${productName}</b> has been
            <b style="color:#16a34a;">approved</b> by the seller.</p>
            <p>The seller will contact you with further instructions regarding the return process.</p>
            <br/>
            <p>Thank you for shopping with <b>maligaijaman</b> 🙏</p>
          `
          : `
            <h2>Return Request Update</h2>
            <p>Hi <b>${firstName}</b>,</p>
            <p>We're sorry to inform you that your return request for <b>${productName}</b> has been
            <b style="color:#dc2626;">rejected</b> by the seller.</p>
            <p>If you have any questions, please contact our support team.</p>
            <br/>
            <p>Thank you for shopping with <b>maligaijaman</b> 🙏</p>
          `;

        await sendEmail(user.email, subject, html);
        console.log(`[returnStatus] Email sent to ${user.email} — ${status}`);
      }
    } catch (emailErr) {
      console.error("[returnStatus] Email failed (non-fatal):", emailErr.message);
    }

    return res.json({ success: true, message: `Return ${status}`, return: returnDoc });
  } catch (error) {
    console.error("updateReturnStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};