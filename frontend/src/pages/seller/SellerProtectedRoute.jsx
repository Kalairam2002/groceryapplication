import { Navigate } from "react-router-dom";

const SellerProtectedRoute = ({ children }) => {
  const seller = localStorage.getItem("seller");
  const sellerToken = localStorage.getItem("sellerToken");

  if (!seller || !sellerToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SellerProtectedRoute;
