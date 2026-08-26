import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";

const BillingScanner = () => {
  const inputRef = useRef(null);

  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= AUTO FOCUS =================
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  // ================= SCAN / MANUAL ENTER =================
  const handleScan = async (e) => {
    if (e.key === "Enter" && barcode.trim()) {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/scan-barcode/${barcode}`,
          { withCredentials: true }
        );

        if (data.success) {
          const product = data.product;

          const exists = cart.find(
            (item) => item._id === product._id
          );

          if (exists) {
            setCart(
              cart.map((item) =>
                item._id === product._id
                  ? { ...item, qty: item.qty + 1 }
                  : item
              )
            );
          } else {
            setCart([
              ...cart,
              {
                ...product,
                qty: 1,
                sellingPrice: product.offerPrice || product.price,
              },
            ]);
          }
        } else {
          setError("Product not found");
        }

        setBarcode("");
      } catch (err) {
        setError("Invalid barcode or server error");
      } finally {
        setLoading(false);
      }
    }
  };

  // ================= TOTALS =================
  const totalQty = cart.reduce((a, b) => a + b.qty, 0);
  const subTotal = cart.reduce(
    (a, b) => a + b.qty * b.sellingPrice,
    0
  );

  return (
    <SellerLayout page="billing">
      <div style={styles.container}>
        {/* ================= HEADER ================= */}
        <div style={styles.header}>
          <div>
            <span style={styles.eyebrow}>Records / Billing</span>
            <h2 style={styles.title}>Retail billing</h2>
          </div>
          <span style={styles.dateTag}>{new Date().toLocaleDateString("en-GB")}</span>
        </div>

        {/* ================= INPUT BOX ================= */}
        <input
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={handleScan}
          placeholder="Scan barcode or type manually & press Enter"
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}
        {loading && <p style={{ color: "#6B7280", fontSize: "13px" }}>Fetching product...</p>}

        {/* ================= TABLE ================= */}
        <div style={{ marginTop: "16px" }}>
          <table className="classic-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Barcode</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 && (
                <tr>
                  <td colSpan="7" style={styles.empty}>
                    No items added
                  </td>
                </tr>
              )}

              {cart.map((item, i) => (
                <tr key={item._id}>
                  <td className="mono-cell">{i + 1}</td>
                  <td className="mono-cell">{item.barcode}</td>
                  <td style={{ fontWeight: 500 }}>{item.name}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() =>
                          setCart(
                            cart.map((p) =>
                              p._id === item._id
                                ? {
                                    ...p,
                                    qty: Math.max(1, p.qty - 1),
                                  }
                                : p
                            )
                          )
                        }
                      >
                        −
                      </button>
                      <span className="mono-cell" style={{ color: "#1E2233" }}>{item.qty}</span>
                      <button
                        style={styles.qtyBtn}
                        onClick={() =>
                          setCart(
                            cart.map((p) =>
                              p._id === item._id
                                ? { ...p, qty: p.qty + 1 }
                                : p
                            )
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="mono-cell">₹{item.sellingPrice}</td>
                  <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                    ₹{(item.qty * item.sellingPrice).toFixed(2)}
                  </td>
                  <td>
                    <button
                      style={styles.removeBtn}
                      onClick={() =>
                        setCart(
                          cart.filter(
                            (p) => p._id !== item._id
                          )
                        )
                      }
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= SUMMARY ================= */}
        <div style={styles.summary}>
          <span>Total items: <b style={styles.summaryValue}>{totalQty}</b></span>
          <span>Net amount: <b style={styles.summaryValue}>₹{subTotal.toFixed(2)}</b></span>
        </div>

        {/* ================= ACTION ================= */}
        <div style={styles.actions}>
          <button style={styles.clearBtn} onClick={() => setCart([])}>
            Clear
          </button>
          <button style={styles.saveBtn}>Save bill</button>
        </div>
      </div>
    </SellerLayout>
  );
};

// ================= STYLES =================
const styles = {
  container: {
    padding: "24px",
    background: "#F6F7FB",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  eyebrow: {
    display: "block",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#3B4C8A",
    marginBottom: "6px",
  },
  title: {
    margin: 0,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: "20px",
    color: "#1E2233",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "16px",
  },
  dateTag: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    color: "#6B7280",
  },
  input: {
    width: "100%",
    padding: "13px 16px",
    fontSize: "14.5px",
    borderRadius: "10px",
    border: "1px solid #E4E7F0",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "6px",
  },
  error: {
    color: "#B02A37",
    fontSize: "13px",
    margin: "6px 0",
  },
  empty: {
    textAlign: "center",
    padding: "24px",
    color: "#9AA0B4",
  },
  qtyBtn: {
    width: "22px",
    height: "22px",
    border: "1px solid #E4E7F0",
    background: "#F6F7FB",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    lineHeight: 1,
  },
  removeBtn: {
    background: "#FBE9E7",
    border: "none",
    color: "#C0472E",
    width: "26px",
    height: "26px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
  },
  summary: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "space-between",
    background: "#fff",
    border: "1px solid #E4E7F0",
    borderRadius: "12px",
    padding: "16px 20px",
    fontSize: "13.5px",
    color: "#1E2233",
  },
  summaryValue: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "15px",
    marginLeft: "6px",
  },
  actions: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  clearBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #E4E7F0",
    background: "#fff",
    color: "#6B7280",
    fontWeight: 500,
    cursor: "pointer",
  },
  saveBtn: {
    padding: "10px 22px",
    borderRadius: "8px",
    background: "#262F52",
    color: "#fff",
    border: "none",
    fontWeight: 500,
    cursor: "pointer",
  },
};

export default BillingScanner;