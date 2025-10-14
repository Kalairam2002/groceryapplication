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

        // Calculate Amount Using Items 
        let amount = await items.reduce(async (acc, item) =>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add Tax Charge 

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

        if(!address || items.length === 0)
        {
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

        // Update Order 

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


// get order by user
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate("products.seller", "name email") // optional seller details
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

// ✅ Get all orders containing products of the logged-in seller
export const getOrdersBySeller = async (req, res) => {
  try {
    const sellerId = req.sellerId; // from authSeller middleware

    // Find orders where at least one product belongs to this seller
    const orders = await Order.find({ "products.seller": sellerId })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching orders for seller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};