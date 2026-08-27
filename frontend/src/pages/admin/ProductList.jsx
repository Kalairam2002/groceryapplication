import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductList = () => {
  // Same rule used across the storefront and seller pages: stock is
  // always a plain piece count, so a flat threshold applies to every
  // product type (electronics, clothing, grocery, etc).
  const LOW_STOCK_THRESHOLD = 15;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/getProductList`
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

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

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

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
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
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, index) => {
                  // Price/offer price come from the first pricing variant —
                  // there's no top-level price on the product itself.
                  const firstVariant = product.variants?.[0] || {};
                  const variantCount = product.variants?.length || 0;

                  // Stock is a plain piece count per variant — never
                  // grouped by unit/spec (a variant's unit like "Kg" or
                  // "Size" describes what that variant IS, not how stock
                  // is counted). Total is a simple sum; per-variant flags
                  // catch a low variant even if the total still looks fine.
                  const variants = product.variants || [];
                  const totalStockCount = variants.reduce(
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
                  // "pack" only makes sense for weight/volume/count specs
                  // (500 Gm, 7 Kg, 42 Inch); size-based variants read as
                  // "Size S", not "S pack".
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
                              const s = Number(v.stock) || 0;
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