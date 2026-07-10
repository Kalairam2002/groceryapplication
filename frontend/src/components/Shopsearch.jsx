import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const Shopsearch = ({ id }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFiltered, setSearchFiltered] = useState([]);
  const [grid, setGrid] = useState(false);
  const [active, setActive] = useState(false);

  // ⭐ VARIANT STATE
  const [selectedVariants, setSelectedVariants] = useState({});

  const sidebarController = () => setActive(!active);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get("product") || "";
        console.log("Search Query:", searchQuery);
  
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/search?name=${searchQuery}`
        );

        console.log("Response:", response.data);
  
        if (response.data.success) {
          setSearchFiltered(response.data.products || []);
        }
      } catch (error) {
        console.error("Search Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);


  // Fetch subcategories
  const { data: subcategories, isLoading: issubCategoryLoading } = useQuery({
    queryKey: ["subcategorieskey", id],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/test/getsubcategorydata/${id}`
      );
      return res.data;
    },
    enabled: !!id,
  });

  // ⭐ VARIANT CHANGE HANDLER
  const handleVariantChange = (productId, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  // ADD TO CART
  const handleAddToCart = (product) => {
    const user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;

    if (!user) {
      alert("Please login to add products to cart");
      navigate("/account");
      return;
    }

    // ⭐ Use selected variant or fallback to first variant
    const selectedVariant =
      selectedVariants[product._id] || product.variants?.[0];

    const cart = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];

    const existingProductIndex = cart.findIndex(
      (p) =>
        p._id === product._id &&
        p.variant?._id === selectedVariant?._id
    );

    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity += 1;
    } else {
      cart.push({ ...product, variant: selectedVariant, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success(`${product.name} added to cart!`);
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <h4>Loading products...</h4>
      </div>
    );
  }

  return (
    <section className="shop py-80">
      <div className={`side-overlay ${active && "show"}`}></div>
      <div className="container container-lg">
        <div className="row">
          {/* Content Start */}
          <div className="col-lg-12">
            <div className="flex-between gap-16 flex-wrap mb-40">
              <span className="text-gray-900">
                <b>Search Product's</b>
              </span>
              <div className="position-relative flex-align gap-16 flex-wrap">
                <div className="list-grid-btns flex-align gap-16">
                  <button
                    onClick={() => setGrid(true)}
                    type="button"
                    className={`w-44 h-44 flex-center border rounded-6 text-2xl list-btn border-gray-100 ${
                      grid && "border-main-600 text-white bg-main-600"
                    }`}
                  >
                    <i className="ph-bold ph-list-dashes" />
                  </button>
                  <button
                    onClick={() => setGrid(false)}
                    type="button"
                    className={`w-44 h-44 flex-center border rounded-6 text-2xl grid-btn border-gray-100 ${
                      !grid && "border-main-600 text-white bg-main-600"
                    }`}
                  >
                    <i className="ph ph-squares-four" />
                  </button>
                </div>
              </div>
            </div>

            <div className={`list-grid-wrapper ${grid && "list-view"}`}>
              <div className="row gy-4 g-12">
                {searchFiltered && searchFiltered.length > 0 ? (
                  searchFiltered.map((product) => {
                    // ⭐ Get selected variant or default to first variant
                    const variant =
                      selectedVariants[product._id] || product.variants?.[0];

                    return (
                      <div
                        key={product._id}
                        className="col-xxl-2 col-lg-3 col-sm-4 col-6"
                      >
                        {/* CARD */}
                        <div
                          style={{
                            borderRadius: "16px",
                            border: "1px solid #eee",
                            padding: "14px",
                            background: "#fff",
                            transition: "0.3s",
                            height: "100%",
                            position: "relative",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.boxShadow =
                              "0 10px 25px rgba(0,0,0,0.15)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.boxShadow =
                              "0 2px 8px rgba(0,0,0,0.05)")
                          }
                        >
                          {/* ADD BUTTON */}
                          <button
                            onClick={() => handleAddToCart(product)}
                            style={{
                              position: "absolute",
                              top: "14px",
                              right: "14px",
                              background: "#eef7ff",
                              color: "#007bff",
                              border: "none",
                              padding: "6px 14px",
                              borderRadius: "20px",
                              fontWeight: "600",
                              fontSize: "13px",
                              cursor: "pointer",
                              transition: "0.3s",
                            }}
                          >
                            + Add
                          </button>

                          {/* IMAGE */}
                          <Link to={`/varientlist/${product._id}`}>
                            <div
                              style={{
                                height: "170px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginBottom: "12px",
                              }}
                            >
                              <img
                                src={
                                  product.image?.[0] ||
                                  "/assets/images/thumbs/placeholder.jpg"
                                }
                                alt={product.name}
                                style={{
                                  maxHeight: "160px",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          </Link>

                          {/* PRODUCT INFO */}
                          <div>
                            {/* NAME */}
                            <h6
                              style={{
                                fontWeight: "600",
                                fontSize: "15px",
                                marginBottom: "4px",
                                minHeight: "38px",
                              }}
                            >
                              <Link
                                to={`/varientlist/${product._id}`}
                                className="link text-line-2"
                                style={{ color: "inherit", textDecoration: "none" }}
                              >
                                {product.name}
                              </Link>
                            </h6>

                            {/* SELLER */}
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#888",
                                marginBottom: "8px",
                              }}
                            >
                              Sold by: {product.seller?.name || "Vendor"}
                            </p>

                            {/* ⭐ VARIANT DROPDOWN */}
                            {product.variants && product.variants.length > 0 ? (
                              <select
                                style={{
                                  width: "100%",
                                  padding: "6px",
                                  borderRadius: "8px",
                                  border: "1px solid #ddd",
                                  marginBottom: "10px",
                                  fontSize: "13px",
                                  background: "#fafafa",
                                  cursor: "pointer",
                                }}
                                value={variant?._id || ""}
                                onChange={(e) => {
                                  const selected = product.variants.find(
                                    (v) => v._id === e.target.value
                                  );
                                  handleVariantChange(product._id, selected);
                                }}
                              >
                                {product.variants.map((v) => (
                                  <option key={v._id} value={v._id}>
                                    {v.quantity} {v.unit} — ₹{v.offerPrice ?? v.price}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "10px" }}>
                                No variants available
                              </p>
                            )}

                            {/* ⭐ PRICE */}
                            {variant && (
                              <div style={{ marginBottom: "6px" }}>
                                {variant.offerPrice < variant.price && (
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      color: "#999",
                                      marginRight: "8px",
                                      fontSize: "13px",
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
                                  ₹{variant.offerPrice ?? variant.price}
                                </span>
                              </div>
                            )}

                            {/* ⭐ STOCK BADGE */}
                            {variant && (
                              <div
                                style={{
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  background: variant.stock > 0 ? "#e8f8f0" : "#ffecec",
                                  color: variant.stock > 0 ? "#28a745" : "#dc3545",
                                }}
                              >
                                {variant.stock > 0
                                  ? `In Stock (${variant.stock})`
                                  : "Out of Stock"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-12 text-center">
                    <h5>No products available</h5>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Content End */}
        </div>
      </div>
    </section>
  );
};

export default Shopsearch;
