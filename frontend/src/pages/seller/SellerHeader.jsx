import React from "react";
// import { useAppContext } from "../../context/AppContext";

const SellerHeader = () => {
//   const { logout } = useAppContext(); // Assume you have logout function

  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-2 mb-4">
      <a className="navbar-brand fw-bold" href="#">
        MarketPro Seller
      </a>
      <div className="ms-auto">
        <button
          className="btn btn-outline-danger"
        //   onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default SellerHeader;
