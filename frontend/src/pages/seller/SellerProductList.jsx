import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Barcode from "react-barcode";

const SellerProductList = () => {
  // Same rule used across the storefront and seller dashboard: stock is
  // always a plain piece count, so a flat threshold applies to every
  // product type (electronics, clothing, grocery, etc).
  const LOW_STOCK_THRESHOLD = 15;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // ================= FETCH PRODUCTS =================
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

  // ================= FETCH CATEGORIES =================
  const { data: categoryData = [] } = useQuery({
    queryKey: ["categoryData"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admindata/Category`
      );
      return data.categories || [];
    },
  });

  // ================= DELETE PRODUCT =================
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
      toast.error("❌ Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  // ================= SEARCH + PAGINATION =================
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <p>Loading products...</p>;

  return (
    <SellerLayout page="product-list">
      <div className="product-list-container">
        <div style={{ marginBottom: "1.25rem" }}>
          <span style={{ display: "block", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#3B4C8A", marginBottom: "6px" }}>
            Catalogue / Products
          </span>
          <h4 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: "600", color: "#1E2233" }}>My Products</h4>
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

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : filteredProducts.length === 0 ? (
          <p style={{ color: "#6B7280" }}>No products match "{searchTerm}".</p>
        ) : (
          <>
            <div className="product-grid">
              {currentProducts.map((product) => {
                const categoryName =
                  categoryData.find(
                    (c) => String(c._id) === String(product.category)
                  )?.name || "Unknown Category";

                // Price/offer price come from the first pricing variant —
                // there's no top-level price on the product itself.
                const firstVariant = product.variants?.[0] || {};
                const variantCount = product.variants?.length || 0;

                // Stock is a plain piece count per variant — never grouped
                // by unit/spec (a variant's unit like "Kg" or "Size" only
                // describes what that variant IS, not how stock is counted).
                // Total is a simple sum; each variant's own count is shown
                // separately so a low variant never gets averaged away.
                const variants = product.variants || [];
                const totalStock = variants.reduce(
                  (sum, v) => sum + (Number(v.stock) || 0),
                  0
                );
                const hasOutOfStockVariant = variants.some(
                  (v) => (Number(v.stock) || 0) <= 0
                );
                const hasLowStockVariant = variants.some((v) => {
                  const s = Number(v.stock) || 0;
                  return s > 0 && s < LOW_STOCK_THRESHOLD;
                });
                const variantLabel = (v) =>
                  v.sizeLabel ||
                  (v.quantity ? `${v.quantity} ${v.unit}` : v.unit || "");
                // Chip wording differs by variant type — "pack" only makes
                // sense for weight/volume/count specs (500 Gm, 7 Kg, 42
                // Inch); size-based variants (clothing, shoes) read as
                // "Size S", not "S pack".
                const variantChipLabel = (v) =>
                  v.sizeLabel ? `Size ${v.sizeLabel}` : `${variantLabel(v)} pack`;

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
                      Price: ₹{firstVariant.price ?? "—"}{" "}
                      {firstVariant.offerPrice && (
                        <span className="offer-price">
                          Offer: ₹{firstVariant.offerPrice}
                        </span>
                      )}
                      {variantCount > 1 && (
                        <span style={{ fontSize: "11px", color: "#6B7280", marginLeft: "6px" }}>
                          ({variantCount} variants)
                        </span>
                      )}
                    </p>

                    {/* 🔥 BARCODE IMAGE GENERATED FROM BARCODE NUMBER */}
                    {product.barcode && (
                      <div
                        style={{
                          margin: "10px 0",
                          padding: "8px",
                          backgroundColor: "#f9fafb",
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Barcode
                          value={product.barcode}
                          height={45}
                          width={1}
                          fontSize={12}
                        />
                      </div>
                    )}

                    {variantCount <= 1 ? (
                      <p className="product-stock" style={{ margin: "6px 0 2px" }}>
                        {totalStock <= 0 ? (
                          <span style={{ color: "#791F1F", fontWeight: 600, background: "#FCEBEB", padding: "3px 8px", borderRadius: "12px", fontSize: "12px" }}>
                            ✕ Out of stock
                          </span>
                        ) : hasLowStockVariant ? (
                          <span style={{ color: "#854F0B", fontWeight: 600, background: "#FAEEDA", padding: "3px 8px", borderRadius: "12px", fontSize: "12px" }}>
                            ⚠ Only {totalStock} {firstVariant.stockUnit || firstVariant.unit || ""} left
                          </span>
                        ) : (
                          <span style={{ color: "#1F7A4D", fontWeight: 600, background: "#E6F4EC", padding: "3px 8px", borderRadius: "12px", fontSize: "12px" }}>
                            ✓ In stock ({totalStock} {firstVariant.stockUnit || firstVariant.unit || ""})
                          </span>
                        )}
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "6px 0 2px" }}>
                        {variants.map((v) => {
                          const s = Number(v.stock) || 0;
                          const style =
                            s <= 0
                              ? { color: "#791F1F", background: "#FCEBEB" }
                              : s < LOW_STOCK_THRESHOLD
                              ? { color: "#854F0B", background: "#FAEEDA" }
                              : { color: "#1F7A4D", background: "#E6F4EC" };
                          const icon = s <= 0 ? "✕" : s < LOW_STOCK_THRESHOLD ? "⚠" : "✓";
                          return (
                            <span
                              key={v._id}
                              style={{
                                ...style,
                                fontWeight: 600,
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {icon} {variantChipLabel(v)} — {s <= 0 ? "out of stock" : `${s} ${v.stockUnit || v.unit || ""} left`}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="product-actions">
                      <button
                        className="seller-btn-edit"
                        onClick={() =>
                          navigate(
                            `/seller/edit-product/${product._id}`
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="seller-btn-delete"
                        disabled={deletingId === product._id}
                        onClick={() => handleDelete(product._id)}
                      >
                        {deletingId === product._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ================= PAGINATION ================= */}
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) => prev - 1)
                }
              >
                ◀ Prev
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={
                    currentPage === index + 1 ? "active" : ""
                  }
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => prev + 1)
                }
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