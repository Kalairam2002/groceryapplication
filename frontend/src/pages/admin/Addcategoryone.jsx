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
      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", color: "#2F6D4F", textTransform: "uppercase" }}>
            Catalogue / Categories
          </span>
          <h2 style={{ margin: "6px 0 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", fontWeight: "600", color: "#1C2620" }}>
            Add new category
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#6E7A6C" }}>
            Create a category shoppers will browse from the storefront menu.
          </p>
        </div>

        {/* Two-column layout: form + live preview */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px", alignItems: "start" }}>

          {/* Form card */}
          <div style={{ background: "#fff", border: "1px solid #E3E8DD", borderRadius: "14px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#1C2620" }}>Category name</label>
              <input
                type="text"
                placeholder="e.g. Vegetables, Dairy, Snacks..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                style={{ padding: "11px 14px", fontSize: "14px", border: "1px solid #E3E8DD", borderRadius: "8px", background: "#F5F7F1", color: "#1C2620", outline: "none", width: "100%", boxSizing: "border-box" }}
                onFocus={(e) => { e.target.style.borderColor = "#2F6D4F"; e.target.style.background = "#fff"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E3E8DD"; e.target.style.background = "#F5F7F1"; }}
              />
              <span style={{ fontSize: "12px", color: "#9AA69A" }}>Shown as the label on category tiles and filters.</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#1C2620" }}>Category image</label>

              {!preview ? (
                <div
                  onClick={() => document.getElementById("fileInput").click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  style={{ border: `2px dashed ${isDragging ? "#2F6D4F" : "#E3E8DD"}`, borderRadius: "10px", padding: "2.5rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", cursor: "pointer", background: isDragging ? "#E4F1E8" : "#F5F7F1", transition: "all 0.15s" }}
                >
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#fff", border: "1px solid #E3E8DD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F6D4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "14px", color: "#1C2620", fontWeight: "500" }}>Click to upload or drag & drop</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9AA69A" }}>PNG, JPG, WEBP up to 10MB &middot; square images look best</p>
                  </div>
                  <input id="fileInput" type="file" accept="image/*" onChange={handleImageChange} required style={{ display: "none" }} />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "14px", border: "1px solid #E3E8DD", borderRadius: "10px", padding: "12px" }}>
                  <img src={preview} alt="Preview" style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#1C2620", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {categoryImage?.name}
                    </p>
                    <span style={{ fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "600", padding: "2px 8px", background: "#E4F1E8", color: "#1F4B37", borderRadius: "999px" }}>Ready</span>
                  </div>
                  <button onClick={clearImage} style={{ fontSize: "12px", color: "#E8622C", background: "none", border: "none", cursor: "pointer", fontWeight: "500", flexShrink: 0 }}>Remove</button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", paddingTop: "0.25rem", borderTop: "1px solid #F0F2EC", marginTop: "0.25rem" }}>
              <button
                type="button"
                onClick={() => { setCategoryName(""); clearImage(); setSuccess(""); }}
                style={{ padding: "10px 20px", fontSize: "14px", fontWeight: "500", border: "1px solid #E3E8DD", borderRadius: "8px", background: "#fff", color: "#6E7A6C", cursor: "pointer", marginTop: "1rem" }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{ flex: 1, padding: "10px 20px", fontSize: "14px", fontWeight: "500", border: "none", borderRadius: "8px", background: loading ? "#9AA69A" : "#1F4B37", color: "#fff", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "1rem" }}
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

            {success && (
              <div style={{ padding: "12px 16px", background: "#E4F1E8", border: "1px solid #BFE0CC", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F4B37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ fontSize: "14px", color: "#1F4B37", fontWeight: "500" }}>{success}</span>
              </div>
            )}
          </div>

          {/* Right column: live preview + guidance, fills the empty space */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Live preview card, styled like an actual storefront tile */}
            <div style={{ background: "#fff", border: "1px solid #E3E8DD", borderRadius: "14px", padding: "1.25rem" }}>
              <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: "600", color: "#6E7A6C", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Storefront preview
              </p>
              <div style={{ border: "1px solid #E3E8DD", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", background: "#F5F7F1" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: preview ? "transparent" : "#E4F1E8", border: "1px solid #E3E8DD", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {preview ? (
                    <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F6D4F" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
                  )}
                </div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "14px", fontWeight: "600", color: "#1C2620", textAlign: "center" }}>
                  {categoryName || "Category name"}
                </span>
              </div>
            </div>

            {/* Guidance panel */}
            <div style={{ background: "#1F4B37", borderRadius: "14px", padding: "1.25rem", color: "#EAF2EC" }}>
              <p style={{ margin: "0 0 10px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "14px", fontWeight: "600" }}>Tips for a clean listing</p>
              <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: "12.5px", lineHeight: "1.9", color: "#C7DDCE" }}>
                <li>Keep names short — one or two words works best</li>
                <li>Use a square image with a plain background</li>
                <li>Avoid text baked into the image itself</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default Addcategoryone;