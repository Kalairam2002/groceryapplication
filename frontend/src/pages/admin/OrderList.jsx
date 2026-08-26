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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = Array.isArray(orders)
    ? orders.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const statusBadge = (status) => {
    if (status === "Pending") return "badge-amber";
    if (status === "Completed") return "badge-green";
    return "badge-red";
  };

  const deliveryBadge = (status) => {
    if (status === "Delivered") return "badge-green";
    if (status === "Out for Delivery") return "badge-amber";
    if (status === "Picked Up") return "badge-orange";
    return "badge-gray";
  };

  return (
    <AdminLayout page="Admin-Order">
      <section style={{ padding: "0" }}>
        <div className="container">
          <div className="page-header">
            <div>
              <span className="eyebrow">Fulfilment / Orders</span>
              <h3>All orders</h3>
              <p className="subtitle">Track, assign, and follow every order through delivery</p>
            </div>
          </div>

          {loading ? (
            <p>Loading orders...</p>
          ) : currentOrders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="table-card">
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
                    <th>Delivery address</th>
                    <th>Assign delivery boy</th>
                    <th>Delivery status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, idx) => (
                    <tr key={order._id}>
                      <td className="mono-cell">{indexOfFirstItem + idx + 1}</td>
                      <td className="mono-cell truncate-cell" title={order.userId}>{order.userId}</td>
                      <td style={{ minWidth: "160px" }}>
                        <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12.5px" }}>
                          {order.products.map((p, i) => (
                            <li key={i}>
                              {p.name} × {p.quantity} <span className="muted-small">(₹{p.price})</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        {order.products.map((p) => p.seller?.name || "N/A").join(", ")}
                      </td>
                      <td className="price-cell">₹{order.amount}</td>
                      <td>
                        <span className={`badge ${statusBadge(order.status)}`}>{order.status}</span>
                      </td>
                      <td className="mono-cell truncate-cell" title={order.paymentId || ""}>{order.paymentId || "N/A"}</td>

                      <td style={{ minWidth: "150px", maxWidth: "180px" }}>
                        {order.deliveryAddress?.fullName ? (
                          <div className="detail-block">
                            <b>{order.deliveryAddress.fullName}</b><br />
                            {order.deliveryAddress.phone}<br />
                            {order.deliveryAddress.address}<br />
                            {order.deliveryAddress.landmark && (
                              <><i>Near: {order.deliveryAddress.landmark}</i><br /></>
                            )}
                            {order.deliveryAddress.city}, {order.deliveryAddress.state}<br />
                            {order.deliveryAddress.pincode}
                          </div>
                        ) : (
                          <span className="muted-small">No address</span>
                        )}
                      </td>

                      <td>
                        {order.assignedDeliveryBoy ? (
                          <div className="detail-block">
                            <b>{order.assignedDeliveryBoy.name}</b><br />
                            {order.assignedDeliveryBoy.phone}
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <select
                              defaultValue=""
                              onChange={(e) => handleAssign(order._id, e.target.value)}
                              disabled={assigning === order._id}
                              style={{
                                padding: "6px 8px",
                                borderRadius: "6px",
                                border: "1px solid #E3E8DD",
                                background: "#F5F7F1",
                                fontSize: "12px",
                                color: "#1C2620",
                                cursor: "pointer",
                                maxWidth: "130px",
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
                              <span className="muted-small">Assigning...</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className={`badge ${deliveryBadge(order.deliveryStatus)}`}>
                          {order.deliveryStatus || "Pending"}
                        </span>
                      </td>

                      <td className="mono-cell">{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default OrderList;