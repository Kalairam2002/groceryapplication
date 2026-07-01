import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [assigning, setAssigning] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/api/admin/getOrderList`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch approved delivery boys
  const fetchDeliveryBoys = async () => {
    try {
      const { data } = await axios.get(`${API}/api/delivery/all`);
      if (data.success) {
        setDeliveryBoys(data.data.filter((d) => d.isApproved && d.isActive));
      }
    } catch (err) {
      console.error("Failed to fetch delivery boys", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryBoys();
  }, []);

  // ✅ Assign delivery boy
  const handleAssign = async (orderId, deliveryBoyId) => {
    if (!deliveryBoyId) return;
    setAssigning(orderId);
    try {
      await axios.put(`${API}/api/admin/assignDeliveryBoy/${orderId}`, { deliveryBoyId });
      fetchOrders();
    } catch (err) {
      console.error("Assign failed", err);
    } finally {
      setAssigning(null);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = Array.isArray(orders)
    ? orders.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AdminLayout page="Admin-Order">
      <section className="orders py-5">
        <div className="container">
          <h3 className="mb-4">All Orders</h3>

          {loading ? (
            <p>Loading orders...</p>
          ) : currentOrders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <>
              <table className="classic-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Products</th>
                    <th>Seller</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment ID</th>
                    <th>Delivery Address</th>
                    <th>Assign Delivery Boy</th> {/* ✅ new */}
                    <th>Delivery Status</th>     {/* ✅ new */}
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, idx) => (
                    <tr key={order._id}>
                      <td>{indexOfFirstItem + idx + 1}</td>
                      <td>{order.userId}</td>
                      <td>
                        <ul style={{ margin: 0, paddingLeft: "18px" }}>
                          {order.products.map((p, i) => (
                            <li key={i}>
                              {p.name} × {p.quantity} (₹{p.price})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        {order.products
                          .map((p) => p.seller?.name || "N/A")
                          .join(", ")}
                      </td>
                      <td>₹{order.amount}</td>
                      <td>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          color: "white",
                          backgroundColor:
                            order.status === "Pending" ? "#f0ad4e" :
                            order.status === "Completed" ? "#28a745" : "#dc3545",
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.paymentId || "N/A"}</td>

                      {/* Delivery Address */}
                      <td>
                        {order.deliveryAddress?.fullName ? (
                          <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
                            <b>{order.deliveryAddress.fullName}</b><br />
                            📞 {order.deliveryAddress.phone}<br />
                            🏠 {order.deliveryAddress.address}<br />
                            {order.deliveryAddress.landmark && (
                              <><i>Near: {order.deliveryAddress.landmark}</i><br /></>
                            )}
                            🏙️ {order.deliveryAddress.city}, {order.deliveryAddress.state}<br />
                            📮 {order.deliveryAddress.pincode}
                          </div>
                        ) : (
                          <span style={{ color: "#aaa", fontSize: "12px" }}>No address</span>
                        )}
                      </td>

                      {/* ✅ Assign Delivery Boy */}
                      <td>
                        {order.assignedDeliveryBoy ? (
                          <div style={{ fontSize: "12px" }}>
                            <b>✅ {order.assignedDeliveryBoy.name}</b><br />
                            📞 {order.assignedDeliveryBoy.phone}
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <select
                              defaultValue=""
                              onChange={(e) => handleAssign(order._id, e.target.value)}
                              disabled={assigning === order._id}
                              style={{
                                padding: "5px 8px",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              <option value="" disabled>Select</option>
                              {deliveryBoys.map((db) => (
                                <option key={db._id} value={db._id}>
                                  {db.name} - {db.phone}
                                </option>
                              ))}
                            </select>
                            {assigning === order._id && (
                              <span style={{ fontSize: "11px", color: "#888" }}>Assigning...</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* ✅ Delivery Status */}
                      <td>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "600",
                          backgroundColor:
                            order.deliveryStatus === "Delivered" ? "#d4edda" :
                            order.deliveryStatus === "Out for Delivery" ? "#cce5ff" :
                            order.deliveryStatus === "Picked Up" ? "#fff3cd" : "#f8f9fa",
                          color:
                            order.deliveryStatus === "Delivered" ? "#155724" :
                            order.deliveryStatus === "Out for Delivery" ? "#004085" :
                            order.deliveryStatus === "Picked Up" ? "#856404" : "#6c757d",
                        }}>
                          {order.deliveryStatus || "Pending"}
                        </span>
                      </td>

                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={currentPage === i + 1 ? "active" : ""}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default OrderList;