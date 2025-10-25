import React, { useEffect, useState } from "react";
import ReactSlider from 'react-slider'

import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Branddatadisplay from "./Branddatadisplay";



const BrandSection = ({id, searchProducts}) => {

    const location = useLocation();
    const [searchFiltered, setSearchFiltered] = useState([]);

    

    let [grid, setGrid] = useState(false)

    let [active, setActive] = useState(false)
    let sidebarController = () => {
        setActive(!active)
    }

        // const { data:brandsData, isLoading:brandloading } = useQuery({
        // queryKey: ['brands'],
        // queryFn: async () => {
        //     const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/brand`);
        //     return response.data.brands || [];
            
            
        // },
        
        // });

    // const {data: categorydata, isLoading, error} = useQuery({
    // queryKey: ['categorydatakey', id],
    // queryFn: async () => {
    //   const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admindata/GetCategoryData/${id}`);
    //   return res.data;
    // }
   
    // })

    const {data:categorydatalist ,isLoading:iscategoryLoading, error:errorcategory} = useQuery({
      queryKey: ['categorydatalistkey'],
      queryFn: async () => {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admindata/getCategory`);
        return res.data;
      }
     
      })

    const navigate = useNavigate();
      const [products, setProducts] = useState([]);
      const [loading, setLoading] = useState(true);

      //   Search Products 
    useEffect(() => {
    if (!products || products.length === 0) return; // ✅ condition goes inside the effect

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

    // Search Products 

        const user = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user"))
          : null;
      
        // Add to cart handler
        const handleAddToCart = (product) => {
          if (!user) {
            // toast.error("Please login to add products to cart");
            alert("Please login to add products to cart");
            navigate("/account");
            return;
          }
      
          // Get existing cart from localStorage
          const cart = localStorage.getItem("cart")
            ? JSON.parse(localStorage.getItem("cart"))
            : [];
      
          // Check if product already exists in cart
          const existingProductIndex = cart.findIndex((p) => p.id === product._id);
          if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += 1;
          } else {
            cart.push({ ...product, quantity: 1 });
          }
      
          // Save updated cart
          localStorage.setItem("cart", JSON.stringify(cart));
      
          toast.success(`₹{product.name} added to cart!`);
      
          // Redirect to /cart
          navigate("/cart");
        };

    useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/product/list`);
        if (response.data.success) {
          setProducts(response.data.products); // Make sure your backend sends {success:true, products:[...]}
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <h4>Loading products...</h4>
      </div>
    );
  }

 



    return (
        <section className="shop py-80" >
            <div className={`side-overlay ${active && "show"}`}></div>
            <div className="container container-lg">
                <div className="row">
                    {/* Sidebar Start */}
                    <div className="col-lg-3">
                        <div className={`shop-sidebar ${active && "active"}`}>
                            <button onClick={sidebarController}
                                type="button"
                                className="shop-sidebar__close d-lg-none d-flex w-32 h-32 flex-center border border-gray-100 rounded-circle hover-bg-main-600 position-absolute inset-inline-end-0 me-10 mt-8 hover-text-white hover-border-main-600"
                            >
                                <i className="ph ph-x" />
                            </button>
                            <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                                    All Brands
                                </h6>
                                <ul className="max-h-540 overflow-y-auto scroll-sm">
                                    {/* {!iscategoryLoading && brandsData && brandsData.length > 0 && brandsData.map((brandsData) => (
                                        <li className="mb-24" key={brandsData._id}>
                                            <Link
                                                to={`/brandlist/${brandsData._id}`}
                                                className="text-gray-900 hover-text-main-600"
                                            >
                                                {brandsData.name} ({products.filter(product => product.brand === brandsData._id).length})
                                            </Link>
                                        </li>
                                    ))} */}
                                    
                                </ul>
                            </div>
                            {/* <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                                    Filter by Color
                                </h6>
                                <ul className="max-h-540 overflow-y-auto scroll-sm">
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio checked-black">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="color1"
                                            />
                                            <label className="form-check-label" htmlFor="color1">
                                                Black(12)
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio checked-primary">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="color2"
                                            />
                                            <label className="form-check-label" htmlFor="color2">
                                                Blue (12)
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio checked-gray">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="color3"
                                            />
                                            <label className="form-check-label" htmlFor="color3">
                                                Gray (12)
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio checked-success">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="color4"
                                            />
                                            <label className="form-check-label" htmlFor="color4">
                                                Green (12)
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio checked-danger">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="color5"
                                            />
                                            <label className="form-check-label" htmlFor="color5">
                                                Red (12)
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio checked-white">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="color6"
                                            />
                                            <label className="form-check-label" htmlFor="color6">
                                                White (12)
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-0">
                                        <div className="form-check common-check common-radio checked-purple">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="color7"
                                            />
                                            <label className="form-check-label" htmlFor="color7">
                                                Purple (12)
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </div> */}
                            {/* <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                                    Filter by Brand
                                </h6>
                                <ul className="max-h-540 overflow-y-auto scroll-sm">
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="brand1"
                                            />
                                            <label className="form-check-label" htmlFor="brand1">
                                                Apple
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="brand2"
                                            />
                                            <label className="form-check-label" htmlFor="brand2">
                                                Samsung
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="brand3"
                                            />
                                            <label className="form-check-label" htmlFor="brand3">
                                                Microsoft
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="brand4"
                                            />
                                            <label className="form-check-label" htmlFor="brand4">
                                                Apple
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="brand5"
                                            />
                                            <label className="form-check-label" htmlFor="brand5">
                                                HP
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="DELL"
                                            />
                                            <label className="form-check-label" htmlFor="DELL">
                                                DELL
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-0">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="Redmi"
                                            />
                                            <label className="form-check-label" htmlFor="Redmi">
                                                Redmi
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </div> */}
                            {/* <div className="shop-sidebar__box rounded-8">
                                <img src="assets/images/thumbs/advertise-img1.png" alt="" />
                            </div> */}
                        </div>
                    </div>
                    {/* Sidebar End */}
                    {/* Content Start */}
                    <div className="col-lg-9">
                        {/* Top Start */}
                        <div className="flex-between gap-16 flex-wrap mb-40 ">
                            <span className="text-gray-900">Brands</span>
                            <div className="position-relative flex-align gap-16 flex-wrap">
                                <div className="list-grid-btns flex-align gap-16">
                                    <button onClick={() => setGrid(true)}
                                        type="button"
                                        className={`w-44 h-44 flex-center border rounded-6 text-2xl list-btn border-gray-100 ${grid === true && "border-main-600 text-white bg-main-600"}`}
                                    >
                                        <i className="ph-bold ph-list-dashes" />
                                    </button>
                                    <button onClick={() => setGrid(false)}
                                        type="button"
                                        className={`w-44 h-44 flex-center border rounded-6 text-2xl grid-btn border-gray-100 ${grid === false && "border-main-600 text-white bg-main-600"}`}
                                    >
                                        <i className="ph ph-squares-four" />
                                    </button>
                                </div>
                                <div className="position-relative text-gray-500 flex-align gap-4 text-14">
                                    <label htmlFor="sorting" className="text-inherit flex-shrink-0">
                                        Sort by:{" "}
                                    </label>
                                    <select defaultValue={1}
                                        className="form-control common-input px-14 py-14 text-inherit rounded-6 w-auto"
                                        id="sorting"
                                    >
                                        <option value={1} >
                                            Popular
                                        </option>
                                        <option value={1}>Latest</option>
                                        <option value={1}>Trending</option>
                                        <option value={1}>Matches</option>
                                    </select>
                                </div>
                                <button onClick={sidebarController}
                                    type="button"
                                    className="w-44 h-44 d-lg-none d-flex flex-center border border-gray-100 rounded-6 text-2xl sidebar-btn"
                                >
                                    <i className="ph-bold ph-funnel" />
                                </button>
                            </div>
                        </div>
                        {/* Top End */}

                            {<Branddatadisplay />}




                      
                        
                        {/* <div className={`list-grid-wrapper ${grid && "list-view"}`}>    
                                         <div className="row gy-4 g-12">
                                      { products && products.length > 0 ? (
                                        products.map((product) => (
                                          <div key={product._id} className="col-xxl-2 col-lg-3 col-sm-4 col-6">
                                            <div className="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                                              
                                           
                                              <button
                                                onClick={() => handleAddToCart( product)}
                                                className="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8 position-absolute inset-block-start-0 inset-inline-end-0 me-16 mt-16"
                                              >
                                                Add <i className="ph ph-shopping-cart" />
                                              </button>
                                            
                            
                                             
                                              <Link to='#' className="product-card__thumb flex-center">
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
                                                      ${product.price}
                                                    </span>
                                                  )}
                                                  <span className="text-heading text-md fw-semibold ms-2">
                                                    ${product.offerPrice || product.price}{" "}
                                                    <span className="text-gray-500 fw-normal">/{product.unit}</span>
                                                  </span>
                                                </div>
                            
                                               
                                                <h6 className="title text-lg fw-semibold mt-12 mb-8">
                                                  <Link to={`/product-details/${product._id}`} className="link text-line-2">
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
                                                    {product.inStock ? `In Stock: ${product.stock}` : "Out of Stock"}
                                                  </span>
                                                  
                                                
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
                                          <h5>No products available</h5>
                                        </div>
                                      )}
                                    </div>

                        </div> */}

                            
                        {/* Pagination Start */}
                        <ul className="pagination flex-center flex-wrap gap-16">
                            <li className="page-item">
                                <Link
                                    className="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                    to="#"
                                >
                                    <i className="ph-bold ph-arrow-left" />
                                </Link>
                            </li>
                            <li className="page-item active">
                                <Link
                                    className="page-link h-64 w-64 flex-center text-md rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                    to="#"
                                >
                                    01
                                </Link>
                            </li>
                            {/* <li className="page-item">
                                <Link
                                    className="page-link h-64 w-64 flex-center text-md rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                    to="#"
                                >
                                    02
                                </Link>
                            </li>
                            <li className="page-item">
                                <Link
                                    className="page-link h-64 w-64 flex-center text-md rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                    to="#"
                                >
                                    03
                                </Link>
                            </li>
                            <li className="page-item">
                                <Link
                                    className="page-link h-64 w-64 flex-center text-md rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                    to="#"
                                >
                                    04
                                </Link>
                            </li>
                            <li className="page-item">
                                <Link
                                    className="page-link h-64 w-64 flex-center text-md rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                    to="#"
                                >
                                    05
                                </Link>
                            </li>
                            <li className="page-item">
                                <Link
                                    className="page-link h-64 w-64 flex-center text-md rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                    to="#"
                                >
                                    06
                                </Link>
                            </li>
                            <li className="page-item">
                                <Link
                                    className="page-link h-64 w-64 flex-center text-md rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                    to="#"
                                >
                                    07
                                </Link>
                            </li> */}
                            <li className="page-item">
                                <Link
                                    className="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                    to="#"
                                >
                                    <i className="ph-bold ph-arrow-right" />
                                </Link>
                            </li>
                        </ul>
                        {/* Pagination End */}
                    </div>
                    {/* Content End */}
                </div>
            </div>
        </section>

    )
}

export default BrandSection