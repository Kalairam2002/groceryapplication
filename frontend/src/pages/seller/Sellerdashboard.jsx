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
  const LOW_STOCK_THRESHOLD = 5;

  const lowStockRows = products.flatMap((product) =>
    (product.variants || [])
      .filter((v) => v.stock < LOW_STOCK_THRESHOLD)
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
            <div className="seller-stock-alerts mb-5">
              <h4 className="mb-3">
                <i className="ph ph-warning-circle" aria-hidden="true"></i>{" "}
                Stock alerts
              </h4>

              {outOfStockRows.length > 0 && (
                <>
                  <p className="seller-stock-alert-label seller-stock-alert-label--danger">
                    Out of stock · {outOfStockRows.length}
                  </p>
                  <div className="seller-stock-alert-list mb-3">
                    {outOfStockRows.map((row) => (
                      <div
                        key={`${row.productId}-${row.variantId}`}
                        className="seller-stock-alert-row seller-stock-alert-row--danger"
                      >
                        <div className="seller-stock-alert-info">
                          {row.image && (
                            <img
                              src={row.image}
                              alt={row.name}
                              className="seller-stock-alert-thumb"
                            />
                          )}
                          <div>
                            <div className="seller-stock-alert-name">
                              {row.name}
                            </div>
                            <div className="seller-stock-alert-variant">
                              {row.variantLabel}
                            </div>
                          </div>
                        </div>
                        <span className="seller-stock-alert-qty">
                          {row.stock} {row.unitLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {runningLowRows.length > 0 && (
                <>
                  <p className="seller-stock-alert-label seller-stock-alert-label--warning">
                    Running low · {runningLowRows.length}
                  </p>
                  <div className="seller-stock-alert-list">
                    {runningLowRows.map((row) => (
                      <div
                        key={`${row.productId}-${row.variantId}`}
                        className="seller-stock-alert-row seller-stock-alert-row--warning"
                      >
                        <div className="seller-stock-alert-info">
                          {row.image && (
                            <img
                              src={row.image}
                              alt={row.name}
                              className="seller-stock-alert-thumb"
                            />
                          )}
                          <div>
                            <div className="seller-stock-alert-name">
                              {row.name}
                            </div>
                            <div className="seller-stock-alert-variant">
                              {row.variantLabel}
                            </div>
                          </div>
                        </div>
                        <span className="seller-stock-alert-qty">
                          {row.stock} {row.unitLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
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