import React, { useEffect, useState } from "react";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";

// Small dismiss button used on Stock/Expiry alert rows — clears the
// notification only; it never touches the product itself.
const DismissAlertButton = ({ color, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title || "Dismiss notification"}
    style={{
      background: `"none",
      border: "none",
      cursor: "pointer",
      padding: "4px",
      color,
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  </button>
);

const Sellerdashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  // Notification rows the seller has dismissed (Stock/Expiry alerts) —
  // this only hides the notification card; the product itself is untouched.
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("dismissedSellerAlerts") || "[]"));
    } catch {
      return new Set();
    }
  });

  const dismissAlert = (key) => {
    setDismissedAlerts((prev) => {
      const next = new Set(prev);
      next.add(key);
      try {
        localStorage.setItem("dismissedSellerAlerts", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/order/seller/order`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/product/list/seller`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };

    fetchOrders();
    fetchProducts();
  }, []);

  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalRevenue = orders
    .filter((o) => o.status === "Completed")
    .reduce((acc, order) => acc + (order.amount || 0), 0);

  // Low stock: flatten each product's variants into individual rows so a
  // product with one low variant and one healthy variant still surfaces
  // the low one specifically (stock/stockUnit live on the variant, not
  // the product — see AdminAddProduct/SellerAddProduct forms).
  //
  // NOTE: `quantity` is a per-variant spec (screen size in Inch, drum
  // capacity in Kg, waist size, etc.), not a stocked pack size — so it
  // can't be used to compute a % remaining. `stock` is consistently a
  // plain piece count across every product type in this app, so a flat
  // threshold is the correct rule here.
  const LOW_STOCK_THRESHOLD = 15;

  const isLowStock = (v) => v.stock < LOW_STOCK_THRESHOLD;

  const lowStockRows = products.flatMap((product) =>
    (product.variants || [])
      .filter(isLowStock)
      .map((v) => ({
        productId: product._id,
        variantId: v._id,
        alertKey: `${product._id}-${v._id}-stock`,
        name: product.name,
        image: product.image?.[0],
        stock: v.stock,
        unitLabel: v.stockUnit || v.unit || "",
        variantLabel:
          v.sizeLabel ||
          (v.quantity ? `${v.quantity} ${v.unit}` : v.unit || ""),
      }))
  ).filter((row) => !dismissedAlerts.has(row.alertKey));

  const outOfStockRows = lowStockRows
    .filter((r) => r.stock <= 0)
    .sort((a, b) => a.stock - b.stock);
  const runningLowRows = lowStockRows
    .filter((r) => r.stock > 0)
    .sort((a, b) => a.stock - b.stock);

  // Expired products: flatten each product's variants and keep the ones
  // whose expiryDate has passed (grocery/fresh categories only set this
  // field — non-expiring products simply won't have expiryDate).
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredRows = products
    .flatMap((product) =>
      (product.variants || [])
        .filter((v) => {
          if (!v.expiryDate) return false;
          const expiry = new Date(v.expiryDate);
          expiry.setHours(0, 0, 0, 0);
          return expiry < today;
        })
        .map((v) => {
          const expiry = new Date(v.expiryDate);
          expiry.setHours(0, 0, 0, 0);
          const daysAgo = Math.round((today - expiry) / (1000 * 60 * 60 * 24));
          return {
            productId: product._id,
            variantId: v._id,
            alertKey: `${product._id}-${v._id}-expired`,
            name: product.name,
            image: product.image?.[0],
            variantLabel:
              v.sizeLabel ||
              (v.quantity ? `${v.quantity} ${v.unit}` : v.unit || ""),
            daysAgo,
          };
        })
    )
    .filter((row) => !dismissedAlerts.has(row.alertKey))
    .sort((a, b) => b.daysAgo - a.daysAgo);

  // Expiring soon: variants whose expiryDate is today or up to
  // EXPIRING_SOON_DAYS ahead — not expired yet, but close enough that a
  // seller should know before it's too late.
  const EXPIRING_SOON_DAYS = 3;

  const expiringSoonRows = products
    .flatMap((product) =>
      (product.variants || [])
        .filter((v) => {
          if (!v.expiryDate) return false;
          const expiry = new Date(v.expiryDate);
          expiry.setHours(0, 0, 0, 0);
          const daysUntil = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= EXPIRING_SOON_DAYS;
        })
        .map((v) => {
          const expiry = new Date(v.expiryDate);
          expiry.setHours(0, 0, 0, 0);
          const daysUntil = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
          return {
            productId: product._id,
            variantId: v._id,
            alertKey: `${product._id}-${v._id}-expiring`,
            name: product.name,
            image: product.image?.[0],
            variantLabel:
              v.sizeLabel ||
              (v.quantity ? `${v.quantity} ${v.unit}` : v.unit || ""),
            daysUntil,
          };
        })
    )
    .filter((row) => !dismissedAlerts.has(row.alertKey))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <SellerLayout page="Seller-Dashboard">
      <section className="orders py-5">
        <div className="container">
          <h3>Seller Dashboard</h3>

          {/* Stats Cards */}
          <div className="row g-4 mb-5">
            <div className="col-md-3">
              <div className="dashboard-card light-blue">
                <h6>Total Products</h6>
                <h2>{totalProducts}</h2>
                <p className="small mb-0">Your active listings</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="dashboard-card light-green">
                <h6>Total Orders</h6>
                <h2>{totalOrders}</h2>
                <p className="small mb-0">All customer orders</p>
              </div>
            </div>
            {/* <div className="col-md-3">
              <div className="dashboard-card light-purple">
                <h6>Total Revenue</h6>
                <h2>₹{totalRevenue.toLocaleString()}</h2>
                <p className="small mb-0">From completed sales</p>
              </div>
            </div> */}
          </div>

          {/* Low Stock Alerts */}
          {lowStockRows.length > 0 && (
            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: "24px",
                marginBottom: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "18px",
                }}
              >
                <span style={{ fontSize: "20px" }}>⚠️</span>
                <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                  Stock alerts
                </h4>
              </div>

              {outOfStockRows.length > 0 && (
                <div style={{ marginBottom: runningLowRows.length ? "22px" : 0 }}>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "#A32D2D",
                      marginBottom: "10px",
                    }}
                  >
                    Out of stock · {outOfStockRows.length}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {outOfStockRows.map((row) => (
                      <div
                        key={`${row.productId}-${row.variantId}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#FCEBEB",
                          borderRadius: "10px",
                          padding: "10px 14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {row.image && (
                            <img
                              src={row.image}
                              alt={row.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                background: "#fff",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
                              {row.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b6b6b" }}>
                              {row.variantLabel}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#791F1F", whiteSpace: "nowrap" }}>
                            {row.stock} {row.unitLabel}
                          </span>
                          <DismissAlertButton
                            color="#A32D2D"
                            onClick={() => dismissAlert(row.alertKey)}
                            title="Dismiss this alert"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {runningLowRows.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "#854F0B",
                      marginBottom: "10px",
                    }}
                  >
                    Running low · {runningLowRows.length}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {runningLowRows.map((row) => (
                      <div
                        key={`${row.productId}-${row.variantId}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#FAEEDA",
                          borderRadius: "10px",
                          padding: "10px 14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {row.image && (
                            <img
                              src={row.image}
                              alt={row.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                background: "#fff",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
                              {row.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b6b6b" }}>
                              {row.variantLabel}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#633806", whiteSpace: "nowrap" }}>
                            {row.stock} {row.unitLabel}
                          </span>
                          <DismissAlertButton
                            color="#854F0B"
                            onClick={() => dismissAlert(row.alertKey)}
                            title="Dismiss this alert"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expiry Alerts */}
          {(expiringSoonRows.length > 0 || expiredRows.length > 0) && (
            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: "24px",
                marginBottom: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "18px",
                }}
              >
                <span style={{ fontSize: "20px" }}>⏰</span>
                <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                  Expiry alerts
                </h4>
              </div>

              {expiringSoonRows.length > 0 && (
                <div style={{ marginBottom: expiredRows.length ? "22px" : 0 }}>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "#854F0B",
                      marginBottom: "10px",
                    }}
                  >
                    Expiring soon · {expiringSoonRows.length}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {expiringSoonRows.map((row) => (
                      <div
                        key={`${row.productId}-${row.variantId}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#FAEEDA",
                          borderRadius: "10px",
                          padding: "10px 14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {row.image && (
                            <img
                              src={row.image}
                              alt={row.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                background: "#fff",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
                              {row.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b6b6b" }}>
                              {row.variantLabel}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#633806", whiteSpace: "nowrap" }}>
                            {row.daysUntil === 0 ? "Expires today" : `Expires in ${row.daysUntil} day${row.daysUntil === 1 ? "" : "s"}`}
                          </span>
                          <DismissAlertButton
                            color="#854F0B"
                            onClick={() => dismissAlert(row.alertKey)}
                            title="Dismiss this alert"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expiredRows.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "#791F1F",
                      marginBottom: "10px",
                    }}
                  >
                    Expired · {expiredRows.length}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {expiredRows.map((row) => (
                      <div
                        key={`${row.productId}-${row.variantId}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#FCEBEB",
                          borderRadius: "10px",
                          padding: "10px 14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {row.image && (
                            <img
                              src={row.image}
                              alt={row.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                background: "#fff",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
                              {row.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b6b6b" }}>
                              {row.variantLabel}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#791F1F", whiteSpace: "nowrap" }}>
                            {row.daysAgo === 0 ? "Expired today" : `Expired ${row.daysAgo} day${row.daysAgo === 1 ? "" : "s"} ago`}
                          </span>
                          <DismissAlertButton
                            color="#A32D2D"
                            onClick={() => dismissAlert(row.alertKey)}
                            title="Dismiss this alert"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Orders Table */}
          <div className="classic-table-container mt-5">
            <h4 className="mb-4 mt-4 text-center">Recent Orders</h4>

            {orders.length === 0 ? (
              <p className="text-center text-muted">No orders found.</p>
            ) : (
              <table className="classic-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order, index) => (
                    <tr
                      key={order._id}
                      className={index % 2 === 0 ? "even" : "odd"}
                    >
                      <td>{index + 1}</td>
                      <td>#{order._id.slice(-6).toUpperCase()}</td>
                      <td>₹{order.amount}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            order.status === "Pending"
                              ? "pending"
                              : order.status === "Completed"
                              ? "completed"
                              : "cancelled"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </SellerLayout>
  );
};

export default Sellerdashboard;