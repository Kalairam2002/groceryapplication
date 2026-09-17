import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";

const AdminExpiredVariantsTable = () => {
  const [expiredData, setExpiredData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpiredVariants = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/expired`
        );

        if (response.data.success) {
          // ✅ Admin sees expired variants across ALL sellers — no sellerId filter
          setExpiredData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching expired variants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiredVariants();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{
          width: "40px", height: "40px", border: "4px solid #f0f0f0",
          borderTop: "4px solid #2F6D4F", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 12px"
        }} />
        <p style={{ color: "#999", fontSize: "14px" }}>Loading expired variants...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AdminLayout page="product-list">
    <div style={{ padding: "30px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "24px"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#2d2d2d", fontFamily: "'Space Grotesk', sans-serif" }}>
            🗓️ Expired Variants
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
            Products removed due to expiry — across all sellers
          </p>
        </div>

        {/* ── Count Badge ── */}
        <div style={{
          background: expiredData.length > 0 ? "#FFF3EC" : "#EAF6EF",
          border: `1px solid ${expiredData.length > 0 ? "#F3C4A8" : "#B7DFC7"}`,
          borderRadius: "20px", padding: "6px 16px",
          fontSize: "13px", fontWeight: "600",
          color: expiredData.length > 0 ? "#E8622C" : "#1F4B37"
        }}>
          {expiredData.length > 0
            ? `${expiredData.length} Expired Record${expiredData.length > 1 ? "s" : ""}`
            : "✅ No Expired Variants"}
        </div>
      </div>

      {/* ── Empty State ── */}
      {expiredData.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: "16px",
          padding: "60px 30px", textAlign: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
          <h3 style={{ color: "#1F4B37", margin: "0 0 8px" }}>All Clear!</h3>
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
            No expired variants found across any seller.
          </p>
        </div>
      ) : (

        /* ── Table Card ── */
        <div style={{
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden"
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>

              {/* ── Table Head ── */}
              <thead>
                <tr style={{ background: "#FFF3EC", borderBottom: "2px solid #F3C4A8" }}>
                  {["#", "Product Name", "Seller", "Price", "Offer Price", "Stock", "Expiry Date", "Deleted On"].map((col) => (
                    <th key={col} style={{
                      padding: "14px 18px", textAlign: "left",
                      fontSize: "12px", fontWeight: "700",
                      color: "#B24A1F", textTransform: "uppercase",
                      letterSpacing: "0.5px", whiteSpace: "nowrap",
                      fontFamily: "'IBM Plex Mono', monospace"
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* ── Table Body ── */}
              <tbody>
                {expiredData.map((item, index) => (
                  <tr key={item._id} style={{
                    borderBottom: "1px solid #f5f5f5",
                    background: index % 2 === 0 ? "#fff" : "#fbfdfc",
                    transition: "background 0.2s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f6fbf8"}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#fbfdfc"}
                  >
                    {/* # */}
                    <td style={{ padding: "14px 18px", color: "#aaa", fontWeight: "600" }}>
                      {index + 1}
                    </td>

                    {/* Product Name */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "600", color: "#2d2d2d" }}>
                        {item.productName}
                      </div>
                      <div style={{ fontSize: "11px", color: "#bbb", marginTop: "2px" }}>
                        ID: {item.productId?.toString().slice(-6)}
                      </div>
                    </td>

                    {/* Seller */}
                    <td style={{ padding: "14px 18px", color: "#555", fontSize: "13px" }}>
                      {item.sellerName || item.sellerId?.toString().slice(-6) || "—"}
                    </td>

                    {/* Price */}
                    <td style={{ padding: "14px 18px", color: "#555" }}>
                      <span style={{ textDecoration: "line-through", color: "#bbb" }}>
                        ₹{item.price}
                      </span>
                    </td>

                    {/* Offer Price */}
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        background: "#EAF6EF", color: "#1F4B37",
                        padding: "3px 10px", borderRadius: "20px",
                        fontSize: "13px", fontWeight: "600"
                      }}>
                        ₹{item.offerPrice}
                      </span>
                    </td>

                    {/* Stock */}
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        background: item.stock > 0 ? "#FFF6DE" : "#FCEBEB",
                        color: item.stock > 0 ? "#8A6A00" : "#B23434",
                        padding: "3px 10px", borderRadius: "20px",
                        fontSize: "13px", fontWeight: "600"
                      }}>
                        {item.stock > 0 ? `${item.stock} left` : "Out of Stock"}
                      </span>
                    </td>

                    {/* Expiry Date */}
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        background: "#FFF3EC", color: "#B24A1F",
                        padding: "3px 10px", borderRadius: "20px",
                        fontSize: "13px", fontWeight: "600"
                      }}>
                        📅 {formatDate(item.expiryDate)}
                      </span>
                    </td>

                    {/* Deleted On */}
                    <td style={{ padding: "14px 18px", color: "#999", fontSize: "13px" }}>
                      🗑️ {formatDate(item.deletedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Table Footer ── */}
          <div style={{
            padding: "12px 18px", background: "#FFF3EC",
            borderTop: "1px solid #F3C4A8",
            fontSize: "12px", color: "#B24A1F", textAlign: "right"
          }}>
            Total {expiredData.length} expired variant{expiredData.length > 1 ? "s" : ""} across all sellers
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminExpiredVariantsTable;