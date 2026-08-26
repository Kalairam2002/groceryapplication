import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, PlusCircle, List, Barcode,
  Package, LogOut, User, ShoppingBag, FileText, Bell,
} from "lucide-react";
import "./SellerLayout.css";
import { RotateCcw } from "lucide-react";

const API = process.env.REACT_APP_API_URL;

const SellerLayout = ({ children }) => {
  const navigate = useNavigate();

  //  Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [showDropdown, setShowDropdown]   = useState(false);
  const dropdownRef                       = useRef(null);

  const sidebarLinks = [
    { name: "Dashboard",         href: "/sellerDashboard",       icon: <LayoutDashboard size={18} /> },
    { name: "Add Product",       href: "/selleraddproduct",       icon: <PlusCircle size={18} /> },
    { name: "Existing Products", href: "/sellerExistingProducts", icon: <ShoppingBag size={18} /> },
    { name: "Expired Variants",  href: "/seller/expired",         icon: <FileText size={18} /> },
    { name: "Product List",      href: "/SellerProductList",      icon: <List size={18} /> },
    { name: "Barcode List",      href: "/barcodeScanner",         icon: <Barcode size={18} /> },
    { name: "Seller Orders",     href: "/sellerOrder",            icon: <Package size={18} /> },
    { name: "Invoices",          href: "/seller/invoices",        icon: <FileText size={18} /> },
    { name: "Billing",           href: "/seller/billing",         icon: <LayoutDashboard size={18} /> },
    { name: "Edit Profile",      href: "/seller/edit-profile",    icon: <User size={18} /> },
    { name: "Returns",           href: "/seller/returns",         icon: <RotateCcw size={18} /> },
  ];

  const getSellerId = () => {
    const seller = localStorage.getItem("seller");
    if (seller) {
      const parsed = JSON.parse(seller);
      return parsed._id || parsed.sellerId || null; // handles both cases
    }
    return null;
  };

  //  Fetch seller notifications
  const fetchNotifications = async () => {
    const sellerId = getSellerId();
    if (!sellerId) return;
    try {
      const { data } = await axios.get(
        `${API}/api/admin/seller-notifications/${sellerId}`
      );
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch seller notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  //  Close dropdown on outside click
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
    const sellerId = getSellerId();
    if (!sellerId) return;
    try {
      await axios.put(`${API}/api/admin/seller-notifications/mark-read/${sellerId}`);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${API}/api/seller/logout`, { withCredentials: true });
      localStorage.clear();
      sessionStorage.clear();
      window.history.replaceState(null, "", "/");
      navigate("/", { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/", { replace: true });
    }
  };

  const statusColors = {
    "Picked Up":        "#f0ad4e",
    "Out for Delivery": "#0d6efd",
    "Delivered":        "#28a745",
  };

  return (
    <div className="seller-dashboard">
      {/* Sidebar */}
      <aside className="seller-sidebar">
        <div className="sidebar-header">
          <h2 className="text-white">🛒 Grocery Seller</h2>
          <p>Seller Panel</p>
        </div>
        <ul className="sidebar-links">
          {sidebarLinks.map((link, index) => (
            <li key={index}>
              <NavLink
                to={link.href}
                className={({ isActive }) =>
                  isActive ? "active sidebar-link" : "sidebar-link"
                }
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Area */}
      <div className="seller-main">
        <header className="seller-header">
          <h3>Welcome, Seller</h3>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

            {/*  Bell Notification Icon */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  background: "#F6F7FB", border: "none",
                  cursor: "pointer", position: "relative",
                  padding: "8px", borderRadius: "50%", display: "flex",
                  alignItems: "center", color: "#262F52",
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: "0px", right: "0px",
                    background: "#D9A227", color: "#1E2233",
                    fontSize: "10px", fontWeight: "700",
                    width: "17px", height: "17px",
                    borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    border: "2px solid #fff",
                  }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/*  Dropdown */}
              {showDropdown && (
                <div style={{
                  position: "absolute", top: "44px", right: "0",
                  width: "320px", background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 12px 32px rgba(38,47,82,0.18)",
                  border: "1px solid #E4E7F0", zIndex: 9999,
                  overflow: "hidden",
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", padding: "14px 16px",
                    borderBottom: "1px solid #F0F1F7",
                  }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: "600", fontSize: "14px", color: "#1E2233" }}>
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          background: "none", border: "none",
                          color: "#3B4C8A", fontSize: "12px",
                          cursor: "pointer", fontWeight: "600",
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{
                        padding: "24px", textAlign: "center",
                        color: "#6B7280", fontSize: "13px",
                      }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid #F0F1F7",
                          background: n.isRead ? "#fff" : "#F6F7FB",
                          display: "flex", gap: "10px",
                          alignItems: "flex-start",
                        }}>
                          <div style={{
                            width: "10px", height: "10px",
                            borderRadius: "50%",
                            background: statusColors[n.status] || "#6B7280",
                            marginTop: "4px", flexShrink: 0,
                          }} />
                          <div style={{ flex: 1 }}>
                            <p style={{
                              margin: "0 0 4px", fontSize: "13px",
                              color: "#1E2233",
                              fontWeight: n.isRead ? "400" : "600",
                            }}>
                              {n.message}
                            </p>
                            <span style={{ fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", color: "#9CA3AF" }}>
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

            {/* Logout */}
            <button className="logout-btn" onClick={logout}>
              <LogOut size={18} /> Logout
            </button>

          </div>
        </header>

        <main className="seller-content">{children}</main>
      </div>
    </div>
  );
};

export default SellerLayout;