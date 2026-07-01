import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
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

  // ✅ Delete seller function
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

  // pagination logic
  const totalPages = Math.ceil(sellers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSellers = sellers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AdminLayout page="seller-list">
      <div className="container mt-4">
        <h4 className="mb-4">Seller List</h4>

        {loading ? (
          <p>Loading sellers...</p>
        ) : sellers.length === 0 ? (
          <p>No sellers found.</p>
        ) : (
          <>
            <table className="classic-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th> {/* ✅ New column */}
                </tr>
              </thead>
              <tbody>
                {currentSellers.map((seller, index) => (
                  <tr key={seller._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{seller.name}</td>
                    <td>{seller.email}</td>
                    <td>
                      <button
                        onClick={() => handleToggle(seller._id, seller.status)}
                        style={{
                          backgroundColor: seller.status ? "red" : "green",
                          color: "white",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        {seller.status ? "Inactive" : "Active"}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(seller._id)}
                        style={{
                          backgroundColor: "#e74c3c",
                          color: "white",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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
          </>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default SellerList;
