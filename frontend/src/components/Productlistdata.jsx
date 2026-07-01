import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const Productlistdata = ({ id }) => {
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

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/list`
        );
        if (response.data.success) {
          setProducts(response.data.products || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ================= SEARCH FILTER =================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("product")?.toLowerCase() || "";

    if (searchQuery) {
      setSearchFiltered(
        products.filter((p) =>
          p.name?.toLowerCase().includes(searchQuery)
        )
      );
    } else {
      setSearchFiltered(products);
    }
  }, [location.search, products]);

  // ================= FETCH SUBCATEGORIES =================
  const { data: subcategoriesdata = [], isLoading: isCategoryLoading } =
    useQuery({
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
    ? products.filter((p) => String(p.variantdata) === String(id))
    : searchFiltered.length > 0
    ? searchFiltered
    : products;

  return (
    <section className="shop py-80">
      <div className="container container-lg">
        <div className="row">
          {/* <div className="col-lg-3">
            <div className={`shop-sidebar ${active && "active"}`}>
              <button
                onClick={sidebarController}
                type="button"
                className="shop-sidebar__close d-lg-none d-flex w-32 h-32 flex-center border border-gray-100 rounded-circle hover-bg-main-600 position-absolute inset-inline-end-0 me-10 mt-8 hover-text-white hover-border-main-600"
              >
                <i className="ph ph-x" />
              </button>
              <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                  List of variants
                </h6>
                <ul className="max-h-540 overflow-y-auto scroll-sm">
                  {isCategoryLoading && <li>Loading Sub categories...</li>}
                  {!isCategoryLoading && subcategoriesdata.length < 0  && <li>No Sub categories found</li>}
                  {!isCategoryLoading &&
                    subcategoriesdata.length > 0 &&
                    subcategoriesdata.map((subcategoriesdata) => (
                      <li className="mb-24" key={subcategoriesdata._id}>
                        <Link
                          to={`/subcategory/${subcategoriesdata._id}`}
                          className="text-gray-900 hover-text-main-600"
                        >
                          {subcategoriesdata.name} (
                          {
                            products.filter(
                              (product) => String(product.subcategory) === String(subcategoriesdata._id)
                            ).length
                          }
                          )
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>

            </div>
          </div> */}
          {/* ================= PRODUCTS ================= */}
          <div className="flex-between gap-16 flex-wrap mb-40">
              <span className="text-gray-900">
                <b>Product List by variants</b>
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

          <div className="col-lg-12">
  <div className={`list-grid-wrapper ${grid && "list-view"}`}>
    <div className="row gy-4 g-12">

      {displayedProducts.map((product) => {
        const variant =
          selectedVariants[product._id] || product.variants?.[0];

        return (
          <div key={product._id} className="col-xxl-2 col-lg-3 col-sm-4 col-6">

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
              <Link to="#">
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
                      product.image[0] ||
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
                  {product.name}
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

                {/* VARIANT DROPDOWN */}
                <select
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    marginBottom: "10px",
                    fontSize: "13px",
                    background: "#fafafa",
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
                    ₹{variant.offerPrice}
                  </span>
                </div>

                {/* STOCK BADGE */}
                <div
                  style={{
                    display: "inline-block",
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
                    : "Out of stock"}
                </div>

              </div>
            </div>
          </div>
        );
      })}

      {displayedProducts.length === 0 && (
        <h5 className="text-center mt-5">No products found</h5>
      )}

    </div>
  </div>
</div>


        </div>
      </div>
    </section>
  );
};

export default Productlistdata;
