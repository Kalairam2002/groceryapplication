import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

const statusColors = {
  "Pending":          { bg: "#f8f9fa", color: "#6c757d" },
  "Picked Up":        { bg: "#fff3cd", color: "#856404" },
  "Out for Delivery": { bg: "#cce5ff", color: "#004085" },
  "Delivered":        { bg: "#d4edda", color: "#155724" },
};

const MyOrdersSection = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [tracking, setTracking] = useState({});
  const [trackingLoading, setTrackingLoading] = useState(null);

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const username = user?.username;
  const token = localStorage.getItem("token");

  // ✅ Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!username) return;
      try {
        const res = await axios.get(`${API}/api/order/user/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [username, token]);

  // ✅ Fetch tracking for a specific order
  const handleTrackOrder = async (orderId, mongoId) => {
    if (expandedOrder === mongoId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(mongoId);
    setTrackingLoading(mongoId);
    try {
      // try orderId string first, then MongoDB _id
      const trackId = orderId || mongoId;
      const res = await axios.get(`${API}/api/order/track/${trackId}`);
      if (res.data.success) {
        setTracking((prev) => ({ ...prev, [mongoId]: res.data.tracking }));
      }
    } catch (err) {
      console.error("Failed to fetch tracking:", err);
    } finally {
      setTrackingLoading(null);
    }
  };

  if (!user) {
    return (
      <section className="py-80 text-center">
        <h5>Please <a href="/account">login</a> to view your orders.</h5>
      </section>
    );
  }

  return (
    <section className="cart py-80">
      <div className="container container-lg">
        <h3 className="mb-4 fw-bold">📦 My Orders</h3>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-80">
            <div style={{ fontSize: "60px" }}>📭</div>
            <h5 className="mt-3">No orders found!</h5>
            <p className="text-gray-500">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate("/products")}
              style={{
                background: "linear-gradient(90deg,#3bb77e,#2eb872)",
                color: "#fff", border: "none",
                padding: "12px 30px", borderRadius: "25px",
                cursor: "pointer", fontWeight: "600", marginTop: "16px",
              }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((order) => (
              <div key={order._id} style={{
                background: "#fff", borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                overflow: "hidden",
              }}>

                {/* Order Header */}
                <div style={{
                  padding: "16px 20px",
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", flexWrap: "wrap", gap: "10px",
                  borderBottom: "1px solid #f0f0f0",
                }}>
                  <div>
                    <p style={{ fontSize: "13px", color: "#888", margin: "0 0 2px" }}>
                      Order ID
                    </p>
                    <p style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#333" }}>
                      {order.orderId || order._id}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "#888", margin: "0 0 2px" }}>Amount</p>
                    <p style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "#1B5E20" }}>
                      ₹{order.amount}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "#888", margin: "0 0 2px" }}>Status</p>
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px",
                      fontSize: "12px", fontWeight: "600",
                      background: order.status === "Paid" ? "#d4edda" : "#fff3cd",
                      color: order.status === "Paid" ? "#155724" : "#856404",
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "#888", margin: "0 0 2px" }}>Delivery</p>
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px",
                      fontSize: "12px", fontWeight: "600",
                      background: statusColors[order.deliveryStatus || "Pending"]?.bg,
                      color: statusColors[order.deliveryStatus || "Pending"]?.color,
                    }}>
                      {order.deliveryStatus || "Pending"}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "#888", margin: "0 0 2px" }}>Date</p>
                    <p style={{ fontSize: "13px", margin: 0, color: "#555" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Track Button */}
                  <button
                    onClick={() => handleTrackOrder(order.orderId, order._id)}
                    style={{
                      padding: "8px 18px", background: "#1B5E20",
                      color: "#fff", border: "none", borderRadius: "8px",
                      cursor: "pointer", fontWeight: "600", fontSize: "13px",
                    }}
                  >
                    {expandedOrder === order._id ? "Hide Tracking ▲" : "Track Order ▼"}
                  </button>
                </div>

                {/* Products */}
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
                  {order.products?.map((p, i) => (
                    <div key={i} style={{
                      display: "flex", gap: "10px",
                      alignItems: "center", marginBottom: "8px",
                    }}>
                      <span style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: "#e8f5e9", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "14px", flexShrink: 0,
                      }}>🛍️</span>
                      <span style={{ fontSize: "14px", color: "#333" }}>
                        {p.name} × {p.quantity}
                        <span style={{ color: "#1B5E20", fontWeight: "600", marginLeft: "8px" }}>
                          ₹{p.price}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* ✅ Tracking Timeline */}
                {expandedOrder === order._id && (
                  <div style={{ padding: "20px" }}>
                    {trackingLoading === order._id ? (
                      <p style={{ color: "#888", fontSize: "14px" }}>Loading tracking...</p>
                    ) : tracking[order._id] ? (
                      <>
                        {/* Time Slot */}
                        {tracking[order._id].deliveryTimeSlot && (
                          <div style={{
                            background: "#FFF8E1", padding: "10px 14px",
                            borderRadius: "8px", marginBottom: "16px",
                            display: "flex", alignItems: "center", gap: "8px",
                          }}>
                            <span>🕐</span>
                            <span style={{ fontSize: "13px", color: "#F57F17", fontWeight: "600" }}>
                              Expected Delivery: {tracking[order._id].deliveryTimeSlot}
                            </span>
                          </div>
                        )}

                        {/* Delivery Boy */}
                        {tracking[order._id].assignedDeliveryBoy && (
                          <div style={{
                            background: "#e8f5e9", padding: "10px 14px",
                            borderRadius: "8px", marginBottom: "16px",
                            display: "flex", alignItems: "center", gap: "8px",
                          }}>
                            <span>🛵</span>
                            <span style={{ fontSize: "13px", color: "#1B5E20", fontWeight: "600" }}>
                              Delivery Boy: {tracking[order._id].assignedDeliveryBoy.name} — 📞 {tracking[order._id].assignedDeliveryBoy.phone}
                            </span>
                          </div>
                        )}

                        {/* Timeline Steps */}
                        <div>
                          {tracking[order._id].trackingSteps.map((step, index) => {
                            const isLast = index === tracking[order._id].trackingSteps.length - 1;
                            return (
                              <div key={index} style={{ display: "flex", gap: "14px" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <div style={{
                                    width: "32px", height: "32px", borderRadius: "50%",
                                    background: step.completed ? "#1B5E20" : step.active ? "#1565C0" : "#f0f0f0",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, fontSize: "14px",
                                  }}>
                                    {step.completed ? (
                                      <span style={{ color: "#fff" }}>✓</span>
                                    ) : step.active ? (
                                      <span style={{ color: "#fff" }}>🔄</span>
                                    ) : (
                                      <span style={{ color: "#aaa" }}>○</span>
                                    )}
                                  </div>
                                  {!isLast && (
                                    <div style={{
                                      width: "2px", height: "36px",
                                      background: step.completed ? "#1B5E20" : "#f0f0f0",
                                    }} />
                                  )}
                                </div>
                                <div style={{ paddingTop: "4px", paddingBottom: isLast ? 0 : "8px" }}>
                                  <p style={{
                                    fontSize: "14px", fontWeight: "600", margin: "0 0 2px",
                                    color: step.completed ? "#1B5E20" : step.active ? "#1565C0" : "#aaa",
                                  }}>
                                    {step.step}
                                  </p>
                                  <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                                    {step.completed ? "✅ Completed" : step.active ? "🔄 In Progress" : "⏳ Pending"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Delivery Address */}
                        {tracking[order._id].deliveryAddress?.fullName && (
                          <div style={{
                            marginTop: "16px", padding: "12px 14px",
                            background: "#f8f9fa", borderRadius: "8px",
                          }}>
                            <p style={{ fontSize: "12px", color: "#888", margin: "0 0 6px", fontWeight: "600" }}>
                              📍 Delivering to
                            </p>
                            <p style={{ fontSize: "13px", color: "#333", margin: 0, lineHeight: "1.6" }}>
                              <b>{tracking[order._id].deliveryAddress.fullName}</b><br />
                              📞 {tracking[order._id].deliveryAddress.phone}<br />
                              🏠 {tracking[order._id].deliveryAddress.address}
                              {tracking[order._id].deliveryAddress.landmark && `, Near ${tracking[order._id].deliveryAddress.landmark}`}<br />
                              🏙️ {tracking[order._id].deliveryAddress.city}, {tracking[order._id].deliveryAddress.state} — {tracking[order._id].deliveryAddress.pincode}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p style={{ color: "#888", fontSize: "14px" }}>Unable to load tracking info.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyOrdersSection;