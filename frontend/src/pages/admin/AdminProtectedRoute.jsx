import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const admin = localStorage.getItem("admin");
  const adminToken = localStorage.getItem("adminToken");

  if (!admin || !adminToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
