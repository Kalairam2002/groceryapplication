import React, { useEffect, useState, useRef  } from "react";
import query from "jquery";
import { Link, NavLink, useNavigate  } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast,ToastContainer  } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const HeaderOne = ({ onRecommendedClick, onBrandsClick }) => {
  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    window.onscroll = () => {
      if (window.pageYOffset < 150) {
        setScroll(false);
      } else if (window.pageYOffset > 150) {
        setScroll(true);
      }
      return () => (window.onscroll = null);
    };
    const selectElement = query(".js-example-basic-single");
    selectElement.select2();

    return () => {
      if (selectElement.data("select2")) {
        selectElement.select2("destroy");
      }
    };
  }, []);

  // Set the default language
  const [selectedLanguage, setSelectedLanguage] = useState("Eng");
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  // Set the default currency
  const [selectedCurrency, setSelectedCurrency] = useState("Rupee");
  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  // Mobile menu support
  const [menuActive, setMenuActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const handleMenuClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  const handleMenuToggle = () => {
    setMenuActive(!menuActive);
  };

  // Search control support
  const [activeSearch, setActiveSearch] = useState(false);
  const handleSearchToggle = () => {
    setActiveSearch(!activeSearch);
  };

  // category control support
  const dropdownRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(false);

  // Toggle dropdown
  const handleCategoryToggle = () => {
    setActiveCategory((prev) => !prev);
  };

  // Navigate and close dropdown
  const handleCategoryNavigate = (categoryId) => {
    setActiveCategory(false);
    if (categoryId === "all") navigate("/shop");
    else navigate(`/shop/${categoryId}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveCategory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // user 
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // check if user info exists in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/account"); // redirect to login/register page
  };

  //update cart count 
  const [cartCount, setCartCount] = useState(0);

  // Update cart count whenever localStorage changes
  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem("cart")
        ? JSON.parse(localStorage.getItem("cart"))
        : [];
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    };

    updateCartCount();

    // Optional: listen for storage events if cart can change in another tab
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);


  //category header 

  const { data: categorydata, isLoading } = useQuery({
    queryKey: ["categorydata"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admindata/getCategory`);
      return res.data;
    },
  });

  const handleChange = (e) => {
    const selectedId = e.target.value;
      if (selectedId && selectedId !== "all") {
        navigate(`/shop/${selectedId}`);
      } else {
        navigate("/shop"); // or stay on same page
      }
    };



    // Fetch orders 
    const [orders, setOrders] = useState([]);
    const storedUser = localStorage.getItem("user");
    const username = storedUser ? JSON.parse(storedUser).username : null;
    const token = localStorage.getItem("token");


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/user/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && Array.isArray(res.data.orders)) {
          const groupedOrders = res.data.orders.reduce((acc, order) => {
            const existing = acc.find((o) => o._id === order._id);
            if (existing) {
              existing.products.push(...order.products);
            } else {
              acc.push({ ...order, products: [...order.products] });
            }
            return acc;
          }, []);

          setOrders(groupedOrders);
        } else {
          toast.info(res.data.message || "No orders found");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to load orders");
      }
    };

    fetchOrders();
  }, [username, token]);


  // cart section count  
  const [cartCount1, setCartCount1] = useState(0);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = storedCart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount1(count);
  }, []);


  // search bar 
  const [searchText, setSearchText] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const query = searchText.trim();
      if (query) {
        navigate(`/shop?product=${encodeURIComponent(query)}`);
      } else {
        navigate("/shop");
      }
    }
  };

  return (
    <>
      <div className='overlay' />
      <div
        className={`side-overlay ${(menuActive || activeCategory) && "show"}`}
      />
      {/* ==================== Search Box Start Here ==================== */}
      <form action='#' className={`search-box ${activeSearch && "active"}`}>
        <button
          onClick={handleSearchToggle}
          type='button'
          className='search-box__close position-absolute inset-block-start-0 inset-inline-end-0 m-16 w-48 h-48 border border-gray-100 rounded-circle flex-center text-white hover-text-gray-800 hover-bg-white text-2xl transition-1'
        >
          <i className='ph ph-x' />
        </button>
        <div className='container'>
          <div className='position-relative'>
            <input
              type='text'
              className='form-control py-16 px-24 text-xl rounded-pill pe-64'
              placeholder='Search for a product or brands'
            />
            <button
              type='submit'
              className='w-48 h-48 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8'
            >
              <i className='ph ph-magnifying-glass' />
            </button>
          </div>
        </div>
      </form>
      {/* ==================== Search Box End Here ==================== */}
      {/* ==================== Mobile Menu Start Here ==================== */}
      <div
        className={`mobile-menu scroll-sm d-lg-none d-block ${
          menuActive && "active"
        }`}
      >
        <button
          onClick={() => {
            handleMenuToggle();
            setActiveIndex(null);
          }}
          type='button'
          className='close-button'
        >
          <i className='ph ph-x' />{" "}
        </button>
        <div className='mobile-menu__inner'>
          <Link to='/' className='mobile-menu__logo'>
            <img src='public/assets/images/logo/logo_grocery.jpeg' alt='Logo' />
          </Link>
          <div className='mobile-menu__menu' >
            {/* Nav Menu Start */}
            <ul className='nav-menu flex-align nav-menu--mobile'>
              {/* Home Menu */}
              <li
                onClick={() => handleMenuClick(0)}
                className={`on-hover-item nav-menu__item has-submenu ${
                  activeIndex === 0 ? "d-block" : ""
                }`}
              >
                <Link to='#' className='nav-menu__link'>
                  Home
                </Link>
                <ul
                  className={`on-hover-dropdown common-dropdown nav-submenu scroll-sm ${
                    activeIndex === 0 ? "open" : ""
                  }`}
                >
                  <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      {" "}
                      Home Grocery
                    </Link>
                  </li>
                  <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/index-two'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      {" "}
                      Home Electronics
                    </Link>
                  </li>
                  <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/index-three'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      Home Fashion
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Shop Menu */}
              <li
                onClick={() => handleMenuClick(1)}
                className={`on-hover-item nav-menu__item has-submenu ${
                  activeIndex === 1 ? "d-block" : ""
                }`}
              >
                <Link to='#' className='nav-menu__link'>
                  Shop
                </Link>
                <ul
                  className={`on-hover-dropdown common-dropdown nav-submenu scroll-sm ${
                    activeIndex === 1 ? "open" : ""
                  }`}
                >
                  <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/shop'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      {" "}
                      Shop
                    </Link>
                  </li>
                  <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/product-details'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      {" "}
                      Shop Details
                    </Link>
                  </li>
                  <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/product-details-two'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      {" "}
                      Shop Details Two
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Pages Menu */}
              <li
                onClick={() => handleMenuClick(2)}
                className={`on-hover-item nav-menu__item has-submenu ${
                  activeIndex === 2 ? "d-block" : ""
                }`}
              >
                <span className='badge-notification bg-warning-600 text-white text-sm py-2 px-8 rounded-4'>
                  New
                </span>
                <Link to='#' className='nav-menu__link'>
                  Pages
                </Link>
                <ul
                  className={`on-hover-dropdown common-dropdown nav-submenu scroll-sm ${
                    activeIndex === 2 ? "open" : ""
                  }`}
                >
                  <li className="common-dropdown__item nav-submenu__item">
                    <Link
                      to="/cart"
                      className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                      onClick={() => setActiveIndex(null)}
                    >
                      Cart {cartCount > 0 && `(${cartCount})`}
                    </Link>
                  </li>
                  {/* <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/wishlist'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      Wishlist
                    </Link>
                  </li> */}
                  <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/checkout'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      {" "}
                      Checkout{" "}
                    </Link>
                  </li>
                  <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/become-seller'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      Become Seller
                    </Link>
                  </li>
                  <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/account'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      {" "}
                      Account
                    </Link>
                  </li>
                </ul>
              </li>
             

              {/* Blog Menu */}
              <li
                onClick={() => handleMenuClick(4)}
                className={`on-hover-item nav-menu__item has-submenu ${
                  activeIndex === 4 ? "d-block" : ""
                }`}
              >
                <Link to='#' className='nav-menu__link'>
                  Blog
                </Link>
                <ul
                  className={`on-hover-dropdown common-dropdown nav-submenu scroll-sm ${
                    activeIndex === 4 ? "open" : ""
                  }`}
                >
                  <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/blog'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      {" "}
                      Blog
                    </Link>
                  </li>
                  <li className='common-dropdown__item nav-submenu__item'>
                    <Link
                      to='/blog-details'
                      className='common-dropdown__link nav-submenu__link hover-bg-neutral-100'
                      onClick={() => setActiveIndex(null)}
                    >
                      {" "}
                      Blog Details
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Contact Us Menu */}
              <li className='nav-menu__item'>
                <Link
                  to='/contact'
                  className='nav-menu__link'
                  onClick={() => setActiveIndex(null)}
                >
                  Contact Us
                </Link>
              </li>
              <li className='nav-menu__item'>
                <Link
                  to='/seller'
                  className='nav-menu__link'
                  onClick={() => setActiveIndex(null)}
                >
                  Become a Seller
                </Link>
              </li>
              <li className='nav-menu__item'>
                <Link
                  to='/admin'
                  className='nav-menu__link'
                  onClick={() => setActiveIndex(null)}
                >
                  Admin
                </Link>
              </li>
            </ul>
            {/* Nav Menu End */}
          </div>
        </div>
      </div>
      {/* ==================== Mobile Menu End Here ==================== */}
      {/* ======================= Middle Top Start ========================= */}
      <div className='header-top flex-between' style={{ backgroundColor: "#558B2F", borderBottom: "1px solid #fff" }}>
        <div className='container container-lg'>
          <div className='flex-between flex-wrap gap-8'>
            <ul className='flex-align flex-wrap d-none d-md-flex'>
              <li className='border-right-item'>
                <Link
                  to='/seller'
                  className='text-white text-sm hover-text-decoration-underline'
                >
                  <b>Become A Seller</b>
                </Link>
              </li>
              <li className='border-right-item'>
                <Link
                  to='/admin'
                  className='text-white text-sm hover-text-decoration-underline'
                >
                  <b>Admin</b>
                </Link>
              </li>
              {/* <li className='border-right-item'>
                <button
                  to='#'
                  className='text-white text-sm hover-text-decoration-underline'
                  onClick={onRecommendedClick}
                >
                  <b>Recommended for you</b>
                </button>
              </li>
              <li className='border-right-item'>
                <button
                  to='#'
                  className='text-white text-sm hover-text-decoration-underline'
                  onClick={onBrandsClick}
                >
                  <strong>Shop by Brands</strong>
                </button>
              </li> */}
            </ul>
            <ul className='header-top__right flex-align flex-wrap'>
              <li className='on-hover-item border-right-item border-right-item-sm-space has-submenu arrow-white'>
                <Link to='#' className='text-white text-sm py-8'>
                  <b>Help Center</b>
                </Link>
                <ul className='on-hover-dropdown common-dropdown common-dropdown--sm max-h-200 scroll-sm px-0 py-8'>
                  <li className='nav-submenu__item'>
                    <Link
                      to='/contact'
                      className='nav-submenu__link hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                    >
                      <span className='text-sm d-flex'>
                        <i className='ph ph-headset' />
                      </span>
                     <b>Contact</b>
                    </Link>
                  </li>
                </ul>
              </li>
              <li className='on-hover-item border-right-item border-right-item-sm-space has-submenu arrow-white'>
                {/* Display the selected language here */}
                <Link to='#' className='selected-text text-white text-sm py-8'>
                  <b>{selectedLanguage}</b>
                </Link>
                <ul className='selectable-text-list on-hover-dropdown common-dropdown common-dropdown--sm max-h-200 scroll-sm px-0 py-8'>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleLanguageChange("English")}
                    >
                      <img
                        src='assets/images/thumbs/flag1.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      <b>English</b>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleLanguageChange("Japan")}
                    >
                      <img
                        src='assets/images/thumbs/flag2.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      Japan
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleLanguageChange("French")}
                    >
                      <img
                        src='assets/images/thumbs/flag3.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      French
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleLanguageChange("Germany")}
                    >
                      <img
                        src='assets/images/thumbs/flag4.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      Germany
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleLanguageChange("Bangladesh")}
                    >
                      <img
                        src='assets/images/thumbs/flag6.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      Bangladesh
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleLanguageChange("South Korea")}
                    >
                      <img
                        src='assets/images/thumbs/flag5.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      South Korea
                    </Link>
                  </li>
                </ul>
              </li>
              <li className='on-hover-item border-right-item border-right-item-sm-space has-submenu arrow-white'>
                {/* Display the selected currency */}
                <Link to='#' className='selected-text text-white text-sm py-8'>
                  <b>{selectedCurrency}</b>
                </Link>
                <ul className='selectable-text-list on-hover-dropdown common-dropdown common-dropdown--sm max-h-200 scroll-sm px-0 py-8'>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleCurrencyChange("Rupee")}
                    >
                      <img
                        src='assets/images/thumbs/flag1.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      <b>Rupee</b>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleCurrencyChange("Yen")}
                    >
                      <img
                        src='assets/images/thumbs/flag2.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      Yen
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleCurrencyChange("Franc")}
                    >
                      <img
                        src='assets/images/thumbs/flag3.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      Franc
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleCurrencyChange("EURO")}
                    >
                      <img
                        src='assets/images/thumbs/flag4.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      EURO
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleCurrencyChange("BDT")}
                    >
                      <img
                        src='assets/images/thumbs/flag6.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      BDT
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'
                      onClick={() => handleCurrencyChange("WON")}
                    >
                      <img
                        src='assets/images/thumbs/flag5.png'
                        alt=''
                        className='w-16 h-12 rounded-4 border border-gray-100'
                      />
                      WON
                    </Link>
                  </li>
                </ul>
              </li>
              <ul className="nav-list d-flex">
                <li className="border-right-item">
                  {user ? (
                    <div className="flex-align gap-6 cursor-pointer">
                      <span className="icon text-md d-flex">
                        <i className="ph ph-user-circle text-white" />
                      </span>
                      <span className="text-white">
                        <b>{user.username}</b>
                      </span>
                      <button
                        onClick={handleLogout}
                        className="btn btn-sm ms-16" style={{backgroundColor: 'rgb(255, 167, 38)'}}
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/account"
                      className="text-white text-sm py-8 flex-align gap-6"
                    >
                      <span className="icon text-md d-flex">
                        <i className="ph ph-user-circle" />
                      </span>
                      <span className="hover-text-decoration-underline">
                        <b>My Account</b>
                      </span>
                    </Link>
                  )}
                </li>
                {/* other menu items */}
              </ul>
            </ul>
          </div>
        </div>
      </div>
      {/* ======================= Middle Top End ========================= */}
      {/* ======================= Middle Header Start ========================= */}
      <header className="header-middle border-b border-gray-200 p-0" style={{ backgroundColor: "#1B5E20" }}>
        <div className='container container-lg '>
          <nav className='header-inner flex-between'>
            {/* Logo Start */}
            <div className='logo'>
              <Link to='/' className='link'>
                <img src='../../assets/images/logo/logo.png' alt='Logo' width='80'/>
              </Link>
            </div>
            <div classname='store'>
              <h5 className="text-white fw-bold p-0">Online Multi Store</h5>
            </div>
            {/* Logo End  */}
            {/* form location Start */}
            <form
              action='#'
              className='flex-align flex-wrap form-location-wrapper'
            >
              <div className="search-category bg-white d-flex h-48 search-form d-sm-flex d-none rounded-full shadow-sm" style={{borderRadius:'9999px'}}>
                {/* <select
                  defaultValue={1}
                  className='js-example-basic-single fw-bold border-end-0 form-select'
                  name='state' onChange={handleChange}
                > */}
                  <select
                    defaultValue="all"
                    className="form-select fw-bold border-end-0"
                    onChange={handleChange}
                  >
                  <option value="all">All Categories</option>
                    {!isLoading &&
                      categorydata?.length > 0 &&
                      categorydata.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                </select>
                <div className="search-form__wrapper position-relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleKeyDown} // <-- trigger on Enter
                  className="search-form__input common-input py-13 ps-16 pe-18 rounded-end-pill pe-44 bg-white border border-black"
                  placeholder="Search products..."
                />
                <button
                  type="button"
                  onClick={() => {
                    const query = searchText.trim();
                    if (query) navigate(`/shop?product=${encodeURIComponent(query)}`);
                    else navigate("/shop");
                  }}
                  className="w-32 h-32 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8"
                >
                  <i className="ph ph-magnifying-glass" />
                </button>
              </div>
              </div>
              <div className='location-box bg-white flex-align gap-8 py-6 px-16 rounded-pill border border-gray-100'>
                <span className='text-gray-900 text-xl d-xs-flex d-none'>
                  <i className='ph ph-map-pin' />
                </span>
                <div className='line-height-1'>
                  <span className='text-gray-600 text-xs'>Your Location</span>
                  <div className='line-height-1'>
                    <select
                      defaultValue={1}
                      className='js-example-basic-single fw-bold border border-gray-200 border-end-0'
                      name='state'
                    >
                      <option value={1}>Paramakudi</option>
                      <option value={1}>Alaska</option>
                      <option value={1}>Arizona</option>
                      <option value={1}>Delaware</option>
                      <option value={1}>Florida</option>
                      <option value={1}>Georgia</option>
                      <option value={1}>Hawaii</option>
                      <option value={1}>Indiana</option>
                      <option value={1}>Marzland</option>
                      <option value={1}>Nevada</option>
                      <option value={1}>New Jersey</option>
                      <option value={1}>New Mexico</option>
                      <option value={1}>New York</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
            {/* form location start */}
            {/* Header Middle Right start */}
            <div className='header-right flex-align d-lg-block d-none'>
              <div className='flex-align flex-wrap gap-12'>
                <button
                  type='button'
                  className='search-icon flex-align d-lg-none d-flex gap-3 item-hover'
                >
                  <span className='text-2xl text-gray-700 d-flex position-relative item-hover__text'>
                    <i className='ph ph-magnifying-glass' />
                  </span>
                </button>
                {user ? (
                    <Link to='/wishlist' className='flex-align gap-4 item-hover'>
                      <span className='text-2xl text-gray-700 d-flex position-relative me-6 mt-6 item-hover__text'>
                      <b>
                          <i className='ph ph-heart text-white' />
                        <span className='w-16 h-16 flex-center rounded-circle bg-main-600 text-white text-xs position-absolute top-n6 end-n4'>
                           {orders.length} {/* Total orders */}
                        </span>
                      </b>
                      </span>
                      <span className='text-md text-white item-hover__text-white d-lg-flex'>
                        <b>my Orders</b>
                      </span>
                    </Link>
                  ) : (
                    <>
                    </>
                  )}
                <Link to='/cart' className='flex-align gap-4 item-hover'>
                  <span className='text-2xl text-gray-700 d-flex position-relative me-6 mt-6 item-hover__text'>
                    <b>                    <i className='ph ph-shopping-cart-simple text-white text-2xl'  />
                      <span className="w-16 h-16 flex-center rounded-circle bg-main-600 text-white text-xs position-absolute top-n6 end-n4">
                        {cartCount1}
                      </span>
                    </b>

                  </span>
                    <b>                  <span className='text-md text-white item-hover__text-white d-lg-flex'>
                    Cart
                  </span></b>
                </Link>
              </div>
            </div>
            {/* Header Middle Right End  */}
          </nav>
        </div>
      </header>
      {/* ======================= Middle Header End ========================= */}
      {/* ==================== Header Start Here ==================== */}
      <header
        className={`header bg-white border-bottom border-gray-100 ${
          scroll && "fixed-header"
        }`}
      >
        <div className='container container-lg'>
          <nav className='header-inner d-flex justify-content-between gap-8' style={{backgroundColor:'#2e7d32'}}>
            <div className='flex-align menu-category-wrapper'>
              {/* Category Dropdown Start */}
              <div className="category on-hover-item position-relative" ref={dropdownRef}>
                {/* Main button */}
                <button
                  onClick={handleCategoryToggle}
                  type="button"
                  className="category__button flex-align gap-8 fw-medium p-16 border-end border-start border-gray-100 text-heading"
                >
                  <span className="icon text-2xl d-xs-flex d-none">
                    <i className="ph ph-dots-nine" />
                  </span>
                  <span className="d-sm-flex d-none"style={{ color: '#ffffff' }}>All Categories</span>
                  <span className="arrow-icon text-xl d-flex ">
                    <i className={`ph ${activeCategory ? "ph-caret-up" : "ph-caret-down"}`} />
                  </span>
                </button>

                {/* Dropdown list */}
                {activeCategory && (
                  <div className="responsive-dropdown cat common-dropdown nav-submenu p-0 submenus-submenu-wrapper active">
                    <ul className="scroll-sm p-0 py-8 w-300 max-h-400 overflow-y-auto">
                      {isLoading && (
                        <li className="px-16 py-12 text-gray-500">Loading categories...</li>
                      )}

                      {/* All products option */}
                      <li>
                        <button
                          type="button"
                          className="dropdown-link px-16 py-8 text-start w-100"
                          onClick={() => handleCategoryNavigate("all")}
                        >
                          All Products
                        </button>
                      </li>

                      {/* Dynamic categories */}
                      {!isLoading &&
                        categorydata?.length > 0 &&
                        categorydata.map((cat) => (
                          <li key={cat._id}>
                            <button
                              type="button"
                              className="dropdown-link px-16 py-8 text-start w-100"
                              onClick={() => handleCategoryNavigate(cat._id)}
                            >
                              {cat.name}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Category Dropdown End  */}
              {/* Menu Start  */}
              <div className='header-menu d-lg-block d-none '>
                {/* Nav Menu Start */}
                <ul className='nav-menu flex-align '>
                  <li className='on-hover-item nav-menu__item has-submenu '>
                    <Link to='#' className='nav-menu__link'style={{ color: '#ffffff' }}>
                      Home
                    </Link>
                    <ul className='on-hover-dropdown common-dropdown nav-submenu scroll-sm'style={{ color: '#ffffff' }}>
                      <li className='common-dropdown__item nav-submenu__item'>
                        <NavLink
                          to='/'
                          className={(navData) =>
                            navData.isActive
                              ? "common-dropdown__link nav-submenu__link hover-bg-neutral-100 activePage"
                              : "common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                          }
                        >
                          Home Grocery
                        </NavLink>
                      </li>
                    </ul>
                  </li>
                  <li className='on-hover-item nav-menu__item has-submenu'>
                    <Link to='#' className='nav-menu__link'style={{ color: '#ffffff' }}>
                      Shop
                    </Link>
                    <ul className='on-hover-dropdown common-dropdown nav-submenu scroll-sm'style={{ color: '#ffffff' }}>
                      <li className='common-dropdown__item nav-submenu__item'>
                        <NavLink
                          to='/shop'
                          className={(navData) =>
                            navData.isActive
                              ? "common-dropdown__link nav-submenu__link hover-bg-neutral-100 activePage"
                              : "common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                          }
                        >
                          {" "}
                          products
                        </NavLink>
                      </li>
                      <li className='common-dropdown__item nav-submenu__item'>
                        <NavLink
                          to='/seller-details'
                          className={(navData) =>
                            navData.isActive
                              ? "common-dropdown__link nav-submenu__link hover-bg-neutral-100 activePage"
                              : "common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                          }
                        >
                          {" "}
                          Vendor
                        </NavLink>
                      </li>
                    </ul>
                  </li>
                  <li className='on-hover-item nav-menu__item has-submenu'>
                    <span className='badge-notification bg-warning-600 text-white text-sm py-2 px-8 rounded-4'>
                      New
                    </span>
                    <Link to='#' className='nav-menu__link' style={{ color: '#ffffff' }}>
                      Pages
                    </Link>
                    <ul className='on-hover-dropdown common-dropdown nav-submenu scroll-sm'>
                      <li className='common-dropdown__item nav-submenu__item'>
                        <NavLink
                          to='/cart'
                          className={(navData) =>
                            navData.isActive
                              ? "common-dropdown__link nav-submenu__link hover-bg-neutral-100 activePage"
                              : "common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                          }
                        >
                          {" "}
                          Cart
                        </NavLink>
                      </li>
                      {/* <li className='common-dropdown__item nav-submenu__item'>
                        <NavLink
                          to='/wishlist'
                          className={(navData) =>
                            navData.isActive
                              ? "common-dropdown__link nav-submenu__link hover-bg-neutral-100 activePage"
                              : "common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                          }
                        >
                          Wishlist
                        </NavLink>
                      </li> */}
                      {/* <li className='common-dropdown__item nav-submenu__item'>
                        <NavLink
                          to='/checkout'
                          className={(navData) =>
                            navData.isActive
                              ? "common-dropdown__link nav-submenu__link hover-bg-neutral-100 activePage"
                              : "common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                          }
                        >
                          {" "}
                          Checkout{" "}
                        </NavLink>
                      </li> */}

                      {/* <li className='common-dropdown__item nav-submenu__item'>
                        <NavLink
                          to='/become-seller'
                          className={(navData) =>
                            navData.isActive
                              ? "common-dropdown__link nav-submenu__link hover-bg-neutral-100 activePage"
                              : "common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                          }
                        >
                          Become Seller
                        </NavLink>
                      </li> */}
                      <li className='common-dropdown__item nav-submenu__item'>
                        <NavLink
                          to='/account'
                          className={(navData) =>
                            navData.isActive
                              ? "common-dropdown__link nav-submenu__link hover-bg-neutral-100 activePage"
                              : "common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                          }
                        >
                          {" "}
                          Account
                        </NavLink>
                      </li>
                    </ul>
                  </li>
                  <li className='on-hover-item nav-menu__item has-submenu'>
                    <Link to='#' className='nav-menu__link' style={{ color: '#ffffff' }}>
                      Blog
                    </Link>
                    <ul className='on-hover-dropdown common-dropdown nav-submenu scroll-sm'>
                      <li className='common-dropdown__item nav-submenu__item'>
                        <NavLink
                          to='/blog'
                          className={(navData) =>
                            navData.isActive
                              ? "common-dropdown__link nav-submenu__link hover-bg-neutral-100 activePage"
                              : "common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                          }
                        >
                          {" "}
                          Blog
                        </NavLink>
                      </li>
                      {/* <li className='common-dropdown__item nav-submenu__item'>
                        <NavLink
                          to='/blog-details'
                          className={(navData) =>
                            navData.isActive
                              ? "common-dropdown__link nav-submenu__link hover-bg-neutral-100 activePage"
                              : "common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                          }
                        >
                          {" "}
                          Blog Details
                        </NavLink>
                      </li> */}
                    </ul>
                  </li>
                  <li className='nav-menu__item'>
                    <NavLink
                      to='/contact'
                      className={(navData) =>
                        navData.isActive
                          ? "nav-menu__link activePage"
                          : "nav-menu__link"
                      }
                    style={{ color: '#ffffff' }}>
                      Contact Us
                    </NavLink>
                  </li>
                </ul>
                {/* Nav Menu End */}
              </div>
              {/* Menu End  */}
            </div>
            {/* Header Right start */}
            <div className='header-right flex-align'>
              <Link
                to='/tel:01234567890'
                className=' hover-bg-warning-800 text-white p-12 h-100  flex-align gap-8 text-lg d-lg-flex d-none' style={{backgroundColor:'#FFA726'}}
                
              >
                <div className='d-flex text-32'>
                  <i className='ph ph-phone-call' />
                </div>
                +91 8682860385
              </Link>
              <div className='me-16 d-lg-none d-block'>
                <div className='flex-align flex-wrap gap-12'>
                  <button
                    onClick={handleSearchToggle}
                    type='button'
                    className='search-icon flex-align d-lg-none d-flex gap-4 item-hover'
                  >
                    <span className='text-2xl text-gray-700 d-flex position-relative item-hover__text'>
                      <i className='ph ph-magnifying-glass' />
                    </span>
                  </button>
                  {/* <Link to='/wishlist' className='flex-align gap-4 item-hover'>
                    <span className='text-2xl text-gray-700 d-flex position-relative me-6 mt-6 item-hover__text'>
                      <i className='ph ph-heart' />
                      <span className='w-16 h-16 flex-center rounded-circle bg-main-600 text-white text-xs position-absolute top-n6 end-n4'>
                        2
                      </span>
                    </span>
                    <span className='text-md text-gray-500 item-hover__text d-none d-lg-flex'>
                      Wishlist
                    </span>
                  </Link> */}
                  <Link to='/cart' className='flex-align gap-4 item-hover'>
                    <span className='text-2xl text-gray-700 d-flex position-relative me-6 mt-6 item-hover__text'>
                      <i className='ph ph-shopping-cart-simple' />
                      <span className='w-16 h-16 flex-center rounded-circle bg-main-600 text-white text-xs position-absolute top-n6 end-n4'>
                        2
                      </span>
                    </span>
                    <span className='text-md text-gray-500 item-hover__text d-none d-lg-flex'>
                      Cart
                    </span>
                  </Link>
                </div>
              </div>
              <button
                onClick={handleMenuToggle}
                type='button'
                className='toggle-mobileMenu d-lg-none ms-3n text-gray-800 text-4xl d-flex'
              >
                {" "}
                <i className='ph ph-list' />{" "}
              </button>
            </div>
            {/* Header Right End  */}
          </nav>
        </div>
      </header>
      {/* ==================== Header End Here ==================== */}
    </>
  );
};

export default HeaderOne;
