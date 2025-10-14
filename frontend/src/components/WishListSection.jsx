import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WishListSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Get user details safely from localStorage after login
  const storedUser = localStorage.getItem("user");
  const username = storedUser ? JSON.parse(storedUser).username : null;
  const token = localStorage.getItem("token");

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
            headers: {
              Authorization: `Bearer ${token}`, // ✅ JWT token for secure route (if required)
            },
          }
        );

        if (res.data.success) {
          setOrders(res.data.orders);
        } else {
          toast.info(res.data.message || "No orders found");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [username, token]);

  if (loading) {
    return (
      <section className="py-80 text-center">
        <h4>Loading your orders...</h4>
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
                      <th className="h6 fw-bold px-40 py-20 border-end">Order ID</th>
                      <th className="h6 fw-bold px-40 py-20 border-end">Product</th>
                      <th className="h6 fw-bold px-40 py-20 border-end">Seller</th>
                      <th className="h6 fw-bold px-40 py-20 border-end">Quantity</th>
                      <th className="h6 fw-bold px-40 py-20 border-end">Price</th>
                      <th className="h6 fw-bold px-40 py-20 border-end">Status</th>
                      <th className="h6 fw-bold px-40 py-20">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order) =>
                        order.products.map((product, index) => (
                          <tr
                            key={`${order._id}-${index}`}
                            className="border-bottom border-neutral-100"
                          >
                            <td className="px-40 py-20 text-sm fw-semibold text-gray-700">
                              {order._id}
                            </td>
                            <td className="px-40 py-20 border-end">
                              <div className="d-flex align-items-center gap-16">
                                <div>
                                  <div className="fw-semibold text-gray-900">
                                    {product.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-40 py-20 border-end text-gray-700">
                              {product.seller?.name || "Unknown"}
                            </td>
                            <td className="px-40 py-20 border-end">
                              {product.quantity}
                            </td>
                            <td className="px-40 py-20 border-end">
                              {/* ₹{(product.price * product.quantity).toFixed(2)} */}
                              ₹{order.amount}
                            </td>
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
                            <td className="px-40 py-20 text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-40">
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </section>
  );
};

export default WishListSection;
