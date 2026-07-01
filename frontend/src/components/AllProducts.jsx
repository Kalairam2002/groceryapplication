import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const AllProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Variant State
  const [selectedVariants, setSelectedVariants] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/list`
        );
        if (res.data.success) {
          setProducts(res.data.products || []);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ================= VARIANT CHANGE =================
  const handleVariantChange = (productId, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  // ================= ADD TO CART =================
  const handleAddToCart = (product) => {
    if (!user) {
      alert("Please login first");
      navigate("/account");
      return;
    }

    const variant =
      selectedVariants[product._id] || product.variants?.[0];

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingIndex = cart.findIndex(
      (p) =>
        p._id === product._id &&
        p.variant?._id === variant?._id
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        ...product,
        variant,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Added to cart!");
    navigate("/cart");
  };

  // ================= PAGINATION =================
  const indexLast = currentPage * productsPerPage;
  const indexFirst = indexLast - productsPerPage;
  const currentProducts = products.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(products.length / productsPerPage);

  if (loading) return <h4 className="text-center py-5">Loading...</h4>;

  return (
    <section className="py-5">
      <div className="container">

        <h3 className="fw-bold mb-4">All Products</h3>

        <div className="row g-4">
          {currentProducts.map((product) => {
            const variant =
              selectedVariants[product._id] || product.variants?.[0];

            return (
              <div key={product._id} className="col-lg-3 col-md-4 col-6">

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "16px",
                    padding: "15px",
                    background: "#fff",
                    height: "100%",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    position: "relative",
                  }}
                >
                  {/* ADD BUTTON */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#eef7ff",
                      color: "#007bff",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    + Add
                  </button>

                  {/* IMAGE */}
                  <div
                    style={{
                      height: "170px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Link to={`/product-details/${product._id}`}>
                      <img
                        src={
                          product.image?.[0] ||
                          "/assets/images/thumbs/placeholder.jpg"
                        }
                        alt={product.name}
                        style={{ maxHeight: "160px", objectFit: "contain" }}
                      />
                    </Link>
                  </div>

                  {/* NAME */}
                  <h6 style={{ fontWeight: "600", fontSize: "15px" }}>
                    {product.name}
                  </h6>

                  <p style={{ fontSize: "12px", color: "#888" }}>
                    Sold by: {product.seller?.name || "Vendor"}
                  </p>

                  {/* VARIANT SELECT */}
                  <select
                    style={{
                      width: "100%",
                      padding: "6px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      marginBottom: "10px",
                    }}
                    value={variant?._id}
                    onChange={(e) => {
                      const selected = product.variants.find(
                        (v) => v._id === e.target.value
                      );
                      handleVariantChange(product._id, selected);
                    }}
                  >
                    {product.variants?.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.quantity} {v.unit} — ₹{v.offerPrice || v.price}
                      </option>
                    ))}
                  </select>

                  {/* PRICE */}
                  <div>
                    {variant.offerPrice < variant.price && (
                      <span
                        style={{
                          textDecoration: "line-through",
                          color: "#999",
                          marginRight: "6px",
                        }}
                      >
                        ₹{variant.price}
                      </span>
                    )}

                    <span
                      style={{
                        fontWeight: "700",
                        fontSize: "18px",
                        color: "#28a745",
                      }}
                    >
                      ₹{variant.offerPrice}
                    </span>
                  </div>

                  {/* STOCK */}
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background:
                        variant.stock > 0 ? "#e8f8f0" : "#ffecec",
                      color:
                        variant.stock > 0 ? "#28a745" : "#dc3545",
                    }}
                  >
                    {variant.stock > 0
                      ? `In Stock (${variant.stock})`
                      : "Out of Stock"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="text-center mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                margin: "5px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                background:
                  currentPage === i + 1 ? "#28a745" : "#ddd",
                color: currentPage === i + 1 ? "#fff" : "#000",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllProducts;
