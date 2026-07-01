import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const SellerResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/seller/reset-password/${token}`,
        { newPassword, confirmPassword }
      );
      
      alert(res.data.message || "Password updated successfully");
      navigate("/seller");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#4CAF50",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* White Card */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h4 style={{ marginBottom: "6px" }}>🔐 Reset Your Password</h4>
          <p style={{ color: "#666", fontSize: "14px" }}>
            Set a new password for your MaligaiJaman account
          </p>
        </div>
  
        {/* Form */}
        <form
          onSubmit={handleResetPassword}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
  
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
  
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#fa6400",
              color: "white",
              border: "none",
              borderRadius: "4px",
              marginTop: "10px",
            }}
          >
            {loading ? "Updating..." : "Change My Password"}
          </button>
        </form>
      </div>
    </div>
  )
};  
export default SellerResetPassword;
