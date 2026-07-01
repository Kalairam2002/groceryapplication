import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assigned");
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const deliveryBoy = JSON.parse(localStorage.getItem("deliveryBoy"));
  const token = localStorage.getItem("deliveryToken");

  useEffect(() => {
    if (!token || !deliveryBoy) {
      navigate("/delivery/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all orders assigned to this delivery boy
      const { data } = await axios.get(`${API}/api/delivery/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const assigned = data.orders.filter((o) => o.deliveryStatus !== "Delivered");
        const history = data.orders.filter((o) => o.deliveryStatus === "Delivered");
        setAssignedOrders(assigned);
        setHistoryOrders(history);
      }

      // Fetch profile
      const profileRes = await axios.get(`${API}/api/delivery/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.data.success) setProfile(profileRes.data.data);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.put(
        `${API}/api/admin/updateDeliveryStatus/${orderId}`,
        { deliveryStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/api/delivery/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("deliveryToken");
      localStorage.removeItem("deliveryBoy");
      navigate("/delivery/login");
    }
  };

  const nextStatus = {
    "Pending": "Picked Up",
    "Picked Up": "Out for Delivery",
    "Out for Delivery": "Delivered",
  };

  const statusColor = {
    "Pending": { bg: "#f8f9fa", color: "#6c757d" },
    "Picked Up": { bg: "#fff3cd", color: "#856404" },
    "Out for Delivery": { bg: "#cce5ff", color: "#004085" },
    "Delivered": { bg: "#d4edda", color: "#155724" },
  };

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.avatar}>🛵</div>
          <h3 style={styles.sidebarName}>{deliveryBoy?.name || "Delivery Boy"}</h3>
          <p style={styles.sidebarPhone}>{deliveryBoy?.phone}</p>
        </div>

        <ul style={styles.navList}>
          {[
            { key: "assigned", label: "📦 Assigned Orders" },
            { key: "history",  label: "📋 Delivery History" },
            { key: "profile",  label: "👤 Profile" },
          ].map((item) => (
            <li
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                ...styles.navItem,
                ...(activeTab === item.key ? styles.navItemActive : {}),
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>

        {/* STATS BAR */}
        <div style={styles.statsBar}>
          <div style={styles.statCard}>
            <h4>{assignedOrders.length}</h4>
            <p>Active Deliveries</p>
          </div>
          <div style={styles.statCard}>
            <h4>{historyOrders.length}</h4>
            <p>Total Delivered</p>
          </div>
          <div style={styles.statCard}>
            <h4>{assignedOrders.length + historyOrders.length}</h4>
            <p>Total Assigned</p>
          </div>
        </div>

        {loading ? (
          <p style={{ padding: "20px", color: "#888" }}>Loading...</p>
        ) : (
          <>
            {/* ===== ASSIGNED ORDERS ===== */}
            {activeTab === "assigned" && (
              <div>
                <h3 style={styles.sectionTitle}>📦 Assigned Orders</h3>
                {assignedOrders.length === 0 ? (
                  <p style={styles.empty}>No active orders assigned yet.</p>
                ) : (
                  assignedOrders.map((order) => (
                    <div key={order._id} style={styles.orderCard}>
                      <div style={styles.orderHeader}>
                        <span style={styles.orderId}>Order: #{order.orderId || order._id.slice(-6)}</span>
                        <span style={{
                          ...styles.statusBadge,
                          background: statusColor[order.deliveryStatus]?.bg,
                          color: statusColor[order.deliveryStatus]?.color,
                        }}>
                          {order.deliveryStatus}
                        </span>
                      </div>

                      {/* Products */}
                      <div style={styles.section}>
                        <b>🛍️ Products:</b>
                        <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                          {order.products.map((p, i) => (
                            <li key={i} style={{ fontSize: "13px" }}>
                              {p.name} × {p.quantity} — ₹{p.price}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Delivery Address */}
                      <div style={styles.section}>
                        <b>📍 Delivery Address:</b>
                        <p style={styles.addressText}>
                          {order.deliveryAddress?.fullName}<br />
                          📞 {order.deliveryAddress?.phone}<br />
                          🏠 {order.deliveryAddress?.address}
                          {order.deliveryAddress?.landmark && `, Near ${order.deliveryAddress.landmark}`}<br />
                          🏙️ {order.deliveryAddress?.city}, {order.deliveryAddress?.state} — {order.deliveryAddress?.pincode}
                        </p>
                      </div>

                      {/* Amount */}
                      <div style={styles.section}>
                        <b>💰 Amount:</b> ₹{order.amount}
                      </div>

                      {/* Status Update Button */}
                      {nextStatus[order.deliveryStatus] && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, nextStatus[order.deliveryStatus])}
                          disabled={updatingId === order._id}
                          style={styles.updateBtn}
                        >
                          {updatingId === order._id
                            ? "Updating..."
                            : `Mark as "${nextStatus[order.deliveryStatus]}"`}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ===== DELIVERY HISTORY ===== */}
            {activeTab === "history" && (
              <div>
                <h3 style={styles.sectionTitle}>📋 Delivery History</h3>
                {historyOrders.length === 0 ? (
                  <p style={styles.empty}>No deliveries completed yet.</p>
                ) : (
                  historyOrders.map((order) => (
                    <div key={order._id} style={{ ...styles.orderCard, opacity: 0.85 }}>
                      <div style={styles.orderHeader}>
                        <span style={styles.orderId}>Order: #{order.orderId || order._id.slice(-6)}</span>
                        <span style={{ ...styles.statusBadge, background: "#d4edda", color: "#155724" }}>
                          ✅ Delivered
                        </span>
                      </div>
                      <div style={styles.section}>
                        <b>📍 Delivered to:</b>
                        <p style={styles.addressText}>
                          {order.deliveryAddress?.fullName} — 📞 {order.deliveryAddress?.phone}<br />
                          {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
                        </p>
                      </div>
                      <div style={styles.section}>
                        <b>💰 Amount:</b> ₹{order.amount}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
                        🕒 {new Date(order.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ===== PROFILE ===== */}
            {activeTab === "profile" && (
              <div>
                <h3 style={styles.sectionTitle}>👤 My Profile</h3>
                {profile ? (
                  <div style={styles.profileCard}>
                    <div style={styles.profileAvatar}>🛵</div>
                    <table style={styles.profileTable}>
                      <tbody>
                        {[
                          ["Name", profile.name],
                          ["Email", profile.email],
                          ["Phone", profile.phone],
                          ["Account Status", profile.isActive ? "✅ Active" : "❌ Inactive"],
                          ["Approval Status", profile.isApproved ? "✅ Approved" : "⏳ Pending"],
                          ["Member Since", new Date(profile.createdAt).toLocaleDateString()],
                        ].map(([label, value]) => (
                          <tr key={label}>
                            <td style={styles.profileLabel}>{label}</td>
                            <td style={styles.profileValue}>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={styles.empty}>Loading profile...</p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f5f6fa",
  },
  sidebar: {
    width: "240px",
    background: "#1B5E20",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    position: "fixed",
    top: 0, left: 0, bottom: 0,
  },
  sidebarHeader: {
    padding: "30px 20px 20px",
    textAlign: "center",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  },
  avatar: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  sidebarName: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 4px",
  },
  sidebarPhone: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "12px",
    margin: 0,
  },
  navList: {
    listStyle: "none",
    padding: "16px 0",
    margin: 0,
    flex: 1,
  },
  navItem: {
    padding: "12px 24px",
    color: "rgba(255,255,255,0.8)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  navItemActive: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    borderLeft: "3px solid #fff",
  },
  logoutBtn: {
    margin: "16px",
    padding: "10px",
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  main: {
    marginLeft: "240px",
    flex: 1,
    padding: "24px",
  },
  statsBar: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    flex: 1,
    background: "#fff",
    borderRadius: "10px",
    padding: "16px 20px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: "16px",
  },
  empty: {
    color: "#888",
    fontSize: "14px",
    padding: "20px 0",
  },
  orderCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  orderId: {
    fontWeight: "700",
    fontSize: "14px",
    color: "#333",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  section: {
    marginBottom: "10px",
    fontSize: "13px",
    color: "#444",
  },
  addressText: {
    margin: "6px 0 0",
    fontSize: "13px",
    lineHeight: "1.7",
    color: "#555",
  },
  updateBtn: {
    marginTop: "12px",
    padding: "10px 20px",
    background: "#1B5E20",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  profileCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "30px",
    maxWidth: "500px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  },
  profileAvatar: {
    fontSize: "60px",
    textAlign: "center",
    marginBottom: "20px",
  },
  profileTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  profileLabel: {
    padding: "10px 0",
    fontWeight: "600",
    color: "#555",
    fontSize: "14px",
    width: "140px",
    borderBottom: "1px solid #f0f0f0",
  },
  profileValue: {
    padding: "10px 0",
    color: "#333",
    fontSize: "14px",
    borderBottom: "1px solid #f0f0f0",
  },
};

export default DeliveryDashboard;