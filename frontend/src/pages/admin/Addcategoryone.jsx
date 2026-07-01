import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";

const Addcategoryone = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const applyPreview = (file) => {
    setCategoryImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) applyPreview(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) applyPreview(file);
  };

  const clearImage = () => {
    setCategoryImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName || !categoryImage) {
      alert("Please fill all fields!");
      return;
    }
    const formData = new FormData();
    formData.append("name", categoryName);
    formData.append("image", categoryImage);
    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admindata/addCategory`,
        formData
      );
      setLoading(false);
      setSuccess("Category added successfully!");
      setCategoryName("");
      setCategoryImage(null);
      setPreview(null);
    } catch (err) {
      setLoading(false);
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Error adding category");
    }
  };

  return (
    <AdminLayout page="add-product">
      <section style={{ padding: "2.5rem 0" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 1rem" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.75rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#111827" }}>Add new category</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#6B7280" }}>Fill in the details to create a new product category</p>
            </div>
          </div>

          {/* Card */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Category Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Category name</label>
              <input
                type="text"
                placeholder="e.g. Electronics, Clothing..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                style={{ padding: "10px 14px", fontSize: "14px", border: "1px solid #D1D5DB", borderRadius: "8px", background: "#F9FAFB", color: "#111827", outline: "none", width: "100%", boxSizing: "border-box" }}
                onFocus={(e) => { e.target.style.borderColor = "#3B82F6"; e.target.style.background = "#fff"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.background = "#F9FAFB"; }}
              />
            </div>

            {/* Image Upload */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Category image</label>

              {!preview ? (
                <div
                  onClick={() => document.getElementById("fileInput").click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  style={{ border: `2px dashed ${isDragging ? "#3B82F6" : "#D1D5DB"}`, borderRadius: "8px", padding: "2rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", background: isDragging ? "#EFF6FF" : "#F9FAFB", transition: "all 0.15s" }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#F3F4F6", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "14px", color: "#111827", fontWeight: "500" }}>Click to upload or drag & drop</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9CA3AF" }}>PNG, JPG, WEBP up to 10MB</p>
                  </div>
                  <input id="fileInput" type="file" accept="image/*" onChange={handleImageChange} required style={{ display: "none" }} />
                </div>
              ) : (
                <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
                  <img src={preview} alt="Preview" style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "8px 12px", background: "#F9FAFB", borderTop: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "320px" }}>
                      {categoryImage?.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", padding: "2px 8px", background: "#DCFCE7", color: "#15803D", borderRadius: "999px", whiteSpace: "nowrap" }}>Ready</span>
                      <button onClick={clearImage} style={{ fontSize: "12px", color: "#EF4444", background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}>Remove</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", paddingTop: "0.25rem" }}>
              <button
                type="button"
                onClick={() => { setCategoryName(""); clearImage(); setSuccess(""); }}
                style={{ flex: 1, padding: "10px", fontSize: "14px", fontWeight: "500", border: "1px solid #E5E7EB", borderRadius: "8px", background: "#F9FAFB", color: "#6B7280", cursor: "pointer" }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{ flex: 2, padding: "10px", fontSize: "14px", fontWeight: "500", border: "none", borderRadius: "8px", background: loading ? "#9CA3AF" : "#111827", color: "#fff", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {loading ? "Adding..." : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add category
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {success && (
            <div style={{ marginTop: "1rem", padding: "12px 16px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontSize: "14px", color: "#15803D", fontWeight: "500" }}>{success}</span>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default Addcategoryone;