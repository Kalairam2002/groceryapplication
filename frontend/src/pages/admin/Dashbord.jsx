import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./Dashboard.css";
import { useQuery } from "@tanstack/react-query";

// Small dismiss button used on Stock/Expiry alert rows — clears the
// notification only; it never touches the product itself.
const DismissAlertButton = ({ color, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title || "Dismiss notification"}
    style={{
      background: "none",
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

const Dashboard = () => {
  const [data, setData] = useState({
    categories: 0,

  });
  const [loading, setLoading] = useState(true);

  // Notification rows the admin has dismissed (Stock/Expiry alerts) —
  // this only hides the notification card; the product itself is untouched.
  // Separate localStorage key from the seller dashboard's so dismissals
  // don't bleed across roles on the same browser.
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("dismissedAdminAlerts") || "[]"));
    } catch {
      return new Set();
    }
  });

  const dismissAlert = (key) => {
    setDismissedAlerts((prev) => {
      const next = new Set(prev);
      next.add(key);
      try {
        localStorage.setItem("dismissedAdminAlerts", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const { data: sellerdata, isLoading, isError } = useQuery({
    queryKey: ["seller-list"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/seller/seller-list`
      );
      return res.data;
    },
  })
   const totalSellers = sellerdata?.data?.length || 0;
  

     const { data: order, } = useQuery({
    queryKey: ["orderkey"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/getOrderList`
      );
      return res.data;
    },
  })
  
   const orderdata = order?.orders?.length || 0;

    const { data: productlist, } = useQuery({
    queryKey: ["productlistkey"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/getProductList`
      );
      return res.data;
    },
  })
   const productlistdata = productlist?.products?.length || 0;

  // ── Alert data (mirrors Sellerdashboard.jsx's logic, run over ALL
  // products across every seller instead of one seller's own list) ──
  const products = productlist?.products || [];

  // Low stock: flatten each product's variants into individual rows so a
  // product with one low variant and one healthy variant still surfaces
  // the low one specifically (stock/stockUnit live on the variant, not
  // the product). `quantity` is a per-variant spec (screen size, drum
  // capacity, waist size, etc.), not a stocked pack size, so a flat
  // threshold on `stock` is used instead of a percentage.
  const LOW_STOCK_THRESHOLD = 15;

  // Total stock is the sum of a variant's batches (each batch = one
  // delivery/lot). Falls back to the legacy single `stock` field for any
  // pre-migration documents that don't have batches yet.
  const getVariantStock = (v) => {
    if (v.batches && v.batches.length > 0) {
      return v.batches.reduce((sum, b) => sum + (Number(b.stock) || 0), 0);
    }
    return Number(v.stock) || 0;
  };

  const isLowStock = (v) => getVariantStock(v) < LOW_STOCK_THRESHOLD;

  const lowStockRows = products.flatMap((product) =>
    (product.variants || [])
      .filter(isLowStock)
      .map((v) => ({
        productId: product._id,
        variantId: v._id,
        alertKey: `${product._id}-${v._id}-stock`,
        name: product.name,
        sellerName: product.seller?.name || "",
        image: product.image?.[0],
        stock: getVariantStock(v),
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

  // Get the batches to check for a variant — real batches if present,
  // otherwise a single pseudo-batch built from the legacy stock/expiryDate
  // fields so pre-migration documents still work.
  const getVariantBatches = (v) => {
    if (v.batches && v.batches.length > 0) return v.batches;
    if (v.expiryDate) return [{ stock: v.stock, expiryDate: v.expiryDate, _id: v._id }];
    return [];
  };

  const expiredRows = products
    .flatMap((product) =>
      (product.variants || []).flatMap((v) =>
        getVariantBatches(v)
          .filter((b) => {
            if (!b.expiryDate || (Number(b.stock) || 0) <= 0) return false;
            const expiry = new Date(b.expiryDate);
            expiry.setHours(0, 0, 0, 0);
            return expiry < today;
          })
          .map((b, i) => {
            const expiry = new Date(b.expiryDate);
            expiry.setHours(0, 0, 0, 0);
            const daysAgo = Math.round((today - expiry) / (1000 * 60 * 60 * 24));
            return {
              productId: product._id,
              variantId: v._id,
              alertKey: `${product._id}-${v._id}-${b._id || i}-expired`,
              name: product.name,
              sellerName: product.seller?.name || "",
              image: product.image?.[0],
              variantLabel:
                v.sizeLabel ||
                (v.quantity ? `${v.quantity} ${v.unit}` : v.unit || ""),
              batchStock: Number(b.stock) || 0,
              daysAgo,
            };
          })
      )
    )
    .filter((row) => !dismissedAlerts.has(row.alertKey))
    .sort((a, b) => b.daysAgo - a.daysAgo);

  // Expiring soon: batches whose expiryDate is today or up to
  // EXPIRING_SOON_DAYS ahead — not expired yet, but close enough that an
  // admin should know before it's too late.
  const EXPIRING_SOON_DAYS = 3;

  const expiringSoonRows = products
    .flatMap((product) =>
      (product.variants || []).flatMap((v) =>
        getVariantBatches(v)
          .filter((b) => {
            if (!b.expiryDate || (Number(b.stock) || 0) <= 0) return false;
            const expiry = new Date(b.expiryDate);
            expiry.setHours(0, 0, 0, 0);
            const daysUntil = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
            return daysUntil >= 0 && daysUntil <= EXPIRING_SOON_DAYS;
          })
          .map((b, i) => {
            const expiry = new Date(b.expiryDate);
            expiry.setHours(0, 0, 0, 0);
            const daysUntil = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
            return {
              productId: product._id,
              variantId: v._id,
              alertKey: `${product._id}-${v._id}-${b._id || i}-expiring`,
              name: product.name,
              sellerName: product.seller?.name || "",
              image: product.image?.[0],
              variantLabel:
                v.sizeLabel ||
                (v.quantity ? `${v.quantity} ${v.unit}` : v.unit || ""),
              batchStock: Number(b.stock) || 0,
              daysUntil,
            };
          })
      )
    )
    .filter((row) => !dismissedAlerts.has(row.alertKey))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [categoryRes, sellerRes, orderRes, productRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/admindata/getCategory`),
 
        ]);

        setData({
          categories: categoryRes.data.length || 0,

        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AdminLayout page="dashboard">
      <section className="admin-dashboard py-5">
        <div className="container">
          <h3>Admin Dashboard</h3>

          {/* Stats Cards */}
          {loading ? (
            <p className="text-center text-muted">Loading data...</p>
          ) : (
            <div className="row g-4 mb-5">
              <div className="col-md-3">
                <div className="dashboard-card light-blue">
                  <h6>Total Categories</h6>
                  <h2>{data.categories}</h2>
                  <p className="small mb-0">All store categories</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="dashboard-card light-green">
                  <h6>Total Sellers</h6>
                  <h2>{totalSellers}</h2>
                  <p className="small mb-0">Registered vendors</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="dashboard-card light-yellow">
                  <h6>Total Orders</h6>
                  <h2>{orderdata}</h2>
                  <p className="small mb-0">Customer purchases</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="dashboard-card light-purple">
                  <h6>Total Products</h6>
                  <h2>{productlistdata}</h2>
                  <p className="small mb-0">Active listings</p>
                </div>
              </div>
            </div>
          )}

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
                <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
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
                              {row.sellerName ? ` · ${row.sellerName}` : ""}
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
                              {row.sellerName ? ` · ${row.sellerName}` : ""}
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
                <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
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
                              {row.sellerName ? ` · ${row.sellerName}` : ""}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#633806", whiteSpace: "nowrap" }}>
                            {row.daysUntil === 0 ? "Expires today" : `Expires in ${row.daysUntil} day${row.daysUntil === 1 ? "" : "s"}`} ({row.batchStock} units)
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
                              {row.sellerName ? ` · ${row.sellerName}` : ""}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#791F1F", whiteSpace: "nowrap" }}>
                            {row.daysAgo === 0 ? "Expired today" : `Expired ${row.daysAgo} day${row.daysAgo === 1 ? "" : "s"} ago`} ({row.batchStock} units)
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

          {/* Table Section (Recent Orders) */}
          <div className="classic-table-container "   >
            <h4 className="mb-4 text-center">Seller List </h4>

            {/* Sample: using orders for recent */}
            {sellerdata?.data?.length === 0 ? (
              <p className="text-center text-muted">No orders found.</p>
            ) : (
              <table className="classic-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Order ID</th>
                    <th>Seller Name</th>
                    <th>Email</th>
                   
                   
                  </tr>
                </thead>
                <tbody>
                  {/* This is static demo row — replace when order data is available */}
                  {sellerdata?.data?.map((data) => (
                    <tr key={data._id} >
                        <td></td>
                      <td>{data._id}</td>
                      <td>{data.name}</td>
                      <td>{data.email}</td>
                      
                  
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default Dashboard;