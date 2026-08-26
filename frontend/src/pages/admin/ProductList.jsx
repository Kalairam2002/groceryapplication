import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductList = () => {
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

                  // Stock is tracked per-variant with its own unit
                  // (Kg/Ltr/Pcs/Gm) — group and sum within each unit rather
                  // than adding raw numbers across different units.
                  const stockByUnit = {};
                  (product.variants || []).forEach((v) => {
                    const unit = v.stockUnit || v.unit || "";
                    stockByUnit[unit] = (stockByUnit[unit] || 0) + (Number(v.stock) || 0);
                  });
                  const stockEntries = Object.entries(stockByUnit);
                  const totalStockCount = stockEntries.reduce((sum, [, qty]) => sum + qty, 0);

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
                        {stockEntries.length > 0 ? (
                          <span className={`badge ${totalStockCount > 10 ? "badge-green" : totalStockCount > 0 ? "badge-amber" : "badge-red"}`}>
                            {stockEntries.map(([unit, qty], i) => (
                              <span key={unit}>
                                {qty} {unit || "units"}
                                {i < stockEntries.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="badge badge-red">Out of stock</span>
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