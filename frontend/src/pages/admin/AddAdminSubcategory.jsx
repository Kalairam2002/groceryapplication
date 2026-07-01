import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import "./AdminDashboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddAdminSubCategory = () => {
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryImage, setSubCategoryImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all categories for dropdown
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admindata/category`
      );
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSubCategoryImage(file);

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

    if (!subCategoryName || !subCategoryImage || !selectedCategory) {
      toast.warn("Please fill all fields!");
      return;
    }

    const formData = new FormData();
    formData.append("name", subCategoryName);
    formData.append("category", selectedCategory);
    formData.append("image", subCategoryImage);

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subcategory`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        toast.success("Subcategory added successfully!");
        setSubCategoryName("");
        setSubCategoryImage(null);
        setPreview(null);
        setSelectedCategory("");
      } else {
        toast.error(res.data.message || "Error adding subcategory");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Error adding subcategory");
    } finally {
      setLoading(false);
    }
  };

return (
  <AdminLayout page="add-subcategory">
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
              Add new subcategory
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#6B7280" }}>
              Create subcategories under your main categories
            </p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Subcategory Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
              Subcategory name
            </label>
            <input
              type="text"
              placeholder="e.g. Mobiles, Shirts..."
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
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

          {/* Category Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
              Select category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload (Same as Addcategoryone) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
              Subcategory image
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
                setSubCategoryName("");
                setPreview(null);
                setSubCategoryImage(null);
                setSelectedCategory("");
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
                cursor: "pointer"
              }}
            >
              {loading ? "Adding..." : "Add Subcategory"}
            </button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </section>
  </AdminLayout>
);
};

export default AddAdminSubCategory;
