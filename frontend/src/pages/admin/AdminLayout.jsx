import { useNavigate } from "react-router-dom";
import axios from 'axios';

const AdminLayout = ({ children, page }) => {
     const navigate = useNavigate();
  const sidebarLinks = [
    { name: "Dashboard", href: "#" },
    { name: "Add Category", href: "/addcategory" },
    { name: "Product List", href: "/adminProductList" },
    { name: "Order List", href: "/adminOrderList" },
    { name: "Seller List", href: "/sellerList" },
    { name: "Contact List", href: "/contactList" },
  ];

 const logout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/logout`, {
        withCredentials: true, // important for cookies
      });

      // Redirect to login page
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/"); // fallback redirect
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
          <h3>Admin Panel</h3>
        </header>
        <div className={contentBgClass}>{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
