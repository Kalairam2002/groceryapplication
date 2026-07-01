import React, { useEffect, useState } from "react";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const SellerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeSlots, setTimeSlots] = useState({});
  const [savingSlot, setSavingSlot] = useState(null);
  const ordersPerPage = 5;

  const timeSlotOptions = [
    "9AM - 11AM",
    "11AM - 1PM",
    "1PM - 3PM",
    "3PM - 5PM",
    "5PM - 7PM",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/api/order/seller/order`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        // pre-fill existing time slots
        const slots = {};
        data.orders.forEach((o) => {
          if (o.deliveryTimeSlot) slots[o._id] = o.deliveryTimeSlot;
        });
        setTimeSlots(slots);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  //  Save time slot
  const handleSaveTimeSlot = async (orderId) => {
    const slot = timeSlots[orderId];
    if (!slot) return alert("Please select a time slot!");
    setSavingSlot(orderId);
    try {
      await axios.put(`${API}/api/admin/setTimeSlot/${orderId}`, {
        deliveryTimeSlot: slot,
      });
      alert("✅ Time slot saved!");
      fetchOrders();
    } catch (err) {
      console.error("Failed to save time slot", err);
    } finally {
      setSavingSlot(null);
    }
  };

  // Pagination
  const indexOfLastOrder  = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders     = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages        = Math.ceil(orders.length / ordersPerPage);

  return (
    <SellerLayout page="Seller-Order">
      <section className="orders py-5">
        <div className="container">
          <h3 className="mb-4">All Orders (Seller)</h3>

          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <table className="classic-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Products</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Delivery Status</th>
                  <th>Payment ID</th>
                  <th>Time Slot</th> 
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <tr key={order._id} className={index % 2 === 0 ? "even" : "odd"}>
                    <td>{order.userId}</td>
                    <td>
                      <ul className="mb-0">
                        {order.products.map((p, idx) => (
                          <li key={idx}>
                            {p.name} × {p.quantity} (₹{p.price}) - Seller: {p.sellerName || "N/A"}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>₹{order.amount}</td>
                    <td>
                      <span className={`status-badge ${
                        order.status === "Pending" ? "pending" :
                        order.status === "Completed" ? "completed" : "cancelled"
                      }`}>
                        {order.status}
                      </span>
                    </td>

                    {/*  Delivery Status */}
                    <td>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background:
                          order.deliveryStatus === "Delivered"        ? "#d4edda" :
                          order.deliveryStatus === "Out for Delivery" ? "#cce5ff" :
                          order.deliveryStatus === "Picked Up"        ? "#fff3cd" : "#f8f9fa",
                        color:
                          order.deliveryStatus === "Delivered"        ? "#155724" :
                          order.deliveryStatus === "Out for Delivery" ? "#004085" :
                          order.deliveryStatus === "Picked Up"        ? "#856404" : "#6c757d",
                      }}>
                        {order.deliveryStatus || "Pending"}
                      </span>
                    </td>

                    <td>{order.paymentId || "N/A"}</td>

                    {/*  Time Slot */}
                    <td>
                      {order.deliveryTimeSlot ? (
                        <div>
                          <span style={{
                            background: "#e8f5e9",
                            color: "#1B5E20",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}>
                            ✅ {order.deliveryTimeSlot}
                          </span>
                          <br />
                          <button
                            onClick={() => setTimeSlots({ ...timeSlots, [order._id]: "" })}
                            style={{
                              marginTop: "6px",
                              fontSize: "11px",
                              color: "#0d6efd",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <select
                            value={timeSlots[order._id] || ""}
                            onChange={(e) =>
                              setTimeSlots({ ...timeSlots, [order._id]: e.target.value })
                            }
                            style={{
                              padding: "5px 8px",
                              borderRadius: "6px",
                              border: "1px solid #ddd",
                              fontSize: "12px",
                            }}
                          >
                            <option value="" disabled>Select slot</option>
                            {timeSlotOptions.map((slot) => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSaveTimeSlot(order._id)}
                            disabled={savingSlot === order._id}
                            style={{
                              padding: "5px 10px",
                              background: "#1B5E20",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            {savingSlot === order._id ? "Saving..." : "Save"}
                          </button>
                        </div>
                      )}
                    </td>

                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {orders.length > ordersPerPage && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={currentPage === idx + 1 ? "active" : ""}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </SellerLayout>
  );
};

export default SellerOrder;