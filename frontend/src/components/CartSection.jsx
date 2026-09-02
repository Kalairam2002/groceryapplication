import React, { useEffect, useState } from "react";
import QuantityControl from "../helper/QuantityControl";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";


const CartSection = () => {
  const [cart, setCart] = useState([]);
   const [showModal, setShowModal] = useState(false);
   const [showQR, setShowQR] = useState(false);
  const [upiUrl, setUpiUrl] = useState("");
  const [orderResponse, setOrderResponse] = useState(null);


  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });


  // ================= LOAD CART =================
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartWithId = storedCart.map(item => ({
      ...item,
      id: item.id || item._id || `${item.name}-${Math.random()}`,
    }));
    setCart(cartWithId);
  }, []);

  // ================= SAVE CART ==================
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ================= QUANTITY UPDATE =================
  const handleQuantityChange = (id, newQty) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, cartQty: newQty } : item
    ));
  };

  // ================= REMOVE ITEM =================
  const handleRemove = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // ================= CALCULATIONS =================

  
//   const subtotal = cart.reduce(
//     (sum, item) => sum + item.variant.offerPrice * (item.quantity || 1),
//     0
//   );




// const estimatedTax = cart.reduce((sum, item) => {
//   const itemTotal = item.variant.offerPrice * (item.quantity || 1);
//   const itemTax = (itemTotal * (item.variant.tax || 0)) / 100;
//   return sum + itemTax;
// }, 0);


// ✅ Fix subtotal
const subtotal = cart.reduce(
  (sum, item) => sum + item.variant.offerPrice * (item.cartQty || 1),
  0
);

// ✅ Fix tax
const estimatedTax = cart.reduce((sum, item) => {
  const itemTotal = item.variant.offerPrice * (item.cartQty || 1);
  const itemTax = (itemTotal * (item.variant.tax || 0)) / 100;
  return sum + itemTax;
}, 0);

// ================= ADDRESS FORM HANDLER =================
  const handleAddressChange = (e) => {
    setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value });
  };

  const handleAddressSubmit = () => {
    const { fullName, phone, address, city, state, pincode } = deliveryAddress;
    if (!fullName || !phone || !address || !city || !state || !pincode) {
      alert("Please fill all required fields!");
      return;
    }
    // ✅ Save address to localStorage so payment handlers can use it
    localStorage.setItem("deliveryAddress", JSON.stringify(deliveryAddress));
    setShowAddressForm(false);
    setShowModal(true); // open payment modal
  };


// cashfree payment gateway logics

  const loadCashfreeScript = () => {
  return new Promise((resolve) => {
    if (window.cashfree) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};



const handlePay = async () => {
  const loaded = await loadCashfreeScript();
  if (!loaded) return alert("Cashfree SDK failed");

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const deliveryAddress = JSON.parse(localStorage.getItem("deliveryAddress")) || {};

  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/create-order`, {
      amount: Math.round(total),     // ✅ REAL TOTAL
      cart,                          // ✅ CART ITEMS
      user,                          // ✅ USER DATA
      deliveryAddress,                // ✅ DELIVERY ADDRESS
    });

    const sessionId = res.data.payment_session_id;
    const orderId = res.data.order_id;   // store this

    localStorage.setItem("cf_order_id", orderId); // save for verification

    const cashfree = new window.Cashfree({ mode: "sandbox" });

    cashfree.checkout({
      paymentSessionId: sessionId
    });

  } catch (err) {
    console.error(err);
    alert("Payment initiation failed");
  }
};




  // Final total
  const total = subtotal + estimatedTax;

  // ================= RAZORPAY =================
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
    const deliveryAddress = JSON.parse(localStorage.getItem("deliveryAddress")) || {};

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/payment/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(total * 100),
            currency: "INR",
            products: cart,
            userId: username,
          }),
        }
      );

      const order = await response.json();
      if (!order?.id) return alert("Failed to create order");

      const options = {
        key: "rzp_test_S7F1gHSVZfjMAe",
        amount: order.amount,
        currency: order.currency,
        name: "MarketPro",
        description: "Purchase Order",
        order_id: order.id,
        method: {
          upi: true  
        },
          config: {
    display: {
      blocks: {
        upi: {
          name: "Pay using UPI",
          instruments: [
            {
              method: "upi"
            }
          ]
        }
      },
      sequence: ["block.upi"],
      preferences: {
        show_default_blocks: true
      }
    }
  },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(
              `${process.env.REACT_APP_API_URL}/api/payment/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: username,
                  products: cart,
                  amount: total,
                  deliveryAddress,
                }),
              }
            );

            const data = await verifyRes.json();
            if (data.success) {
              alert("✅ Order placed successfully!");
              setCart([]);
              localStorage.removeItem("cart");
              localStorage.removeItem("deliveryAddress");
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (err) {
            console.error(err);
            alert("Server error during verification");
          }
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
    }
  };


  // gpay
  const isMobile = /Android|iPhone/i.test(navigator.userAgent);

  const payNow = () => {
  
  const upiId = "kalairam432@okicici";
  const name = "maligaijaman";
  const amount = 1;

  const url = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    name
  )}&am=${amount}&cu=INR`;
  setUpiUrl(url);

  if (isMobile) {
  window.location.href = url;
    } else {
  setShowQR(true);
  }
  

 
};

  console.log("Cart:", cart);



  const handleCheckout = () => {
  // ✅ Stock check before opening payment modal
  const outOfStockItems = cart.filter(
    (item) => item.variant.stock < (item.cartQty || 1)
  );

  if (outOfStockItems.length > 0) {
    const names = outOfStockItems.map(
      (item) => `❌ ${item.name} (Available: ${item.variant.stock})`
    ).join("\n");
    alert(`Out of Stock!\n\n${names}`);
    return; // ✅ stop — don't open modal
  }

  setShowModal(true); // ✅ all good → open payment modal
};
  


  // ================= UI =================
  return (
    <section className="cart py-80">
      <div className="container container-lg">
        <div className="row gy-4">

          {/* CART TABLE */}
          <div className="col-xl-9 col-lg-8">
            <div className="cart-table border rounded-8 px-40 py-48">
              
              <div className="overflow-x-auto">
                <table className="table style-three">
                  <thead>
                    <tr>
                      <th>Delete</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Tax</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-20">
                          Your cart is empty.
                        </td>
                      </tr>
                    ) : (
                      cart.map(item => (
                        <tr key={item.id}>
                          <td>
                            <button onClick={() => handleRemove(item.id)}>
                              Remove
                            </button>
                          </td>

                          <td className="d-flex align-items-center gap-12">
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: 50, height: 50 }}
                          />
                          <div>
                            <span>{item.name}</span>
                            <div style={{ fontSize: "12px", color: "#777" }}>
                              {item.variant.sizeLabel
                                ? item.variant.sizeLabel
                                : `${item.variant.quantity} ${item.variant.unit}`}
                            </div>
                          </div>
                        </td>

                          {/* <td>₹{item.variant.offerPrice
.toFixed(2)}</td> */}
<td>₹{(item.variant.offerPrice * (item.cartQty || 1)).toFixed(2)}</td>
                          <td>
                     <QuantityControl
  value={item.cartQty}
  onQuantityChange={(q) => handleQuantityChange(item.id, q)}
/>
                          </td>

                          {/* <td>
                            {item.variant.tax}% <br />
                            <small>
                              ₹{(
                                (item.variant.offerPrice * (item.quantity || 1) * item.variant.tax) /
                                100
                              ).toFixed(2)}
                            </small>
                          </td> */}
                          <td>
  {item.variant.tax}% <br />
  <small>
    ₹{(
      (item.variant.offerPrice * (item.cartQty || 1) * item.variant.tax) / 100
    ).toFixed(2)}
  </small>
</td>

                          <td>
                            ₹{(item.variant.offerPrice * (item.cartQty || 1)).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TOTALS */}
          <div className="col-xl-3 col-lg-4">
            <div className="cart-sidebar border rounded-8 px-24 py-40">
              <h6 className="text-xl mb-32">Cart Totals</h6>

              <div className="bg-color-three rounded-8 p-24">
                <div className="flex-between mb-16">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex-between mb-16">
                  <span>Estimated Tax</span>
                  <span>₹{estimatedTax.toFixed(2)}</span>
                </div>

                <div className="flex-between fw-bold" >
                  <span  >Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* <button
                
                className="btn btn-main mt-40 w-100"
              >
                Proceed to Checkout
              </button> */}
{/* ✅ Proceed to Checkout → opens Address Form first */}
              <button
                onClick={() => setShowAddressForm(true)}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "40px",
                  background: "#0d6efd",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Proceed to Checkout
              </button>


      {/* ✅ ADDRESS FORM MODAL */}
              {showAddressForm && (
                <div style={{
                  position: "fixed", inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  display: "flex", justifyContent: "center",
                  alignItems: "center", zIndex: 9999,
                }}>
                  <div style={{
                    background: "#fff", width: "420px",
                    padding: "30px", borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    maxHeight: "90vh", overflowY: "auto",
                  }}>
                    <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#1B5E20" }}>
                      🚚 Delivery Address
                    </h3>

                    {/* Full Name */}
                    <input
                      type="text" name="fullName"
                      placeholder="Full Name *"
                      value={deliveryAddress.fullName}
                      onChange={handleAddressChange}
                      style={inputStyle}
                    />

                    {/* Phone */}
                    <input
                      type="tel" name="phone"
                      placeholder="Mobile Number *"
                      value={deliveryAddress.phone}
                      onChange={handleAddressChange}
                      style={inputStyle}
                    />

                    {/* Address */}
                    <textarea
                      name="address"
                      placeholder="House No, Street, Area *"
                      value={deliveryAddress.address}
                      onChange={handleAddressChange}
                      rows={3}
                      style={{ ...inputStyle, resize: "none" }}
                    />

                    {/* Landmark */}
                    <input
                      type="text" name="landmark"
                      placeholder="Landmark (Optional)"
                      value={deliveryAddress.landmark}
                      onChange={handleAddressChange}
                      style={inputStyle}
                    />

                    {/* City */}
                    <input
                      type="text" name="city"
                      placeholder="City *"
                      value={deliveryAddress.city}
                      onChange={handleAddressChange}
                      style={inputStyle}
                    />

                    {/* State */}
                    <input
                      type="text" name="state"
                      placeholder="State *"
                      value={deliveryAddress.state}
                      onChange={handleAddressChange}
                      style={inputStyle}
                    />

                    {/* Pincode */}
                    <input
                      type="text" name="pincode"
                      placeholder="Pincode *"
                      value={deliveryAddress.pincode}
                      onChange={handleAddressChange}
                      style={inputStyle}
                    />

                    {/* Continue Button */}
                    <button
                      onClick={handleAddressSubmit}
                      style={{
                        width: "100%", padding: "13px",
                        background: "#1B5E20", color: "#fff",
                        border: "none", borderRadius: "8px",
                        fontSize: "15px", fontWeight: "700",
                        cursor: "pointer", marginTop: "6px",
                      }}
                    >
                      Continue to Payment →
                    </button>

                    {/* Cancel */}
                    <button
                      onClick={() => setShowAddressForm(false)}
                      style={{
                        width: "100%", padding: "10px",
                        background: "#fff", border: "1px solid #ccc",
                        borderRadius: "8px", cursor: "pointer",
                        marginTop: "10px",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

      {/* Popup */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "320px",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              Select Payment Method
            </h3>

{/* Razorpay */}
<button
  onClick={handlePayment}
  style={{
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    background: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  }}
>
  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    💳 <b>Razorpay</b>
  </span>

  

  <span style={{ color: "#0d6efd", fontWeight: "600" }}>Pay</span>
</button>

{/* cash free payment */}
<button
  onClick={handlePay}
  style={{
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    background: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  }}
>
  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    💵 <b>Cash Free Payment</b>
  </span>

  

  <span style={{ color: "#0d6efd", fontWeight: "600" }}>Pay</span>
</button>

{/* GPay */}
<button
  onClick={payNow}
  style={{
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    background: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  }}
>
  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    📱 <b>Google Pay</b>
  </span>

  <span style={{ color: "#000", fontWeight: "600" }}>UPI</span>
</button>
{/* MODAL */}
      {showQR && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "14px",
              textAlign: "center",
              width: "280px",
              boxShadow: "0 10px 30px rgba(0,0,0,.2)",
            }}
          >
            <h3>Scan to Pay</h3>

           <QRCodeCanvas value={upiUrl} size={200} />


            <p style={{ marginTop: 10 }}>Open Google Pay & scan</p>

            <button
              onClick={() => setShowQR(false)}
              style={{
                marginTop: "15px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                background: "#0d6efd",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

            {/* Cancel */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                width: "100%",
                padding: "10px",
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
// ✅ Reusable styles
const inputStyle = {
  width: "100%", padding: "11px 14px",
  marginBottom: "12px", borderRadius: "8px",
  border: "1px solid #ddd", fontSize: "14px",
  boxSizing: "border-box", outline: "none",
};

const payBtnStyle = {
  width: "100%", padding: "14px",
  marginBottom: "15px", background: "#ffffff",
  border: "1px solid #e5e5e5", borderRadius: "10px",
  fontSize: "16px", cursor: "pointer",
  display: "flex", alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

export default CartSection;
