import React, { useEffect, useState } from "react";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";

const Sellerdashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

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
        name: product.name,
        image: product.image?.[0],
        stock: v.stock,
        unitLabel: v.stockUnit || v.unit || "",
        variantLabel:
          v.sizeLabel ||
          (v.quantity ? `${v.quantity} ${v.unit}` : v.unit || ""),
      }))
  );

  const outOfStockRows = lowStockRows
    .filter((r) => r.stock <= 0)
    .sort((a, b) => a.stock - b.stock);
  const runningLowRows = lowStockRows
    .filter((r) => r.stock > 0)
    .sort((a, b) => a.stock - b.stock);

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
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#791F1F", whiteSpace: "nowrap" }}>
                          {row.stock} {row.unitLabel}
                        </span>
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
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#633806", whiteSpace: "nowrap" }}>
                          {row.stock} {row.unitLabel}
                        </span>
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