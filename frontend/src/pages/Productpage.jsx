import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import HeaderOne from "../components/HeaderOne";
import FooterOne from "../components/FooterOne";
import BottomFooter from "../components/BottomFooter";
import ProductListOne from "../components/ProductListOne";

// ─────────────────────────────────────────────────────────────────────────
// STATUS:
// - Cart & Wishlist are now REAL — mirrors ProductListOne.jsx's exact
//   localStorage logic ("cart" / "wishlist" keys, same object shapes,
//   same login-required redirect to /account) so this page behaves
//   identically to the home page cards, not a second parallel system.
// - Rating (stars + count) pulled from POST /api/review/summary — the
//   same endpoint ProductListOne.jsx already uses.
// - Reviews list below the description calls GET /api/review/product/:id
//   — this endpoint is GUESSED, not confirmed. If it 404s, paste your
//   reviewController.js/reviewRoute.js and I'll fix the path/shape.
//
// STILL OPEN:
// 1. ENDPOINT confirmed: GET /api/product/:id → getSingleProduct
// 2. `category` is a raw Category _id string on this schema (not a
//    populated ref) — so there's no name to show yet. This page hides it
//    rather than printing the ID. If you want the real name shown, either
//    (a) add a lookup here against whatever endpoint returns your category
//    list, matching by _id, or (b) change the backend to populate it.
// 3. Adjust the HeaderOne/FooterOne/BottomFooter import paths below if
//    your actual folder structure differs from "../components/".
// ─────────────────────────────────────────────────────────────────────────

const PRODUCT_ENDPOINT = (id) =>
  `${process.env.REACT_APP_API_URL}/api/product/${id}`;

const isObjectIdLike = (str) => typeof str === "string" && /^[0-9a-fA-F]{24}$/.test(str);

const getTotalStock = (variant) => {
  if (variant.batches && variant.batches.length > 0) {
    return variant.batches.reduce((sum, b) => sum + (Number(b.stock) || 0), 0);
  }
  return Number(variant.stock) || 0;
};

const getEarliestExpiry = (variant) => {
  if (variant.batches && variant.batches.length > 0) {
    const withStock = variant.batches.filter((b) => (b.stock || 0) > 0 && b.expiryDate);
    if (withStock.length === 0) return null;
    return withStock.reduce(
      (earliest, b) => (!earliest || new Date(b.expiryDate) < new Date(earliest) ? b.expiryDate : earliest),
      null
    );
  }
  return variant.expiryDate || null;
};

// A variant with no quantity/unit/sizeLabel has nothing meaningful to show
// as a pack-size row — skip it rather than render a blank one.
const getVariantLabel = (variant) => {
  if (variant.sizeLabel) return variant.sizeLabel;
  if (variant.quantity && variant.unit) return `${variant.quantity} ${variant.unit}`;
  if (variant.unit) return variant.unit;
  return "";
};

const renderDescription = (description) => {
  if (!Array.isArray(description) || description.length === 0) return null;
  return description.map((block, i) => {
    if (typeof block === "string") {
      return <p className="text-gray-600 mb-3" key={i} style={{ fontSize: 15, lineHeight: 1.7 }}>{block}</p>;
    }
    if (block && typeof block === "object") {
      return (
        <div key={i} className="mb-3">
          {block.title && <h6 className="mb-1" style={{ color: "hsl(var(--neutral))" }}>{block.title}</h6>}
          <p className="text-gray-600 mb-0" style={{ fontSize: 15, lineHeight: 1.7 }}>{block.text || block.value || ""}</p>
        </div>
      );
    }
    return null;
  });
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  // Same shape/keys as ProductListOne.jsx so cart/wishlist stay consistent
  // across the whole site (home page cards, cart page, wishlist page all
  // read these same localStorage keys).
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  });
  const [rating, setRating] = useState(null); // { avgRating, count }
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axios.get(PRODUCT_ENDPOINT(id));
      return res.data;
    },
    enabled: !!id,
  });

  const product = data?.product || data;
  const allVariants = product?.variants || [];
  const variants = useMemo(
    () => allVariants.filter((v) => getVariantLabel(v) !== ""),
    [allVariants]
  );
  const variant = variants[selectedVariantIdx] || null;

  useEffect(() => {
    setSelectedVariantIdx(0);
    setActiveImage(0);
    setQty(1);
  }, [id]);

  // Rating — same endpoint/shape ProductListOne.jsx already uses for the
  // home page cards, just called for this single product.
  useEffect(() => {
    if (!id) return;
    const fetchRating = async () => {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/review/summary`,
          { productIds: [id] }
        );
        if (res.data.success) {
          setRating(res.data.summary?.[id] || null);
        }
      } catch (err) {
        console.error("Rating summary error:", err);
      }
    };
    fetchRating();
  }, [id]);

  // Reviews list — GUESSED endpoint, see status note at top of file.
  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/review/product/${id}`
        );
        if (res.data.success) {
          setReviews(res.data.reviews || res.data.data || []);
        }
      } catch (err) {
        console.error("Reviews fetch error (endpoint may need confirming):", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  const totalStock = variant ? getTotalStock(variant) : 0;
  const earliestExpiry = variant ? getEarliestExpiry(variant) : null;

  const discountPct = useMemo(() => {
    if (!variant || !variant.price || !variant.offerPrice) return 0;
    if (variant.offerPrice >= variant.price) return 0;
    return Math.round((1 - variant.offerPrice / variant.price) * 100);
  }, [variant]);

  const inStock = product?.inStock && totalStock > 0;

  const sellerName =
    product?.seller && typeof product.seller === "object"
      ? product.seller.name || product.seller.shopName
      : null;
  const brandName =
    product?.brand && typeof product.brand === "object" ? product.brand.name : null;

  const readableCategory = product?.category && !isObjectIdLike(product.category) ? product.category : null;
  const readableSubcategory = product?.subcategory && !isObjectIdLike(product.subcategory) ? product.subcategory : null;

  const isWishlisted = product && wishlist.some((item) => item._id === product._id);

  const toggleWishlist = () => {
    if (!product) return;
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
        { _id: product._id, name: product.name, image: product.image?.[0], variants: product.variants },
      ];
      toast.success("Added to wishlist! ❤️");
    }
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const addToCart = () => {
    if (!inStock || !variant || !product) return;
    if (!user) {
      alert("Please login to add products to cart");
      navigate("/account");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex(
      (item) => item._id === product._id && item.variant._id === variant._id
    );
    if (existingIndex !== -1) {
      cart[existingIndex].cartQty += qty;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        image: product.image?.[0],
        seller: product.seller,
        variant,
        cartQty: qty,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Added to cart!");
    navigate("/cart");
  };

  const stepQty = (delta) => setQty((q) => Math.max(1, q + delta));

  const noop = () => {};

  if (isLoading) {
    return (
      <>
        <HeaderOne onRecommendedClick={noop} onBrandsClick={noop} />
        <div className="container py-5 text-center text-gray-500" style={{ minHeight: "50vh" }}>
          Loading product...
        </div>
        <FooterOne />
        <BottomFooter />
      </>
    );
  }

  if (isError || !product) {
    return (
      <>
        <HeaderOne onRecommendedClick={noop} onBrandsClick={noop} />
        <div className="container py-5 text-center" style={{ minHeight: "50vh" }}>
          <h5 style={{ color: "hsl(var(--neutral))" }} className="mb-2">We couldn't find this product</h5>
          <p className="text-gray-500 mb-4">It may have been removed or is no longer available.</p>
          <Link to="/" className="btn btn-main">Back to shop</Link>
        </div>
        <FooterOne />
        <BottomFooter />
      </>
    );
  }

  const images = product.image && product.image.length > 0 ? product.image : [];

  return (
    <>
      <HeaderOne onRecommendedClick={noop} onBrandsClick={noop} />

      <section style={{ background: "#fff", paddingTop: 24, paddingBottom: 64 }}>
        <div className="container">
          {/* Breadcrumb */}
          <nav className="mb-4 d-flex align-items-center" style={{ fontSize: 13.5 }}>
            <Link to="/" className="text-gray-500 text-decoration-none d-flex align-items-center gap-1">
              <i className="ph ph-house" style={{ fontSize: 14 }} /> Home
            </Link>
            {readableCategory && (
              <>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{readableCategory}</span>
              </>
            )}
            {readableSubcategory && (
              <>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{readableSubcategory}</span>
              </>
            )}
          </nav>

          <div className="row g-4 g-lg-5">
            {/* ── Gallery: vertical thumbnail rail + main image ── */}
            <div className="col-lg-6">
              <div className="d-flex gap-2">
                {images.length > 1 && (
                  <div className="d-flex flex-column gap-2" style={{ width: 64, flexShrink: 0 }}>
                    {images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className="p-0 bg-white"
                        style={{
                          width: 60,
                          height: 60,
                          border: i === activeImage ? "2px solid hsl(var(--main))" : "1px solid hsl(var(--border-color))",
                          borderRadius: 8,
                          cursor: "pointer",
                          overflow: "hidden",
                        }}
                      >
                        <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className="d-flex align-items-center justify-content-center position-relative flex-grow-1"
                  style={{
                    aspectRatio: "1 / 1",
                    background: "#fff",
                    border: "1px solid hsl(var(--border-color))",
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  {images.length > 0 ? (
                    <img
                      src={images[activeImage]}
                      alt={product.name}
                      style={{ maxWidth: "88%", maxHeight: "88%", objectFit: "contain" }}
                    />
                  ) : (
                    <span className="text-gray-400">No image available</span>
                  )}
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: 13, color: "hsl(var(--gray-500))" }}>
                Share on
                <i className="ph ph-facebook-logo" style={{ fontSize: 16 }} />
                <i className="ph ph-twitter-logo" style={{ fontSize: 16 }} />
                <i className="ph ph-envelope-simple" style={{ fontSize: 16 }} />
              </div>
            </div>

            {/* ── Purchase panel ── */}
            <div className="col-lg-6">
              {brandName && (
                <Link to="#" className="d-inline-block mb-1" style={{ fontSize: 14, color: "hsl(var(--main-800))", fontWeight: 500, textDecoration: "none" }}>
                  {brandName}
                </Link>
              )}
              {sellerName && (
                <p className="mb-1" style={{ fontSize: 12.5, color: "hsl(var(--gray-500))" }}>
                  Sold by {sellerName}
                </p>
              )}

              <h1
                style={{ fontFamily: "var(--heading-font)", fontSize: 24, fontWeight: 600, color: "hsl(var(--neutral))", marginBottom: 14 }}
              >
                {product.name}{variant ? `, ${getVariantLabel(variant)}` : ""}
              </h1>

              {rating && rating.count > 0 && (
                <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: 13.5 }}>
                  <span style={{ color: "#F2A623", letterSpacing: 1 }}>
                    {"★".repeat(Math.round(rating.avgRating))}
                    <span style={{ color: "#ddd" }}>{"★".repeat(5 - Math.round(rating.avgRating))}</span>
                  </span>
                  <a href="#reviews" className="text-decoration-none" style={{ color: "hsl(var(--gray-600))" }}>
                    {rating.avgRating} ({rating.count} review{rating.count === 1 ? "" : "s"})
                  </a>
                </div>
              )}

              {variant ? (
                <>
                  {/* MRP / Price / Savings stack */}
                  <div className="mb-3">
                    {variant.offerPrice < variant.price && (
                      <p className="mb-1" style={{ fontSize: 14, color: "hsl(var(--gray-500))" }}>
                        MRP: <span style={{ textDecoration: "line-through" }}>₹{variant.price}</span>
                      </p>
                    )}
                    <p className="mb-1" style={{ fontSize: 20, fontWeight: 700, color: "hsl(var(--neutral))" }}>
                      Price: ₹{variant.offerPrice}
                      <span style={{ fontSize: 14, fontWeight: 400, color: "hsl(var(--gray-500))" }}>
                        {" "}({getVariantLabel(variant)})
                      </span>
                    </p>
                    {discountPct > 0 && (
                      <p className="mb-1" style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--main-800))" }}>
                        You Save: {discountPct}% OFF
                      </p>
                    )}
                    <p className="mb-0" style={{ fontSize: 12.5, color: "hsl(var(--gray-500))", fontStyle: "italic" }}>
                      {variant.tax > 0 ? `(inclusive of ${variant.tax}% tax)` : "(inclusive of all taxes)"}
                    </p>
                  </div>

                  <div className="d-flex align-items-center gap-2 mb-4" style={{ fontSize: 13.5 }}>
                    <span
                      className="rounded-circle"
                      style={{ width: 7, height: 7, background: inStock ? "hsl(var(--main))" : "hsl(var(--main-two))" }}
                    />
                    <span style={{ color: inStock ? "hsl(var(--main-800))" : "hsl(var(--main-two-800))", fontWeight: 500 }}>
                      {inStock
                        ? `In stock — ${totalStock} ${variant.stockUnit || variant.unit || ""} available`
                        : "Out of stock"}
                    </span>
                    {earliestExpiry && (
                      <span style={{ color: "hsl(var(--gray-500))" }}>
                        · Best before {new Date(earliestExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>

                  {/* Add to cart + Wishlist, side by side */}
                  <div className="d-flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={addToCart}
                      disabled={!inStock}
                      className="btn btn-main"
                      style={{ flex: 1, fontSize: 15.5, fontWeight: 600, padding: "12px 0", opacity: inStock ? 1 : 0.5, cursor: inStock ? "pointer" : "not-allowed" }}
                    >
                      {inStock ? "Add to cart" : "Out of stock"}
                    </button>
                    <button
                      type="button"
                      onClick={toggleWishlist}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontSize: "15.5px",
                        fontWeight: 600,
                        padding: "12px 0",
                        borderRadius: 5,
                        border: isWishlisted ? "1px solid #E8622C" : "1px solid #299E60",
                        background: "#FFFFFF",
                        color: isWishlisted ? "#E8622C" : "#299E60",
                        cursor: "pointer",
                      }}
                    >
                      <i
                        className={isWishlisted ? "ph-fill ph-heart" : "ph ph-heart"}
                        style={{ fontSize: 18, color: isWishlisted ? "#E8622C" : "#299E60" }}
                      />
                      <span style={{ color: isWishlisted ? "#E8622C" : "#299E60" }}>
                        {isWishlisted ? "Wishlisted" : "Wishlist"}
                      </span>
                    </button>
                  </div>

                  {/* Pack sizes */}
                  {variants.length > 1 && (
                    <div>
                      <p className="mb-2" style={{ fontSize: 15, fontWeight: 600, color: "hsl(var(--neutral))" }}>
                        Pack sizes
                      </p>
                      <div className="d-flex flex-column gap-2">
                        {variants.map((v, i) => {
                          const vDiscount =
                            v.price && v.offerPrice && v.offerPrice < v.price
                              ? Math.round((1 - v.offerPrice / v.price) * 100)
                              : 0;
                          const vStock = getTotalStock(v);
                          const selected = i === selectedVariantIdx;
                          return (
                            <button
                              key={v._id || i}
                              type="button"
                              onClick={() => setSelectedVariantIdx(i)}
                              className="d-flex align-items-center justify-content-between text-start"
                              style={{
                                border: selected ? "2px solid hsl(var(--main))" : "1px solid hsl(var(--border-color))",
                                borderRadius: 10,
                                padding: "12px 16px",
                                background: "#fff",
                                cursor: "pointer",
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14.5, color: "hsl(var(--neutral))" }}>
                                  {getVariantLabel(v)}
                                </div>
                                <div style={{ fontSize: 12.5, color: vStock > 0 ? "hsl(var(--gray-500))" : "hsl(var(--main-two-800))" }}>
                                  {vStock > 0 ? `${vStock} ${v.stockUnit || v.unit || ""} available` : "Out of stock"}
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-3">
                                <div className="text-end">
                                  <div style={{ fontWeight: 700, fontSize: 15 }}>₹{v.offerPrice}</div>
                                  {vDiscount > 0 && (
                                    <div style={{ fontSize: 11.5 }}>
                                      <span style={{ textDecoration: "line-through", color: "hsl(var(--gray-500))" }}>₹{v.price}</span>{" "}
                                      <span style={{ color: "hsl(var(--main-800))", fontWeight: 600 }}>{vDiscount}% OFF</span>
                                    </div>
                                  )}
                                </div>
                                {selected && (
                                  <i className="ph-bold ph-check-circle" style={{ color: "hsl(var(--main))", fontSize: 20 }} />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 mb-4">No purchasable variant is currently available for this product.</p>
              )}

              {product.returnable && (
                <div className="d-flex align-items-center gap-2 mt-4 pt-3" style={{ borderTop: "1px solid hsl(var(--border-color))", fontSize: 13, color: "hsl(var(--gray-600))" }}>
                  <i className="ph ph-arrow-counter-clockwise" style={{ color: "hsl(var(--main))", fontSize: 16 }} />
                  Easy 24h return on this item
                </div>
              )}
            </div>
          </div>

          {/* ── Description ── */}
          {renderDescription(product.description) && (
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid hsl(var(--border-color))" }}>
              <h5 style={{ fontFamily: "var(--heading-font)", color: "hsl(var(--neutral))" }} className="mb-3">
                Description
              </h5>
              {renderDescription(product.description)}
            </div>
          )}

          {/* ── Reviews ── */}
          <div id="reviews" className="mt-5 pt-4" style={{ borderTop: "1px solid hsl(var(--border-color))" }}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <h5 style={{ fontFamily: "var(--heading-font)", color: "hsl(var(--neutral))" }} className="mb-0">
                Customer Reviews
              </h5>
              {rating && rating.count > 0 && (
                <span style={{ fontSize: 13, color: "hsl(var(--gray-500))" }}>
                  {rating.avgRating} average · {rating.count} review{rating.count === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {reviewsLoading ? (
              <p className="text-gray-500" style={{ fontSize: 14 }}>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500" style={{ fontSize: 14 }}>No reviews yet for this product.</p>
            ) : (
              <div className="d-flex flex-column gap-3" style={{ maxWidth: 560 }}>
                {reviews.map((r, i) => (
                  <div
                    key={r._id || i}
                    style={{ border: "1px solid hsl(var(--border-color))", borderRadius: 12, padding: "16px 18px" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {r.userId?.name || r.userId?.username || "Anonymous"}
                      </span>
                      {r.rating && (
                        <span style={{ color: "#F2A623", fontSize: 13, letterSpacing: 1 }}>
                          {"★".repeat(r.rating)}<span style={{ color: "#ddd" }}>{"★".repeat(5 - r.rating)}</span>
                        </span>
                      )}
                    </div>
                    <p className="mb-0" style={{ fontSize: 14, color: "hsl(var(--gray-600))", lineHeight: 1.6 }}>
                      {r.comment || r.text || ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Related products — reuses the same slider already shown on Home ── */}
      <ProductListOne />

      <FooterOne />
      <BottomFooter />
    </>
  );
};

export default ProductPage;