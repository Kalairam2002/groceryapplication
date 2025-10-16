import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const SellerProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6; // adjust per page count

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/product/list/seller`,
        { withCredentials: true } // ✅ VERY IMPORTANT
      );
      if (data.success) setProducts(data.products || []);
    } catch (error) {
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch products on mount
  useEffect(() => {
    const getProducts = async () => {
      await fetchProducts();
    };
    getProducts();
  }, []);

  // ✅ Check for low stock after fetching
  useEffect(() => {
    if (!loading && products.length > 0) {
      const lowStockItems = products.filter((p) => p.stock < 10);
      if (lowStockItems.length > 0) {
        toast.warning(`⚠️ ${lowStockItems.length} product(s) are low on stock!`, {
          autoClose: 3000,
        });
      }
    }
  }, [loading, products]);

  const handleSaveEdit = async () => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/product/${editProduct._id}`,
        editProduct
      );

      if (data.success) {
        toast.success("✅ Product updated successfully!");
        setProducts(
          products.map((p) => (p._id === editProduct._id ? data.product : p))
        );
        setEditProduct(null);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("❌ Error updating product");
    }
  };

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

  // ✅ Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <SellerLayout page="product-list">
      <div className="product-list-container">
        <h4 className="mb-4">My Products</h4>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <>
            <div className="product-grid">
              {currentProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="product-image"
                  />
                  <h5 className="product-name">{product.name}</h5>
                  <p className="product-brand">{product.brand}</p>
                  <p className="product-price">
                    Price: ₹{product.price}{" "}
                    {product.offerPrice && (
                      <span className="offer-price">
                        Offer: ₹{product.offerPrice}
                      </span>
                    )}
                  </p>

                  {/* ✅ Low Stock Alert Visual */}
                  <p className="product-stock">
                    Stock: {product.stock}{" "}
                    {product.stock < 10 && (
                      <span className="low-stock-alert">⚠️ Low Stock</span>
                    )}
                  </p>

                  <div className="product-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() =>
                        navigate(`/seller/edit-product/${product._id}`)
                      }
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
              ))}
            </div>

            {/* ✅ Pagination Controls */}
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

      {editProduct && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h5>Edit Product</h5>
            <input
              type="text"
              value={editProduct.name}
              onChange={(e) =>
                setEditProduct({ ...editProduct, name: e.target.value })
              }
              placeholder="Product Name"
            />
            <input
              type="number"
              value={editProduct.price}
              onChange={(e) =>
                setEditProduct({ ...editProduct, price: e.target.value })
              }
              placeholder="Price"
            />
            <input
              type="number"
              value={editProduct.offerPrice}
              onChange={(e) =>
                setEditProduct({ ...editProduct, offerPrice: e.target.value })
              }
              placeholder="Offer Price"
            />
            <input
              type="number"
              value={editProduct.stock}
              onChange={(e) =>
                setEditProduct({ ...editProduct, stock: e.target.value })
              }
              placeholder="Stock"
            />
            <input
              type="text"
              value={editProduct.brand}
              onChange={(e) =>
                setEditProduct({ ...editProduct, brand: e.target.value })
              }
              placeholder="Brand"
            />

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setEditProduct(null)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </SellerLayout>
  );
};

export default SellerProductList;
