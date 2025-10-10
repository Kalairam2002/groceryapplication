import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const SellerProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/seller/is-auth`,
          { withCredentials: true }
        );
        setIsAuth(res.data.success);
      } catch (err) {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) return <p>Loading...</p>;

  return isAuth ? children : <Navigate to="/" replace />;
};

export default SellerProtectedRoute;
