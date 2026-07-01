import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const Subcategorysection = ({ id }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFiltered, setSearchFiltered] = useState([]);
  const [grid, setGrid] = useState(false);

  // ⭐ Variant State
  const [selectedVariants, setSelectedVariants] = useState({});

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

  // ================= SEARCH FILTER =================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("product")?.toLowerCase() || "";

    if (query) {
      setSearchFiltered(
        products.filter((p) => p.name?.toLowerCase().includes(query))
      );
    } else {
      setSearchFiltered(products);
    }
  }, [location.search, products]);

  // ================= FETCH SUBCATEGORIES =================
  const { data: subcategoriesdata = [] } = useQuery({
    queryKey: ["subcategoriesdatakey"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subcategory`
      );
      return res.data || [];
    },
  });

  // ================= VARIANT CHANGE =================
  const handleVariantChange = (productId, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  // ================= ADD TO CART =================
  const handleAddToCart = (product) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      navigate("/account");
      return;
    }

    const selectedVariant =
      selectedVariants[product._id] || product.variants?.[0];

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingIndex = cart.findIndex(
      (p) =>
        p._id === product._id &&
        p.variant?._id === selectedVariant?._id
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        ...product,
        variant: selectedVariant,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Added to cart!");
    navigate("/cart");
  };

  if (loading) return <h4 className="text-center py-5">Loading...</h4>;

  const displayedProducts = id
    ? products.filter((p) => String(p.subcategory) === String(id))
    : searchFiltered;

  return (
    <section className="py-5">
      <div className="container">

                  <div className="flex-between gap-16 flex-wrap mb-40">
              <span className="text-gray-900">
                <b>Product List by Subcategorys</b>
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

        <div className="row g-4">

          {displayedProducts.map((product) => {
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
                    <img
                      src={
                        product.image?.[0] ||
                        "/assets/images/thumbs/placeholder.jpg"
                      }
                      alt={product.name}
                      style={{ maxHeight: "160px", objectFit: "contain" }}
                    />
                  </div>

                  {/* NAME */}
                  <h6 style={{ fontWeight: "600", fontSize: "15px" }}>
                    {product.name}
                  </h6>

                  <p style={{ fontSize: "12px", color: "#888" }}>
                    Sold by: {product.seller?.name || "Vendor"}
                  </p>

                  {/* VARIANT DROPDOWN */}
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

          {displayedProducts.length === 0 && (
            <h5 className="text-center">No Products Found</h5>
          )}
        </div>
      </div>
    </section>
  );
};

export default Subcategorysection;
