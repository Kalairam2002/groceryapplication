import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./admin/AdminLayout";

const API = process.env.REACT_APP_API_URL;

const DeliveryBoyList = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDeliveryBoys = async () => {
    try {
      const { data } = await axios.get(`${API}/api/delivery/all`);
      if (data.success) setDeliveryBoys(data.data);
    } catch (error) {
      console.error("Failed to fetch delivery boys:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id + "approve");
    try {
      await axios.put(`${API}/api/delivery/approve/${id}`);
      fetchDeliveryBoys();
    } catch (error) {
      console.error("Approve failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id + "reject");
    try {
      await axios.put(`${API}/api/delivery/reject/${id}`);
      fetchDeliveryBoys();
    } catch (error) {
      console.error("Reject failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        <span style={styles.eyebrow}>Network / Delivery</span>
        <h2 style={styles.title}>Delivery boy list</h2>
        <p style={styles.subtitle}>Approve or manage riders registered on the platform</p>

        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : deliveryBoys.length === 0 ? (
          <p style={styles.empty}>No delivery boys registered yet.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Active</th>
                  <th style={styles.th}>Registered</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveryBoys.map((boy, index) => (
                  <tr key={boy._id} style={styles.tr}>
                    <td style={{ ...styles.td, fontFamily: "'IBM Plex Mono', monospace", color: "#6E7A6C" }}>{index + 1}</td>
                    <td style={{ ...styles.td, fontWeight: 500 }}>{boy.name}</td>
                    <td style={styles.td}>{boy.email}</td>
                    <td style={styles.td}>{boy.phone}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: boy.isApproved ? "#E4F1E8" : "#FBF0DE",
                        color: boy.isApproved ? "#1F4B37" : "#9A6B1F",
                      }}>
                        {boy.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: boy.isActive ? "#E4F1E8" : "#FBE7E4",
                        color: boy.isActive ? "#1F4B37" : "#C1441E",
                      }}>
                        {boy.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#6E7A6C" }}>
                      {new Date(boy.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        {!boy.isApproved && (
                          <button
                            style={styles.approveBtn}
                            onClick={() => handleApprove(boy._id)}
                            disabled={actionLoading === boy._id + "approve"}
                          >
                            {actionLoading === boy._id + "approve" ? "..." : "Approve"}
                          </button>
                        )}
                        {boy.isApproved && (
                          <button
                            style={styles.rejectBtn}
                            onClick={() => handleReject(boy._id)}
                            disabled={actionLoading === boy._id + "reject"}
                          >
                            {actionLoading === boy._id + "reject" ? "..." : "Reject"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1180px",
    margin: "0 auto",
  },
  eyebrow: {
    display: "block",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#2F6D4F",
    marginBottom: "6px",
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "22px",
    fontWeight: "600",
    margin: "0",
    color: "#1C2620",
  },
  subtitle: {
    color: "#6E7A6C",
    fontSize: "13.5px",
    margin: "4px 0 20px",
  },
  loading: {
    color: "#6E7A6C",
    fontSize: "14px",
  },
  empty: {
    color: "#6E7A6C",
    fontSize: "14px",
    background: "#fff",
    border: "1px solid #E3E8DD",
    borderRadius: "16px",
    padding: "40px",
    textAlign: "center",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "14px",
    border: "1px solid #E3E8DD",
    boxShadow: "0 10px 30px rgba(31, 75, 55, 0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
  },
  thead: {
    background: "#1F4B37",
  },
  th: {
    padding: "12px 16px",
    color: "#fff",
    textAlign: "left",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: "600",
    fontSize: "12.5px",
  },
  tr: {
    borderBottom: "1px solid #F0F2EC",
  },
  td: {
    padding: "12px 16px",
    fontSize: "13.5px",
    color: "#1C2620",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  actionRow: {
    display: "flex",
    gap: "8px",
  },
  approveBtn: {
    padding: "6px 14px",
    background: "#1F4B37",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "12.5px",
  },
  rejectBtn: {
    padding: "6px 14px",
    background: "#E8622C",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "12.5px",
  },
};

export default DeliveryBoyList;