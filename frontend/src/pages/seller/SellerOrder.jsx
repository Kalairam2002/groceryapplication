import React, { useEffect, useState } from "react";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";

const SellerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/order/seller/order`,
          {
            method: "GET",
            credentials: "include", // if using cookies for auth
          }
        );
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders); // ✅ Fix: use the array, not the whole object
        } else {
          console.error("Failed to fetch orders:", data.message);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };

    fetchOrders();
  }, []);

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <SellerLayout page="Seller-Order">
      <section className="orders py-5">
        <div className="container">
          <h3 className="mb-4">All Orders (Seller)</h3>

          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <table className="classic-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Products</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment ID</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <tr key={order._id} className={index % 2 === 0 ? "even" : "odd"}>
                    <td>{order.userId}</td>
                    <td>
                      <ul className="mb-0">
                        {order.products.map((p, idx) => (
                          <li key={idx}>
                            {p.name} × {p.quantity} (₹{p.price}) - Seller:{" "}
                            {p.sellerName || "N/A"}
                          </li>
                        ))}
                      </ul>
                    </td>
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
                    <td>{order.paymentId || "N/A"}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {orders.length > ordersPerPage && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={currentPage === idx + 1 ? "active" : ""}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </SellerLayout>
  );
};

export default SellerOrder;
