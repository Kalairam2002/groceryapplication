import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const ProductList = () => {
  const LOW_STOCK_THRESHOLD = 15;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/getProductList`,
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setDeletingId(id);
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/product/${id}`,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("✅ Product deleted successfully!");
        setProducts(products.filter((p) => p._id !== id));
      } else {
        toast.error("❌ Failed to delete product");
      }
    } catch (err) {
      toast.error("❌ Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <AdminLayout page="product-list">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Catalogue / Products</span>
            <h4>Product list</h4>
            <p className="subtitle">Everything listed across all vendors</p>
          </div>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name..."
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "10px 16px",
            borderRadius: "999px",
            border: "1px solid #E4E7F0",
            background: "#fff",
            fontSize: "13.5px",
            outline: "none",
            marginBottom: "20px",
            boxSizing: "border-box",
          }}
        />

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : filteredProducts.length === 0 ? (
          <p style={{ color: "#6B7280" }}>No products match "{searchTerm}".</p>
        ) : (
          <div className="table-card">
            <table className="classic-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Seller</th>
                  <th>Price</th>
                  <th>Offer price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, index) => {
                  const firstVariant = product.variants?.[0] || {};
                  const variantCount = product.variants?.length || 0;

                  const variants = product.variants || [];
                  const getStock = (v) =>
                    v.batches && v.batches.length > 0
                      ? v.batches.reduce((sum, b) => sum + (Number(b.stock) || 0), 0)
                      : Number(v.stock) || 0;
                  const totalStockCount = variants.reduce((sum, v) => sum + getStock(v), 0);
                  const hasOutOfStockVariant = variants.some((v) => getStock(v) <= 0);
                  const hasLowStockVariant = variants.some((v) => {
                    const s = getStock(v);
                    return s > 0 && s < LOW_STOCK_THRESHOLD;
                  });
                  const variantLabel = (v) =>
                    v.sizeLabel ||
                    (v.quantity ? `${v.quantity} ${v.unit}` : v.unit || "");
                  const variantChipLabel = (v) =>
                    v.sizeLabel ? `Size ${v.sizeLabel}` : `${variantLabel(v)} pack`;

                  return (
                    <tr key={product._id}>
                      <td className="mono-cell">{indexOfFirstItem + index + 1}</td>
                      <td>
                        {product.image?.[0] ? (
                          <img src={product.image[0]} alt={product.name} className="thumb-img" />
                        ) : (
                          <span className="img-placeholder">N/A</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 500 }}>{product.name}</td>
                      <td>{product.brand?.name || product.brand || "N/A"}</td>
                      <td>{product.seller?.name || "N/A"}</td>
                      <td className="price-cell">₹{firstVariant.price ?? "—"}</td>
                      <td className="price-cell">
                        {firstVariant.offerPrice ? (
                          <span className="price-offer">₹{firstVariant.offerPrice}</span>
                        ) : (
                          <span className="muted-small">—</span>
                        )}
                        {variantCount > 1 && (
                          <span className="muted-small" style={{ marginLeft: "6px" }}>
                            ({variantCount} variants)
                          </span>
                        )}
                      </td>
                      <td>
                        {variantCount <= 1 ? (
                          totalStockCount <= 0 ? (
                            <span className="badge badge-red">✕ Out of stock</span>
                          ) : hasLowStockVariant ? (
                            <span className="badge badge-amber">⚠ Only {totalStockCount} {firstVariant.stockUnit || firstVariant.unit || ""} left</span>
                          ) : (
                            <span className="badge badge-green">✓ In stock ({totalStockCount} {firstVariant.stockUnit || firstVariant.unit || ""})</span>
                          )
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {variants.map((v) => {
                              const s = getStock(v);
                              const cls =
                                s <= 0 ? "badge-red" : s < LOW_STOCK_THRESHOLD ? "badge-amber" : "badge-green";
                              const icon = s <= 0 ? "✕" : s < LOW_STOCK_THRESHOLD ? "⚠" : "✓";
                              return (
                                <span key={v._id} className={`badge ${cls}`} style={{ whiteSpace: "nowrap" }}>
                                  {icon} {variantChipLabel(v)} — {s <= 0 ? "out of stock" : `${s} ${v.stockUnit || v.unit || ""} left`}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="seller-btn-edit"
                            style={{ whiteSpace: "nowrap", minWidth: "60px", padding: "6px 10px" }}
                            onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="seller-btn-delete"
                            style={{ whiteSpace: "nowrap", minWidth: "60px", padding: "6px 10px" }}
                            disabled={deletingId === product._id}
                            onClick={() => handleDelete(product._id)}
                          >
                            {deletingId === product._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

export default ProductList;