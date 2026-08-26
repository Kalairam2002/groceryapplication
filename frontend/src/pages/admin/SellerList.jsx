import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchSellers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/seller/seller-list`
      );
      if (data.success) setSellers(data.data || []);
    } catch (error) {
      toast.error("Error fetching sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleToggle = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/seller/update-status`,
        { id, status: updatedStatus }
      );
      if (data.success) {
        setSellers((prev) =>
          prev.map((seller) =>
            seller._id === id ? { ...seller, status: updatedStatus } : seller
          )
        );
        toast.success("Status updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this seller?")) return;

    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/seller/delete/${id}`
      );
      if (data.success) {
        setSellers((prev) => prev.filter((seller) => seller._id !== id));
        toast.success("Seller deleted successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete seller");
    }
  };

  const totalPages = Math.ceil(sellers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSellers = sellers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AdminLayout page="seller-list">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Network / Sellers</span>
            <h4>Seller list</h4>
            <p className="subtitle">Vendors selling on the marketplace</p>
          </div>
        </div>

        {loading ? (
          <p>Loading sellers...</p>
        ) : sellers.length === 0 ? (
          <p>No sellers found.</p>
        ) : (
          <div className="table-card">
            <table className="classic-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSellers.map((seller, index) => (
                  <tr key={seller._id}>
                    <td className="mono-cell">{indexOfFirstItem + index + 1}</td>
                    <td style={{ fontWeight: 500 }}>{seller.name}</td>
                    <td>{seller.email}</td>
                    <td>
                      <button
                        onClick={() => handleToggle(seller._id, seller.status)}
                        className={`badge ${seller.status ? "badge-red" : "badge-green"}`}
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        {seller.status ? "Inactive — click to activate" : "Active"}
                      </button>
                    </td>
                    <td>
                      <button className="icon-btn btn-delete" onClick={() => handleDelete(seller._id)} title="Delete seller">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, page) => (
                  <button
                    key={page + 1}
                    className={currentPage === page + 1 ? "active" : ""}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    {page + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default SellerList;