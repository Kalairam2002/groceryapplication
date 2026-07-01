import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";

const ExpiredVariantsTable = () => {
  const [expiredData, setExpiredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Get logged-in seller from localStorage
  const seller = localStorage.getItem("seller")
    ? JSON.parse(localStorage.getItem("seller"))
    : null;

  useEffect(() => {
    const fetchExpiredVariants = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/expired`
        );

        if (response.data.success) {
          // ✅ Filter: only show records where sellerId matches logged-in seller
          const filtered = response.data.data.filter(
            (item) => item.sellerId === seller?._id || 
                      item.sellerId?.toString() === seller?._id?.toString()
          );
          setExpiredData(filtered);
        }
      } catch (error) {
        console.error("Error fetching expired variants:", error);
      } finally {
        setLoading(false);
      }
    };

    if (seller?._id) {
      fetchExpiredVariants();
    } else {
      setLoading(false);
    }
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
          borderTop: "4px solid #e74c3c", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 12px"
        }} />
        <p style={{ color: "#999", fontSize: "14px" }}>Loading expired variants...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!seller) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#e74c3c" }}>
        <h4>⚠️ Seller not logged in</h4>
      </div>
    );
  }

  return (
    <SellerLayout page="product-list">
    <div style={{ padding: "30px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "24px"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#2d2d2d" }}>
            🗓️ Expired Variants
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
            Products removed due to expiry
          </p>
        </div>

        {/* ── Count Badge ── */}
        <div style={{
          background: expiredData.length > 0 ? "#fff5f5" : "#f0fff4",
          border: `1px solid ${expiredData.length > 0 ? "#ffcccc" : "#b2dfdb"}`,
          borderRadius: "20px", padding: "6px 16px",
          fontSize: "13px", fontWeight: "600",
          color: expiredData.length > 0 ? "#e53935" : "#2e7d32"
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
          <h3 style={{ color: "#2e7d32", margin: "0 0 8px" }}>All Clear!</h3>
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
            No expired variants found for your products.
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
                <tr style={{ background: "#fff5f5", borderBottom: "2px solid #ffe0e0" }}>
                  {["#", "Product Name", "Price", "Offer Price", "Stock", "Expiry Date", "Deleted On"].map((col) => (
                    <th key={col} style={{
                      padding: "14px 18px", textAlign: "left",
                      fontSize: "12px", fontWeight: "700",
                      color: "#c62828", textTransform: "uppercase",
                      letterSpacing: "0.5px", whiteSpace: "nowrap"
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
                    background: index % 2 === 0 ? "#fff" : "#fffafa",
                    transition: "background 0.2s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fff3f3"}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#fffafa"}
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

                    {/* Price */}
                    <td style={{ padding: "14px 18px", color: "#555" }}>
                      <span style={{ textDecoration: "line-through", color: "#bbb" }}>
                        ₹{item.price}
                      </span>
                    </td>

                    {/* Offer Price */}
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        background: "#e8f5e9", color: "#2e7d32",
                        padding: "3px 10px", borderRadius: "20px",
                        fontSize: "13px", fontWeight: "600"
                      }}>
                        ₹{item.offerPrice}
                      </span>
                    </td>

                    {/* Stock */}
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        background: item.stock > 0 ? "#fff8e1" : "#fce4ec",
                        color: item.stock > 0 ? "#f57f17" : "#c62828",
                        padding: "3px 10px", borderRadius: "20px",
                        fontSize: "13px", fontWeight: "600"
                      }}>
                        {item.stock > 0 ? `${item.stock} left` : "Out of Stock"}
                      </span>
                    </td>

                    {/* Expiry Date */}
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        background: "#ffebee", color: "#c62828",
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
            padding: "12px 18px", background: "#fff5f5",
            borderTop: "1px solid #ffe0e0",
            fontSize: "12px", color: "#e53935", textAlign: "right"
          }}>
            Total {expiredData.length} expired variant{expiredData.length > 1 ? "s" : ""} found
          </div>
        </div>
      )}
    </div>
    </SellerLayout>
  );
};

export default ExpiredVariantsTable;