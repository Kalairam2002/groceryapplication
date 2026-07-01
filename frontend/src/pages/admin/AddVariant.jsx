import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import "./AdminDashboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddAdminVariant = () => {
  const [variantName, setVariantName] = useState("");
  const [variantImage, setVariantImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all subcategories for dropdown
  const fetchSubCategories = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subcategory`
      );
      if (res.data && Array.isArray(res.data)) {
        setSubCategories(res.data);
      } else if (res.data.success) {
        setSubCategories(res.data.subCategories || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subcategories");
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  // ✅ Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setVariantImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!variantName || !variantImage || !selectedSubCategory) {
      toast.warn("Please fill all fields!");
      return;
    }

    const formData = new FormData();
    formData.append("name", variantName);
    formData.append("subcategory", selectedSubCategory);
    formData.append("image", variantImage);

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/variant`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        toast.success("Variant added successfully!");
        setVariantName("");
        setVariantImage(null);
        setPreview(null);
        setSelectedSubCategory("");
      } else {
        toast.error(res.data.message || "Error adding variant");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Error adding variant");
    } finally {
      setLoading(false);
    }
  };

return (
  <AdminLayout page="add-variant">
    <section style={{ padding: "2.5rem 0" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 1rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.75rem" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#111827" }}>
              Add new variant
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#6B7280" }}>
              Create product variants under subcategories
            </p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Variant Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
              Variant name
            </label>
            <input
              type="text"
              placeholder="e.g. 128GB, Red Color..."
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              required
              style={{
                padding: "10px 14px",
                fontSize: "14px",
                border: "1px solid #D1D5DB",
                borderRadius: "8px",
                background: "#F9FAFB",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3B82F6";
                e.target.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#D1D5DB";
                e.target.style.background = "#F9FAFB";
              }}
            />
          </div>

          {/* Subcategory Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
              Select subcategory
            </label>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              required
              style={{
                padding: "10px 14px",
                fontSize: "14px",
                border: "1px solid #D1D5DB",
                borderRadius: "8px",
                background: "#F9FAFB",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3B82F6";
                e.target.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#D1D5DB";
                e.target.style.background = "#F9FAFB";
              }}
            >
              <option value="">-- Select Subcategory --</option>
              {subCategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
              Variant image
            </label>

            {!preview ? (
              <div
                onClick={() => document.getElementById("fileInput").click()}
                style={{
                  border: "2px dashed #D1D5DB",
                  borderRadius: "8px",
                  padding: "2rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#F9FAFB"
                }}
              >
                <p style={{ margin: 0 }}>Click to upload image</p>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  style={{ display: "none" }}
                />
              </div>
            ) : (
              <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: "100%", height: "180px", objectFit: "cover" }}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => {
                setVariantName("");
                setPreview(null);
                setVariantImage(null);
                setSelectedSubCategory("");
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                background: "#F9FAFB",
                cursor: "pointer"
              }}
            >
              Reset
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 2,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                background: loading ? "#9CA3AF" : "#111827",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Adding..." : "Add Variant"}
            </button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </section>
  </AdminLayout>
);
};

export default AddAdminVariant;
