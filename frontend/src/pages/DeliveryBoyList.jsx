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
      fetchDeliveryBoys(); // refresh list
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
      fetchDeliveryBoys(); // refresh list
    } catch (error) {
      console.error("Reject failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        <h2 style={styles.title}>Delivery Boy List</h2>

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
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{boy.name}</td>
                    <td style={styles.td}>{boy.email}</td>
                    <td style={styles.td}>{boy.phone}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: boy.isApproved ? "#d4edda" : "#fff3cd",
                        color: boy.isApproved ? "#155724" : "#856404",
                      }}>
                        {boy.isApproved ? "✅ Approved" : "⏳ Pending"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: boy.isActive ? "#d4edda" : "#f8d7da",
                        color: boy.isActive ? "#155724" : "#721c24",
                      }}>
                        {boy.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={styles.td}>
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
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#1B5E20",
  },
  loading: {
    color: "#555",
    fontSize: "16px",
  },
  empty: {
    color: "#888",
    fontSize: "15px",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
  },
  thead: {
    background: "#1B5E20",
  },
  th: {
    padding: "12px 16px",
    color: "#fff",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "14px",
  },
  tr: {
    borderBottom: "1px solid #f0f0f0",
  },
  td: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#333",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  actionRow: {
    display: "flex",
    gap: "8px",
  },
  approveBtn: {
    padding: "6px 14px",
    background: "#1B5E20",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  rejectBtn: {
    padding: "6px 14px",
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
};

export default DeliveryBoyList;