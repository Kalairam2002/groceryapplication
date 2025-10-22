import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const SellerProductList = () => {
  const navigate = useNavigate();
  const { id: sellerId } = useParams(); // ✅ get seller ID from URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // number of products per page

  // ✅ Get logged-in user from localStorage
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // ✅ Add to Cart handler
  const handleAddToCart = (product) => {
    if (!user) {
      alert("Please login to add products to cart");
      navigate("/account");
      return;
    }

    const cart = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];

    const existingProductIndex = cart.findIndex((p) => p.id === product._id);
    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    toast.success(`${product.name} added to cart!`);
    navigate("/cart");
  };

  // ✅ Fetch seller-specific products
  useEffect(() => {
    const fetchSellerProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/seller/${sellerId}`
        );
        if (response.data.success) {
          setProducts(response.data.data || []);
        } else {
          toast.error("Failed to fetch seller products");
        }
      } catch (error) {
        console.error("API Error:", error);
        toast.error("Error fetching products");
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) fetchSellerProducts();
  }, [sellerId]);

  // ✅ Pagination logic (frontend only)
  const totalPages = Math.ceil(products.length / pageSize);
  const paginatedProducts = products.slice(
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
      <div className="text-center py-5">
        <h4>Loading seller products...</h4>
      </div>
    );
  }

  return (
    <div className="product mt-24">
      <div className="container container-lg">
        <h3 className="mb-4 fw-bold text-center">Products by Seller</h3>

        <div className="row gy-4 g-12">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <div key={product._id} className="col-xxl-2 col-lg-3 col-sm-4 col-6">
                <div className="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8 position-absolute inset-block-start-0 inset-inline-end-0 me-16 mt-16"
                  >
                    Add <i className="ph ph-shopping-cart" />
                  </button>

                  {/* Product Image */}
                  <Link to="#" className="product-card__thumb flex-center">
                    <img
                      src={product.image?.[0] || "/assets/images/thumbs/placeholder.jpg"}
                      alt={product.name}
                      style={{ maxHeight: "180px", objectFit: "cover" }}
                    />
                  </Link>

                  <div className="product-card__content mt-12">
                    {/* Price */}
                    <div className="product-card__price mb-16">
                      {product.offerPrice && product.offerPrice < product.price && (
                        <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
                          ₹{product.price}
                        </span>
                      )}
                      <span className="text-heading text-md fw-semibold ms-2">
                        ₹{product.offerPrice || product.price}{" "}
                        <span className="text-gray-500 fw-normal">/{product.unit}</span>
                      </span>
                    </div>

                    {/* Product Title */}
                    <h6 className="title text-lg fw-semibold mt-12 mb-8">
                      <Link
                        to={`/product-details/${product._id}`}
                        className="link text-line-2"
                      >
                        {product.name}
                      </Link>
                    </h6>

                    {/* Stock Indicator */}
                    <div className="mt-12">
                      <div
                        className="progress w-100 bg-color-three rounded-pill h-4"
                        role="progressbar"
                        aria-valuenow={product.stock}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="progress-bar bg-main-600 rounded-pill"
                          style={{
                            width: `${Math.min((product.stock / 1000) * 100, 100)}%`,
                          }}
                        />
                      </div>

                      <span className="text-gray-900 text-xs fw-medium mt-8">
                        {product.inStock ? `In Stock: ${product.stock}` : "Out of Stock"}
                      </span>

                      {product.stock < 10 && product.stock > 0 && (
                        <p className="fw-semibold mt-1" style={{ color: "#d9534f" }}>
                          ⚠️ Low Stock
                        </p>
                      )}

                      <p className="text-sm text-gray-500">
                        {product.unit ? `Unit: ${product.unit}` : "Not specified"}
                      </p>

                      <p className="text-sm text-gray-500">
                        Sold by: <span className="fw-medium">{product.seller?.name || "Unknown Vendor"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <h5>No products available for this seller</h5>
            </div>
          )}
        </div>

        {/* Frontend Pagination Controls */}
        {products.length > pageSize && (
          <div className="d-flex justify-content-center mt-8 gap-4">
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="btn btn-outline-primary px-4 py-2">
              Previous
            </button>
            <span className="px-3 py-2 align-middle">
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="btn btn-outline-primary px-4 py-2">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProductList;
