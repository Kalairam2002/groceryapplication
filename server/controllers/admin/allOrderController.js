import Order from '../../models/orderModel.js';
import User from '../../models/User.js';
import Seller from '../../models/Seller.js';
import sendEmail from '../../utils/sendEmail.js';
import deliveryConfirmationTemplate from '../../utils/deliveryConfirmationTemplate.js';
import Notification from '../../models/notification.model.js';

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("products.seller", "name")
      .populate("assignedDeliveryBoy", "name phone");
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Assign delivery boy
export const assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryBoyId } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { assignedDeliveryBoy: deliveryBoyId, deliveryStatus: "Pending" },
      { new: true }
    ).populate("assignedDeliveryBoy", "name phone");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Delivery boy assigned!", order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Update delivery status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    const validStatuses = ["Pending", "Picked Up", "Out for Delivery", "Delivered"];
    if (!validStatuses.includes(deliveryStatus)) {
      return res.status(400).json({ success: false, message: "Invalid delivery status" });
    }

    //  populate products.seller so we get seller ID correctly
    const order = await Order.findByIdAndUpdate(
      orderId,
      { deliveryStatus },
      { new: true }
    ).populate("products.seller", "name");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const notificationMessages = {
      "Picked Up":        `Order #${order.orderId || order._id} has been Picked Up by delivery boy.`,
      "Out for Delivery": `Order #${order.orderId || order._id} is Out for Delivery.`,
      "Delivered":        `Order #${order.orderId || order._id} has been Delivered successfully.`,
    };

    if (notificationMessages[deliveryStatus]) {

      // Admin notification
      await Notification.create({
        message:  notificationMessages[deliveryStatus],
        orderId:  order.orderId || order._id,
        status:   deliveryStatus,
        sellerId: null,
      });

      //  Seller notification — get unique seller IDs correctly
      const uniqueSellerIds = [
        ...new Set(
          order.products
            .map((p) => {
              // handle both populated object and plain ObjectId
              if (p.seller && typeof p.seller === "object" && p.seller._id) {
                return p.seller._id.toString();
              }
              if (p.seller) {
                return p.seller.toString();
              }
              return null;
            })
            .filter(Boolean)
        ),
      ];

      console.log("Seller IDs for notification:", uniqueSellerIds);

      for (const sellerId of uniqueSellerIds) {
        await Notification.create({
          message:  notificationMessages[deliveryStatus],
          orderId:  order.orderId || order._id,
          status:   deliveryStatus,
          sellerId: sellerId,
        });
        console.log(`Notification created for seller: ${sellerId}`); 
      }
    }

    // Send email to customer when delivered — untouched
    if (deliveryStatus === "Delivered") {
      try {
        const user = await User.findOne({ username: order.userId });
        if (user && user.email) {
          const emailHTML = deliveryConfirmationTemplate({
            userName:         user.username,
            orderId:          order.orderId || order._id,
            products:         order.products,
            total:            order.amount,
            deliveryAddress:  order.deliveryAddress,
            deliveryTimeSlot: order.deliveryTimeSlot || "",
          });

          await sendEmail(
            user.email,
            "maligaijaman - Your Order Has Been Delivered! ✅",
            emailHTML
          );
          console.log(`Delivery confirmation email sent to ${user.email}`);
        }
      } catch (emailErr) {
        console.error("Delivery email failed:", emailErr.message);
      }
    }

    res.status(200).json({ success: true, message: "Status updated!", order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Get admin notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ sellerId: null })
      .sort({ createdAt: -1 })
      .limit(20);
    const unreadCount = await Notification.countDocuments({ sellerId: null, isRead: false });
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Mark admin notifications as read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ sellerId: null, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Set delivery time slot + send email to customer
export const setDeliveryTimeSlot = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryTimeSlot } = req.body;

    if (!deliveryTimeSlot) {
      return res.status(400).json({ success: false, message: "Time slot is required" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { deliveryTimeSlot },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Send time slot email to customer
    try {
      const user = await User.findOne({ username: order.userId });
      if (user && user.email) {
        const emailHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; background: #1B5E20; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: #fff; margin: 0;">🕐 Delivery Time Slot Confirmed!</h2>
            </div>
            <div style="padding: 24px;">
              <p>Hello <b>${user.username}</b>,</p>
              <p>Your order is scheduled for delivery. Here are the details:</p>
              <div style="background: #e8f5e9; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #555;">Expected Delivery Time</p>
                <h2 style="margin: 8px 0; color: #1B5E20;">${deliveryTimeSlot}</h2>
              </div>
              <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0 0 6px; font-size: 13px;"><b>Order ID:</b> ${order.orderId || order._id}</p>
                <p style="margin: 0 0 6px; font-size: 13px;"><b>Amount:</b> ₹${order.amount}</p>
                <p style="margin: 0; font-size: 13px;">
                  <b>Deliver To:</b> ${order.deliveryAddress?.fullName},
                  ${order.deliveryAddress?.city},
                  ${order.deliveryAddress?.state}
                </p>
              </div>
              <p style="font-size: 13px; color: #555;">Please make sure someone is available at the delivery address during the time slot.</p>
              <p>Thank you for shopping with <b>maligaijaman</b> 🙏</p>
            </div>
            <div style="text-align: center; background: #f5f5f5; padding: 14px; border-radius: 0 0 8px 8px; font-size: 12px; color: #888;">
              © 2025 maligaijaman. All rights reserved.
            </div>
          </div>
        `;

        await sendEmail(
          user.email,
          "maligaijaman - Your Delivery Time Slot 🕐",
          emailHTML
        );
        console.log(`Time slot email sent to ${user.email}`);
      }
    } catch (emailErr) {
      console.error("Time slot email failed:", emailErr.message);
    }

    res.status(200).json({ success: true, message: "Time slot saved and email sent!", order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Get seller notifications
export const getSellerNotifications = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const notifications = await Notification.find({ sellerId })
      .sort({ createdAt: -1 })
      .limit(20);
    const unreadCount = await Notification.countDocuments({ sellerId, isRead: false });
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Mark seller notifications as read
export const markSellerNotificationsRead = async (req, res) => {
  try {
    const { sellerId } = req.params;
    await Notification.updateMany({ sellerId, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};