import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Slider from "react-slick";

const ProductListOne = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  });

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // ✅ KEY LOGIC: Get the best valid variant for a product
  // Groups variants by quantity+unit, picks earliest non-expired, in-stock variant
  const getBestVariant = (variants) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter: stock > 0 AND (no expiryDate OR expiryDate >= today)
    const validVariants = variants.filter((v) => {
      if (v.stock <= 0) return false;
      if (v.expiryDate) {
        const expiry = new Date(v.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        if (expiry < today) return false;
      }
      return true;
    });

    if (validVariants.length === 0) return null;

    // Sort by earliest expiryDate first (null expiryDate goes last)
    validVariants.sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });

    return validVariants[0];
  };

  // ✅ KEY LOGIC: Group variants by quantity+unit, get best per group
  const getGroupedVariants = (variants) => {
    const groups = {};

    variants.forEach((v) => {
      const key = `${v.quantity}_${v.unit}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    });

    // For each group, pick the best valid variant
    const groupedOptions = [];
    Object.entries(groups).forEach(([key, groupVariants]) => {
      const best = getBestVariant(groupVariants);
      if (best) groupedOptions.push(best); // only add if valid variant exists
    });

    return groupedOptions;
  };

  const handleVariantChange = (productId, variant) => {
    setSelectedVariant((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  const handleWishlist = (product) => {
    if (!user) {
      alert("Please login to add products to wishlist");
      navigate("/account");
      return;
    }
    const existing = wishlist.find((item) => item._id === product._id);
    let updatedWishlist;
    if (existing) {
      updatedWishlist = wishlist.filter((item) => item._id !== product._id);
      toast.info("Removed from wishlist!");
    } else {
      updatedWishlist = [
        ...wishlist,
        {
          _id: product._id,
          name: product.name,
          image: product.image[0],
          variants: product.variants,
        },
      ];
      toast.success("Added to wishlist! ❤️");
    }
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const isWishlisted = (productId) =>
    wishlist.some((item) => item._id === productId);

  const handleAddToCart = (product) => {
    if (!user) {
      alert("Please login to add products to cart");
      navigate("/account");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex(
      (item) =>
        item._id === product._id &&
        item.variant._id === product.selectedVariant._id
    );
    if (existingIndex !== -1) {
      cart[existingIndex].cartQty += 1;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        image: product.image[0],
        seller: product.seller,
        variant: product.selectedVariant,
        cartQty: 1,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Added to cart!");
    navigate("/cart");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/list`
        );
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const isSizeVariant = (variant) =>
    variant.sizeLabel || ["Size", "Waist", "Shoe-Size"].includes(variant.unit);

  const getVariantLabel = (variant) => {
    if (variant.sizeLabel) return `Size: ${variant.sizeLabel} — ₹${variant.offerPrice || variant.price}`;
    if (isSizeVariant(variant)) {
      const label = variant.quantity ? `${variant.unit} ${variant.quantity}` : variant.unit;
      return `${label} — ₹${variant.offerPrice || variant.price}`;
    }
    return `${variant.quantity} ${variant.unit} — ₹${variant.offerPrice || variant.price}`;
  };

  const getVariantPriceLabel = (variant) => {
    if (variant.sizeLabel) return `/ ${variant.sizeLabel}`;
    if (isSizeVariant(variant)) return variant.quantity ? `/ ${variant.unit} ${variant.quantity}` : `/ ${variant.unit}`;
    return `/ ${variant.quantity} ${variant.unit}`;
  };

  // ✅ Unit to show next to the stock count — stockUnit is the newer field
  // (added on the seller/admin Add Product forms); older products may not
  // have it saved, so fall back to the variant's own quantity unit.
  const getStockUnitLabel = (variant) => variant.stockUnit || variant.unit || "";

  // ✅ Low-stock badge shown on the product image, based on whichever
  // variant is currently selected in the dropdown for this card.
  const LOW_STOCK_THRESHOLD = 5;
  const getStockBadge = (variant) => {
    if (!variant) return null;
    if (variant.stock <= 0) return { text: "Out of stock", tone: "danger" };
    if (variant.stock < LOW_STOCK_THRESHOLD)
      return { text: `Only ${variant.stock} left`, tone: "warning" };
    return null;
  };

  const formatExpiryDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date)) return null;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
  };

  const SampleNextArrow = ({ onClick }) => (
    <div onClick={onClick} style={{ background: "white", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", right: "-20px", top: "40%", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.15)", zIndex: 2 }}>
      <i className="ph ph-caret-right" style={{ fontSize: "20px", color: "#333" }}></i>
    </div>
  );

  const SamplePrevArrow = ({ onClick }) => (
    <div onClick={onClick} style={{ background: "white", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", left: "-20px", top: "40%", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.15)", zIndex: 2 }}>
      <i className="ph ph-caret-left" style={{ fontSize: "20px", color: "#333" }}></i>
    </div>
  );

  const settings = {
    dots: false, arrows: true, infinite: true, speed: 600,
    slidesToShow: 5, slidesToScroll: 1,
    nextArrow: <SampleNextArrow />, prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 992, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  if (loading) return <div className="text-center py-5"><h4>Loading products...</h4></div>;

  return (
    <div style={{ padding: "50px 0", background: "#f8f9fa" }}>
      <div style={{ width: "100%", margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(to right, #56ab2f, #a8e063, #6bbf59, #9ce88f, #3a7d44)", padding: "40px 30px", borderRadius: "20px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "24px", color: "#333", fontWeight: "700" }}>Shop by Products</h2>
          </div>

          {products.length > 0 ? (
            <Slider {...settings}>
              {products.map((product) => {
                // ✅ Get valid grouped variants for this product
                const validVariants = getGroupedVariants(product.variants);

                // ✅ If NO valid variants → skip this product entirely
                if (validVariants.length === 0) return null;

                const defaultVariant = validVariants[0];
                const activeVariant = selectedVariant[product._id] || defaultVariant;
                const stockBadge = getStockBadge(activeVariant);

                return (
                  <div key={product._id} style={{ padding: "10px" }}>
                    <div style={{ background: "#fff", borderRadius: "18px", boxShadow: "0 6px 18px rgba(0,0,0,0.08)", padding: "18px", textAlign: "center", minHeight: "430px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>

                      {/* WISHLIST ICON */}
                      <div onClick={() => handleWishlist(product)} style={{ position: "absolute", top: "12px", right: "12px", cursor: "pointer", fontSize: "22px", color: isWishlisted(product._id) ? "#e74c3c" : "#ccc", transition: "color 0.2s ease", zIndex: 1 }} title={isWishlisted(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}>
                        {isWishlisted(product._id) ? "❤️" : "🤍"}
                      </div>

                      {/* IMAGE */}
                      <div style={{ height: "160px", position: "relative" }}>
                        {stockBadge && (
                          <span
                            style={{
                              position: "absolute",
                              top: "0",
                              left: "0",
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "3px 8px",
                              borderRadius: "6px",
                              color: stockBadge.tone === "danger" ? "#791F1F" : "#633806",
                              background: stockBadge.tone === "danger" ? "#FCEBEB" : "#FAEEDA",
                              zIndex: 1,
                            }}
                          >
                            {stockBadge.text}
                          </span>
                        )}
                        <img
                          src={product.image?.[0]}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            opacity: stockBadge?.tone === "danger" ? 0.55 : 1,
                          }}
                        />
                      </div>

                      {/* NAME */}
                      <h4 style={{ fontSize: "16px", margin: "10px 0" }}>{product.name}</h4>

                      {/* PRICE */}
                      <div style={{ background: "#f5f7f6", padding: "12px", borderRadius: "10px", marginBottom: "10px" }}>
                        <h3 style={{ color: "#28a745", margin: 0 }}>
                          ₹{activeVariant.offerPrice || activeVariant.price}
                          <span style={{ fontSize: "13px", color: "#777", marginLeft: "6px" }}>{getVariantPriceLabel(activeVariant)}</span>
                        </h3>
                        {activeVariant.price && activeVariant.offerPrice && activeVariant.price !== activeVariant.offerPrice && (
                          <p style={{ textDecoration: "line-through", color: "#999", fontSize: "13px", margin: 0 }}>₹{activeVariant.price}</p>
                        )}
                      </div>

                      {/* ✅ DROPDOWN — only valid grouped variants */}
                      <select
                        onChange={(e) => handleVariantChange(product._id, validVariants[e.target.value])}
                        style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "12px", cursor: "pointer" }}
                      >
                        {validVariants.map((variant, index) => (
                          <option key={variant._id} value={index}>
                            {getVariantLabel(variant)}
                          </option>
                        ))}
                      </select>

                      {/* INFO BOX */}
                      <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "10px", fontSize: "13px", textAlign: "left", marginBottom: "10px" }}>
                        <p style={{ margin: "3px 0" }}>📦 Stock: <b style={{ marginLeft: "5px" }}>{activeVariant.stock} {getStockUnitLabel(activeVariant)}</b></p>
                        <p style={{ margin: "3px 0" }}>💰 Tax: <b style={{ marginLeft: "5px" }}>{activeVariant.tax}%</b></p>
                        <p style={{ margin: "3px 0" }}>🏬 Seller: <b style={{ marginLeft: "5px" }}>{product.seller?.name || "N/A"}</b></p>
                        {/* ✅ Show expiry from variant level */}
                        {/* {activeVariant.expiryDate && (
                          <p style={{ margin: "3px 0" }}>📅 Expiry: <b style={{ marginLeft: "5px" }}>{formatExpiryDate(activeVariant.expiryDate)}</b></p>
                        )} */}
                      </div>

                      {/* ADD TO CART */}
                      <button
                        onClick={() => handleAddToCart({ ...product, selectedVariant: activeVariant })}
                        disabled={activeVariant.stock <= 0}
                        style={{
                          background: activeVariant.stock <= 0 ? "#ccc" : "linear-gradient(90deg,#3bb77e,#2eb872)",
                          color: "#fff",
                          border: "none",
                          padding: "10px",
                          borderRadius: "25px",
                          cursor: activeVariant.stock <= 0 ? "not-allowed" : "pointer",
                          fontWeight: "600",
                        }}
                      >
                        {activeVariant.stock <= 0 ? "Out of stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </Slider>
          ) : (
            <h4>No Products</h4>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListOne;