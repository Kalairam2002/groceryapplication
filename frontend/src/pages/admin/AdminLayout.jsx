import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./AdminLayout.css";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Layers,
  ShoppingCart,
  Package,
  User,
  Settings,
  LogOut,
  Tag,
  Grid,
  Bell,
} from "lucide-react";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  //  Notification state
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [showDropdown, setShowDropdown]     = useState(false);
  const dropdownRef                         = useRef(null);

  const sidebarLinks = [
    { name: "Dashboard",        href: "/Dashbord",        icon: <LayoutDashboard size={18} /> },
    { name: "Add Category",     href: "/addcategory",     icon: <Grid size={18} /> },
    { name: "Category List",    href: "/listCategory",    icon: <Grid size={18} /> },
    { name: "Add SubCategory",  href: "/addSubCategory",  icon: <Layers size={18} /> },
    { name: "SubCategory List", href: "/listSubCategory", icon: <Layers size={18} /> },
    // { name: "Add Variant",      href: "/addVariant",      icon: <Tag size={18} /> },
    // { name: "Variant List",     href: "/listVariant",     icon: <Tag size={18} /> },
    { name: "Add Brand",        href: "/addBrand",        icon: <Package size={18} /> },
    { name: "Brand List",       href: "/listBrand",       icon: <Package size={18} /> },
    { name: "Add Product",      href: "/adminAddProduct", icon: <ShoppingCart size={18} /> },
    { name: "Product List",     href: "/adminProductList",icon: <ShoppingCart size={18} /> },
    { name: "Order List",       href: "/adminOrderList",  icon: <ShoppingCart size={18} /> },
    { name: "Seller List",      href: "/sellerList",      icon: <User size={18} /> },
    { name: "Contact List",     href: "/contactList",     icon: <Settings size={18} /> },
    { name: "Delivery Boy List",href: "/deliveryBoyList", icon: <User size={18} /> },
  ];

  //  Fetch notifications every 30 seconds
  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/notifications`
      );
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //  Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/notifications/mark-read`);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/logout`, {
        withCredentials: true,
      });
      window.history.replaceState(null, "", "/");
      navigate("/", { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/", { replace: true });
    }
  };

  // Status → color, tied to the market-green / crate-orange palette
  const statusColors = {
    "Picked Up":        "#D98B3F", // crate wood tone — in progress
    "Out for Delivery": "#2F6D4F", // primary green — moving
    "Delivered":        "#1F4B37", // primary dark — complete
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 style={{ color: "white" }}>🥬 Multi-Vendor</h2>
          <p>Admin Panel</p>
        </div>
        <ul className="sidebar-links">
          {sidebarLinks.map((link, index) => {
            const isActive = location.pathname === link.href;
            return (
              <li key={index} className={isActive ? "active" : ""}>
                <a href={link.href}>
                  {link.icon}
                  <span>{link.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Area */}
      <div className="admin-main">
        <header className="admin-header">
          <h3>Welcome, Administrator</h3>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

            {/*  Bell Notification Icon */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  background: "#f5f7f1",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  padding: "8px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  color: "#1f4b37",
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "0px",
                    right: "0px",
                    background: "#e8622c",
                    color: "#fff",
                    fontSize: "10px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: "600",
                    width: "17px",
                    height: "17px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #fff",
                  }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showDropdown && (
                <div style={{
                  position: "absolute",
                  top: "44px",
                  right: "0",
                  width: "320px",
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 12px 32px rgba(31, 75, 55, 0.18)",
                  border: "1px solid #e3e8dd",
                  zIndex: 9999,
                  overflow: "hidden",
                }}>

                  {/* Dropdown header */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderBottom: "1px solid #f0f2ec",
                  }}>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#1c2620",
                    }}>
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2f6d4f",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{
                        padding: "24px",
                        textAlign: "center",
                        color: "#6e7a6c",
                        fontSize: "13px",
                      }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid #f0f2ec",
                          background: n.isRead ? "#fff" : "#f5f7f1",
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                        }}>
                          {/* Status dot */}
                          <div style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: statusColors[n.status] || "#6e7a6c",
                            marginTop: "4px",
                            flexShrink: 0,
                          }} />
                          <div style={{ flex: 1 }}>
                            <p style={{
                              margin: "0 0 4px",
                              fontSize: "13px",
                              color: "#1c2620",
                              fontWeight: n.isRead ? "400" : "600",
                            }}>
                              {n.message}
                            </p>
                            <span style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: "11px",
                              color: "#9aa69a",
                            }}>
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Logout button — untouched logic, restyled via .logout-btn */}
            <button className="logout-btn" onClick={logout}>
              <LogOut size={18} /> Logout
            </button>

          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
