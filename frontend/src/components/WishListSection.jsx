import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WishListSection = () => {
  const navigate = useNavigate();

  // ✅ Load wishlist from localStorage
  const [wishlist, setWishlist] = useState(
    JSON.parse(localStorage.getItem("wishlist")) || []
  );

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // ✅ Remove from wishlist
  const handleRemove = (productId) => {
    const updated = wishlist.filter((item) => item._id !== productId);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    toast.info("Removed from wishlist!");
  };

  // ✅ Add to cart from wishlist
  const handleAddToCart = (product) => {
    if (!user) {
      alert("Please login to add products to cart");
      navigate("/account");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const defaultVariant = product.variants?.[0];

    if (!defaultVariant) {
      toast.error("No variant available for this product");
      return;
    }

    const existingIndex = cart.findIndex(
      (item) => item._id === product._id && item.variant._id === defaultVariant._id
    );

    if (existingIndex !== -1) {
      cart[existingIndex].cartQty += 1;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        image: product.image,
        variant: defaultVariant,
        cartQty: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Added to cart!");
    navigate("/cart");
  };

  if (!user) {
    return (
      <section className="py-80 text-center">
        <h5>Please <a href="/account">login</a> to view your wishlist.</h5>
      </section>
    );
  }

  return (
    <section className="cart py-80">
      <div className="container container-lg">
        <h3 className="mb-4 fw-bold">❤️ My Wishlist ({wishlist.length} items)</h3>

        {wishlist.length === 0 ? (
          <div className="text-center py-80">
            <div style={{ fontSize: "60px" }}>🤍</div>
            <h5 className="mt-3">Your wishlist is empty!</h5>
            <p className="text-gray-500">Go add some products you love.</p>
            <button
              onClick={() => navigate("/products")}
              style={{
                background: "linear-gradient(90deg,#3bb77e,#2eb872)",
                color: "#fff",
                border: "none",
                padding: "12px 30px",
                borderRadius: "25px",
                cursor: "pointer",
                fontWeight: "600",
                marginTop: "16px",
              }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="row gy-4">
            {wishlist.map((product) => {
              const variant = product.variants?.[0];
              return (
                <div key={product._id} className="col-lg-3 col-md-4 col-sm-6">
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "18px",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                      padding: "18px",
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    {/* ✅ Remove button */}
                    <button
                      onClick={() => handleRemove(product._id)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "none",
                        border: "none",
                        fontSize: "20px",
                        cursor: "pointer",
                        color: "#e74c3c",
                      }}
                      title="Remove from Wishlist"
                    >
                      ❤️
                    </button>

                    {/* Product Image */}
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "contain",
                        marginBottom: "10px",
                      }}
                    />

                    {/* Product Name */}
                    <h6 style={{ fontWeight: "700", marginBottom: "8px" }}>
                      {product.name}
                    </h6>

                    {/* Price */}
                    {variant && (
                      <p style={{ color: "#28a745", fontWeight: "700", fontSize: "16px" }}>
                        ₹{variant.offerPrice || variant.price}
                        {variant.offerPrice && variant.price !== variant.offerPrice && (
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#999",
                              fontSize: "13px",
                              marginLeft: "8px",
                            }}
                          >
                            ₹{variant.price}
                          </span>
                        )}
                      </p>
                    )}

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <button
                        onClick={() => handleAddToCart(product)}
                        style={{
                          flex: 1,
                          background: "linear-gradient(90deg,#3bb77e,#2eb872)",
                          color: "#fff",
                          border: "none",
                          padding: "9px",
                          borderRadius: "20px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(product._id)}
                        style={{
                          flex: 1,
                          background: "#fff",
                          color: "#e74c3c",
                          border: "1px solid #e74c3c",
                          padding: "9px",
                          borderRadius: "20px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </section>
  );
};

export default WishListSection;