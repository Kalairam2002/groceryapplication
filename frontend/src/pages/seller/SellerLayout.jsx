import { useNavigate } from "react-router-dom";
import axios from 'axios';

const SellerLayout = ({ children, page }) => {
     const navigate = useNavigate();
  const sidebarLinks = [
    { name: "Dashboard", href: "#" },
    { name: "Add Product", href: "/selleraddproduct" },
    { name: "Product List", href: "/SellerProductList" },
    { name: "Barcode Scanner", href: "/barcodeScanner" },
    { name: "Seller Orders", href: "/sellerOrder" },
  ];

  const logout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/api/seller/logout`, {
        withCredentials: true, // important for httpOnly cookies
      });
      navigate("/"); // redirect to login
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/"); // fallback
    }
  };

  // Determine background class based on page
  const contentBgClass =
    page === "add-product" ? "content-area add-product-bg" : "content-area";

  return (
    <div className="seller-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Grocery App</h2>
        </div>
        <ul className="sidebar-links">
          {sidebarLinks.map((link, index) => (
            <li key={index}>
              <a href={link.href}>{link.name}</a>
            </li>
          ))}
        </ul>
        <button className="btn btn-logout" onClick={logout}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="main-header">
          <h3>Seller Panel</h3>
        </header>
        <div className={contentBgClass}>{children}</div>
      </div>
    </div>
  );
};

export default SellerLayout;
