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
  const [active, setActive] = useState(false);

  const sidebarController = () => setActive(!active);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/list`
        );
        if (response.data.success) {
          setProducts(response.data.products || []);
        } else {
          console.error("Error fetching products:", response.data.message);
        }
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Search filter
  useEffect(() => {
    if (!products || products.length === 0) return;

    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("product")?.toLowerCase() || "";

    if (searchQuery) {
      const filtered = products.filter((p) =>
        p.name?.toLowerCase().includes(searchQuery)
      );
      setSearchFiltered(filtered);
    } else {
      setSearchFiltered(products);
    }
  }, [location.search, products]);

  // Fetch categories for sidebar
  const { data: subcategoriesdata , isLoading: isCategoryLoading } = useQuery({
  queryKey: ["subcategoriesdatakey"],
  queryFn: async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/subcategory`
    );
    return res.data || []; // <-- important change
  },
});


  const handleAddToCart = (product) => {
    const user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;

    if (!user) {
      alert("Please login to add products to cart");
      navigate("/account");
      return;
    }

    const cart = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];

    const existingProductIndex = cart.findIndex((p) => p._id === product._id);
    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
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

  // Filtered products for display
  const displayedProducts = id
    ? products.filter((p) => String(p.subcategory) === String(id))
    : searchFiltered.length > 0
    ? searchFiltered
    : products;

  return (
    <section className="shop py-80">
      <div className={`side-overlay ${active && "show"}`}></div>
      <div className="container container-lg">
        <div className="row">
          {/* Sidebar Start */}
          <div className="col-lg-3">
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
                  Product Sub Category
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
          </div>
          {/* Sidebar End */}

          {/* Content Start */}
          <div className="col-lg-9">
            <div className="flex-between gap-16 flex-wrap mb-40">
              <span className="text-gray-900">Sub Category Product</span>
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
                {displayedProducts.length > 0 ? (
                  displayedProducts.map((product) => (
                    <div
                      key={product._id}
                      className="col-xxl-2 col-lg-3 col-sm-4 col-6"
                    >
                      <div className="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8 position-absolute inset-block-start-0 inset-inline-end-0 me-16 mt-16"
                        >
                          Add <i className="ph ph-shopping-cart" />
                        </button>

                        <Link to="#" className="product-card__thumb flex-center">
                          <img
                            src={product.image[0] || "/assets/images/thumbs/placeholder.jpg"}
                            alt={product.name}
                            style={{ maxHeight: "180px", objectFit: "cover" }}
                          />
                        </Link>

                        <div className="product-card__content mt-12">
                          <div className="product-card__price mb-16">
                            {product.offerPrice && product.offerPrice < product.price && (
                              <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
                                ₹{product.price}
                              </span>
                            )}
                            <span className="text-heading text-md fw-semibold ms-2">
                              ₹{product.offerPrice || product.price}{" "}
                              <span className="text-gray-500 fw-normal">
                                /{product.unit}
                              </span>
                            </span>
                          </div>

                          <h6 className="title text-lg fw-semibold mt-12 mb-8">
                            <Link
                              to={`/product-details/${product._id}`}
                              className="link text-line-2"
                            >
                              {product.name}
                            </Link>
                          </h6>

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
                              {product.inStock
                                ? `In Stock: ${product.stock}`
                                : "Out of Stock"}
                            </span>

                            <p className="text-sm text-gray-500">
                              Sold by:{" "}
                              <span className="fw-medium">
                                {product.seller?.name || "Unknown Vendor"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
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

export default Subcategorysection;
