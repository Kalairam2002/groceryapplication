import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WishListSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const storedUser = localStorage.getItem("user");
  const username = storedUser ? JSON.parse(storedUser).username : null;
  const token = localStorage.getItem("token");

  // ✅ Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!username || !token) {
        toast.error("Please log in to view your orders");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/order/user/${username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success && Array.isArray(res.data.orders)) {
          // ✅ Group orders by order ID
          const groupedOrders = res.data.orders.reduce((acc, order) => {
            const existing = acc.find((o) => o._id === order._id);
            if (existing) {
              existing.products.push(...order.products);
            } else {
              acc.push({ ...order, products: [...order.products] });
            }
            return acc;
          }, []);

          setOrders(groupedOrders);
        } else {
          toast.info(res.data.message || "No orders found");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [username, token]);

  // ✅ Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="py-80 text-center">
        <h5>Loading your orders...</h5>
      </section>
    );
  }

  return (
    <section className="cart py-80">
      <div className="container container-lg">
        <div className="row gy-4">
          <div className="col-lg-11 mx-auto">
            <div className="cart-table border border-gray-100 rounded-8 shadow-sm">
              <div className="overflow-x-auto scroll-sm scroll-sm-horizontal">
                <table className="table rounded-8 overflow-hidden">
                  <thead>
                    <tr className="border-bottom border-neutral-100 bg-light">
                      <th className="px-40 py-20 border-end fw-bold">Order ID</th>
                      <th className="px-40 py-20 border-end fw-bold">Products</th>
                      <th className="px-40 py-20 border-end fw-bold">Sellers</th>
                      <th className="px-40 py-20 border-end fw-bold">Quantities</th>
                      {/* <th className="px-40 py-20 border-end fw-bold">Subtotals</th> */}
                      <th className="px-40 py-20 border-end fw-bold">Cart Amount</th>
                      <th className="px-40 py-20 border-end fw-bold">Status</th>
                      <th className="px-40 py-20 fw-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.length > 0 ? (
                      currentOrders.map((order) => (
                        <tr key={order._id} className="align-middle border-bottom border-neutral-100">
                          {/* ✅ Order ID */}
                          <td className="px-40 py-20 border-end fw-semibold">
                            {order._id}
                          </td>

                          {/* ✅ Products */}
                          <td className="px-40 py-20 border-end">
                            {order.products.map((p, i) => (
                              <div key={i}>{p.name}</div>
                            ))}
                          </td>

                          {/* ✅ Sellers */}
                          <td className="px-40 py-20 border-end">
                            {order.products.map((p, i) => (
                              <div key={i}>{p.seller?.name || "Unknown"}</div>
                            ))}
                          </td>

                          {/* ✅ Quantities */}
                          <td className="px-40 py-20 border-end">
                            {order.products.map((p, i) => (
                              <div key={i}>{p.quantity}</div>
                            ))}
                          </td>

                          {/* ✅ Subtotals (for each product) */}
                          {/* <td className="px-40 py-20 border-end">
                            {order.products.map((p, i) => (
                              <div key={i}>₹{(p.price * p.quantity).toFixed(2)}</div>
                            ))}
                          </td> */}

                          {/* ✅ Cart Amount (order.amount, displayed once) */}
                          <td className="px-40 py-20 border-end fw-bold text-gray-900">
                            ₹{order.amount?.toFixed(2) || "0.00"}
                          </td>

                          {/* ✅ Status */}
                          <td className="px-40 py-20 border-end">
                            <span
                              className={`badge rounded-pill ${
                                order.status === "Pending"
                                  ? "bg-warning text-dark"
                                  : order.status === "Delivered"
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>

                          {/* ✅ Date */}
                          <td className="px-40 py-20">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-40">
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ✅ Pagination */}
            {totalPages > 1 && (
              <nav className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i + 1}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </section>
  );
};

export default WishListSection;
