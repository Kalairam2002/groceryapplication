import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminAddSeller = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phonenumber: "",
    gstnumber: "",
    address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/seller/admin-add`,
        formData,
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("✅ Seller added successfully");
        setTimeout(() => navigate("/sellerList"), 1200);
      } else {
        toast.error(data.message || "❌ Failed to add seller");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AdminLayout page="add-seller">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Network / Sellers</span>
            <h4>Add seller</h4>
            <p className="subtitle">Create a seller account directly — no OTP required.</p>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #E3E8DD",
            borderRadius: "14px",
            padding: "1.75rem",
            maxWidth: "640px",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                className="form-input"
                placeholder="Seller Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                className="form-input"
                placeholder="Email Address (optional)"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-row mt-2">
              <input
                type="password"
                className="form-input"
                placeholder="Temporary Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                className="form-input"
                placeholder="Phone Number"
                name="phonenumber"
                value={formData.phonenumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row mt-2">
              <input
                type="text"
                className="form-input"
                placeholder="GST Number"
                name="gstnumber"
                value={formData.gstnumber}
                onChange={handleChange}
                required
                style={{ flex: 1 }}
              />
            </div>

            <textarea
              className="form-textarea mt-2"
              rows={3}
              placeholder="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              style={{ width: "100%", boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => navigate("/sellerList")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #E3E8DD",
                  background: "#fff",
                  color: "#1C2620",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  minWidth: "140px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#1C2620",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? "Adding..." : "+ Add Seller"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default AdminAddSeller;