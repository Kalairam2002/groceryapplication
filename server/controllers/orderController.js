import Product from '../models/Product.js';
import Order from '../models/orderModel.js'
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Place Order COD : /api/order/cod 
export const placeOrderCOD = async (req,res) => {
    try{
        const { userId, items, address } = req.body;
        if( !address || items.length === 0){
            return res.json({succe: false, message: 'Invalid Data'});
        }

        let amount = await items.reduce(async (acc, item) =>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
            paid: false,
        });

        return res.json({success: true, message: 'order Placed Successfully'});
    }
    catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Get Order By ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('products.id', 'name image price');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.json({ success: true, order });
  } catch (error) {
    console.error('[getOrderById]', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Orders by user ID : /api/order/user 
export const getUserOrders = async (req, res) => {
    try{
        const { userId } = req.query; 
        const orders = await Order.find({
            userId,
            $or : [{paymentType : 'COD'}, {isPaid : true}]
        }).populate('items.product address').sort({createdAt: -1});
        res.json({success: true, orders});
    }
    catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Razorpay - api/order/razorpay 
export const placeOrderRazorPay = async(req,res) => {
    try{
        const  { userId, items, address } = req.body;

        if(!address || items.length === 0){
            return res.json({success: false, message: 'Invalid Data'});
        }

        let amount = await items.reduce(async (acc,item) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0);

        amount += Math.floor(amount * 0.02);

        const razorpayOrder = await razorpay.orders.create({
            amount : amount * 100,
            currency : 'INR',
            receipt : `receipt_${Date.now()}`
        });

        const order = await Order.create({
            userId,
            items,
            address,
            amount,
            razorpayOrderId : razorpayOrder.id,
            paymentType: 'ONLINE',
            paid: false,
        });

        res.json({
            success: true,
            order,
            razorpayOrder
        });
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// verifypayment - /api/order/verifyPayment
export const verifyPayment = async (req,res)=> {
    try{
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sha = crypto.createHmac = ('sha256', process.env.RAZORPAY_KEY_SECRET);
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = sha.digest('hex');

        if(digest !== razorpay_signature){
            return res.status(400).json({success: false, message : 'Payment verification failed' });
        }

        const order = await Order.findOneAndUpdate(
            {razorpayOrderId: razorpay_order_id},
            {
                paid: true,
                razorpayPaymentId: razorpay_payment_id
            },
            { new : true }
        );

        res.json({ success: true, order });
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success: false, message: error.message});
    }
}

// Get orders by user
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate("products.seller", "name email")
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        message: "No orders found for this user",
        orders: [],
      });
    }

    res.status(200).json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching user orders",
      error: error.message,
    });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all orders containing products of the logged-in seller
export const getOrdersBySeller = async (req, res) => {
  try {
    const sellerId = req.sellerId;

    console.log("Seller ID:", sellerId);

    const orders = await Order.find().sort({ createdAt: -1 });

    console.log("Total orders found:", orders.length);

    const sellerOrders = orders
      .map((order) => {
        const sellerProducts = order.products.filter((p) => {
          if (!p.seller) return false;

          const pSellerId =
            typeof p.seller === "object" && p.seller._id
              ? p.seller._id.toString()
              : p.seller.toString();

          return pSellerId === sellerId.toString();
        });

        if (sellerProducts.length === 0) return null;

        return {
          ...order.toObject(),
          products: sellerProducts,
        };
      })
      .filter(Boolean);

    console.log("Seller orders found:", sellerOrders.length);

    res.json({ success: true, orders: sellerOrders });
  } catch (err) {
    console.error("Error fetching orders for seller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get order tracking details — fixed
export const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log("Tracking orderId:", orderId); // ✅ debug

    let order;

    // ✅ Try finding by orderId string first (e.g. "order_1714823645321")
    order = await Order.findOne({ orderId: orderId })
      .populate("products.seller", "name")
      .populate("assignedDeliveryBoy", "name phone");

    // ✅ If not found try MongoDB _id
    if (!order && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId)
        .populate("products.seller", "name")
        .populate("assignedDeliveryBoy", "name phone");
    }

    // ✅ If still not found try Razorpay orderId
    if (!order) {
      order = await Order.findOne({ paymentId: orderId })
        .populate("products.seller", "name")
        .populate("assignedDeliveryBoy", "name phone");
    }

    console.log("Order found:", order ? "yes" : "no"); // ✅ debug

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ Build tracking steps
    const allSteps = ["Order Placed", "Picked Up", "Out for Delivery", "Delivered"];
    const statusMap = {
      "Pending":          1,
      "Picked Up":        2,
      "Out for Delivery": 3,
      "Delivered":        4,
    };

    const currentStep = statusMap[order.deliveryStatus] || 1;

    const trackingSteps = allSteps.map((step, index) => ({
      step,
      completed: index < currentStep,
      active:    index === currentStep - 1,
    }));

    res.status(200).json({
      success: true,
      tracking: {
        orderId:             order.orderId || order._id,
        status:              order.status,
        deliveryStatus:      order.deliveryStatus || "Pending",
        deliveryTimeSlot:    order.deliveryTimeSlot || "",
        amount:              order.amount,
        products:            order.products,
        deliveryAddress:     order.deliveryAddress,
        assignedDeliveryBoy: order.assignedDeliveryBoy,
        trackingSteps,
        createdAt:           order.createdAt,
        updatedAt:           order.updatedAt,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};