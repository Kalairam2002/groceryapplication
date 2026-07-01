import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";

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
          <h2>Retail Billing</h2>
          <span> {new Date().toLocaleDateString("en-GB")}</span>
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
        {loading && <p>Fetching product...</p>}

        {/* ================= TABLE ================= */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Barcode</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Amount</th>
                <th>X</th>
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
                  <td>{i + 1}</td>
                  <td>{item.barcode}</td>
                  <td>{item.name}</td>
                  <td>
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
                      -
                    </button>
                    {item.qty}
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
                  </td>
                  <td>₹{item.sellingPrice}</td>
                  <td>
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
          <strong>Total Items:</strong> {totalQty}
          <strong>Net Amount:</strong> ₹
          {subTotal.toFixed(2)}
        </div>

        {/* ================= ACTION ================= */}
        <div style={styles.actions}>
          <button style={styles.clearBtn} onClick={() => setCart([])}>
            Clear
          </button>
          <button style={styles.saveBtn}>Save Bill</button>
        </div>
      </div>
    </SellerLayout>
  );
};

// ================= STYLES =================
const styles = {
  container: {
    padding: "20px",
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    marginBottom: "10px",
  },
  error: {
    color: "red",
    marginBottom: "5px",
  },
  tableWrapper: {
    background: "#fff",
    borderRadius: "6px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#777",
  },
  qtyBtn: {
    margin: "0 4px",
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "red",
    cursor: "pointer",
  },
  summary: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
  },
  actions: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  clearBtn: {
    padding: "8px 16px",
  },
  saveBtn: {
    padding: "8px 16px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
  },
};

export default BillingScanner;
