import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./SellerList.css";

const ProductDetailsOne = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // Number of sellers per page

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/seller/seller-list`
        );

        if (res.data.success) {
          // ✅ Filter only active sellers
          const activeSellers = res.data.data.filter((seller) => seller.status);
          setSellers(activeSellers);
        } else {
          toast.error("Failed to fetch sellers");
        }
      } catch (err) {
        toast.error("Error fetching seller list");
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  const handleSellerClick = (sellerId) => {
    // ✅ Navigate to that seller’s product page
    navigate(`/seller/${sellerId}/products`);
  };

  // ✅ Pagination logic
  const totalPages = Math.ceil(sellers.length / pageSize);
  const paginatedSellers = sellers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="seller-container">
      <ToastContainer />
      <h2 className="page-title">Active Sellers</h2>

      {paginatedSellers.length === 0 ? (
        <p className="no-sellers">No active sellers found.</p>
      ) : (
        <>
          <div className="seller-grid">
            {paginatedSellers.map((seller) => (
              <div
                className="seller-card clickable"
                key={seller._id}
                onClick={() => handleSellerClick(seller._id)}
              >
                <div className="seller-avatar-wrapper">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/219/219983.png"
                    alt={seller.name}
                    className="seller-avatar"
                  />
                  <span className="seller-status-badge active">Active</span>
                </div>

                <div className="seller-info">
                  <h3 className="seller-name">{seller.name}</h3>
                  <p className="seller-email">{seller.email}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Pagination Controls */}
          {sellers.length > pageSize && (
            <div className="pagination-controls">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductDetailsOne;
