import React, { useEffect, useState } from "react";
import QuantityControl from "../helper/QuantityControl";

const CartSection = () => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    // Ensure each item has a unique id
    const cartWithId = storedCart.map(item => ({
      ...item,
      id: item.id || item._id || `${item.name}-${Math.random()}`,
    }));
    setCart(cartWithId);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Update quantity of a single product
  const handleQuantityChange = (id, newQty) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: newQty } : item
    ));
  };

  // Remove a single product
  const handleRemove = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = 10; // example
  const total = subtotal + tax;

  // Razorpay payment (unchanged)
  const loadRazorpayScript = () => {
    return new Promise(resolve => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    const res = await loadRazorpayScript();
    if (!res) return alert("Failed to load Razorpay SDK");

    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "Guest";

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "INR",
          products: cart,
          userId: username,  // ✅ now dynamic
        }),
      });

      const order = await response.json();
      if (!order || !order.id) return alert("Failed to create order");

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "MarketPro",
        description: "Purchase Order",
        order_id: order.id,
        handler: async function(response) {
          try {
            const verifyRes = await fetch(`${process.env.REACT_APP_API_URL}/api/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId: username,
                products: cart,
                amount: total,
              }),
            });
            const data = await verifyRes.json();
            if (data.success) {
              alert("✅ Order placed successfully!");
              setCart([]);
              localStorage.removeItem("cart");
            } else alert("❌ Payment verification failed!");
          } catch (err) {
            console.error(err);
            alert("Server error during verification");
          }
        },
        prefill: { name: "John Doe", email: "john@example.com", contact: "9999999999" },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
    }
  };

  return (
    <section className="cart py-80">
      <div className="container container-lg">
        <div className="row gy-4">
          {/* Cart Table */}
          <div className="col-xl-9 col-lg-8">
            <div className="cart-table border border-gray-100 rounded-8 px-40 py-48">
              <div className="overflow-x-auto scroll-sm scroll-sm-horizontal">
                <table className="table style-three">
                  <thead>
                    <tr>
                      <th>Delete</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-20">
                          Your cart is empty.
                        </td>
                      </tr>
                    ) : (
                      cart.map(item => (
                        <tr key={item.id}>
                          <td>
                            <button type="button" onClick={() => handleRemove(item.id)}>
                              Remove
                            </button>
                          </td>
                          <td className="d-flex align-items-center gap-12">
                            <img src={item.image} alt={item.name} style={{width: "50px", height: "50px", objectFit: "cover"}} />
                            <span>{item.name}</span>
                          </td>
                          <td>₹{item.price}</td>
                          <td>
                            <QuantityControl
                              value={item.quantity}
                              onQuantityChange={(q) => handleQuantityChange(item.id, q)}
                            />
                          </td>
                          <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cart Totals */}
          <div className="col-xl-3 col-lg-4">
            <div className="cart-sidebar border border-gray-100 rounded-8 px-24 py-40">
              <h6 className="text-xl mb-32">Cart Totals</h6>
              <div className="bg-color-three rounded-8 p-24">
                <div className="mb-32 flex-between gap-8">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="mb-32 flex-between gap-8">
                  <span>Estimated Delivery</span>
                  <span>Free</span>
                </div>
                <div className="mb-0 flex-between gap-8">
                  <span>Estimated Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-color-three rounded-8 p-24 mt-24">
                <div className="flex-between gap-8">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="btn btn-main mt-40 py-18 w-100 rounded-8"
              >
                Proceed to checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartSection;
