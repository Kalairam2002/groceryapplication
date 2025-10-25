import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const SellerProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/product/list/seller`,
        { withCredentials: true }
      );
      if (data.success) setProducts(data.products || []);
    } catch (error) {
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch categories for name lookup
  const { data: categoryData = [] } = useQuery({
    queryKey: ["categoryData"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admindata/Category`
      );
      return data.categories || [];
    },
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      setDeletingId(id);
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/product/${id}`
      );
      if (data.success) {
        toast.success("✅ Product deleted successfully!");
        setProducts(products.filter((p) => p._id !== id));
      } else {
        toast.error("❌ Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  if (loading) return <p>Loading products...</p>;

  return (
    <SellerLayout page="product-list">
      <div className="product-list-container">
        <h4 className="mb-4">My Products</h4>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <>
            <div className="product-grid">
              {currentProducts.map((product) => {
                const categoryName =
                  categoryData.find((c) => String(c._id) === String(product.category))
                    ?.name || "Unknown Category";

                return (
                  <div key={product._id} className="product-card">
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className="product-image"
                    />
                    <h5 className="product-name">{product.name}</h5>
                    <p className="product-brand">{categoryName}</p>
                    <p className="product-price">
                      Price: ₹{product.price}{" "}
                      {product.offerPrice && (
                        <span className="offer-price">Offer: ₹{product.offerPrice}</span>
                      )}
                    </p>
                    <p className="product-stock">
                      Stock: {product.stock}{" "}
                      {product.stock < 10 && (
                        <span className="low-stock-alert">⚠️ Low Stock</span>
                      )}
                    </p>
                    <div className="product-actions">
                      <button
                        className="btn btn-edit"
                        onClick={() => navigate(`/seller/edit-product/${product._id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        disabled={deletingId === product._id}
                        onClick={() => handleDelete(product._id)}
                      >
                        {deletingId === product._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                ◀ Prev
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next ▶
              </button>
            </div>
          </>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </SellerLayout>
  );
};

export default SellerProductList;
