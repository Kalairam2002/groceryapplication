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

  const clearImage = () => {
    setVariantImage(null);
    setPreview(null);
  };

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
        { headers: { "Content-Type": "multipart/form-data" } }
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

  const selectedSubCategoryName = subCategories.find((s) => s._id === selectedSubCategory)?.name;

  return (
    <AdminLayout page="add-variant">
      <section style={{ padding: "0" }}>

        <div className="page-header-bar">
          <span className="eyebrow">Catalogue / Variants</span>
          <h3 style={{ margin: "6px 0 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", fontWeight: 600, color: "#1C2620" }}>
            Add new variant
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#6E7A6C" }}>
            Create product variants under subcategories.
          </p>
        </div>

        <div className="add-page-grid">

          <div className="form-card">
            <div className="form-field">
              <label>Variant name</label>
              <input
                type="text"
                placeholder="e.g. 1kg, 500g, Large..."
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                required
              />
              <span className="form-hint">Shown as the selectable option on the product page.</span>
            </div>

            <div className="form-field">
              <label>Select subcategory</label>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                required
              >
                <option value="">-- Select Subcategory --</option>
                {subCategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Variant image</label>

              {!preview ? (
                <div className="dropzone" onClick={() => document.getElementById("fileInput").click()}>
                  <div className="dropzone-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F6D4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#1C2620" }}>Click to upload or drag &amp; drop</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#9AA69A" }}>PNG, JPG, WEBP up to 10MB</p>
                  <input id="fileInput" type="file" accept="image/*" onChange={handleImageChange} required style={{ display: "none" }} />
                </div>
              ) : (
                <div className="preview-row">
                  <img src={preview} alt="Preview" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "500", color: "#1C2620", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {variantImage?.name}
                    </p>
                    <span className="ready-pill">Ready</span>
                  </div>
                  <button className="remove-link" onClick={clearImage}>Remove</button>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-reset"
                onClick={() => {
                  setVariantName("");
                  setPreview(null);
                  setVariantImage(null);
                  setSelectedSubCategory("");
                }}
              >
                Reset
              </button>
              <button type="button" className="btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? "Adding..." : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add variant
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="side-panel">
            <div className="preview-card">
              <p className="panel-label">Storefront preview</p>
              <div className="preview-tile">
                <div className="preview-avatar">
                  {preview ? (
                    <img src={preview} alt="" />
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F6D4F" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
                  )}
                </div>
                <span className="preview-name">{variantName || "Variant name"}</span>
                {selectedSubCategoryName && (
                  <span className="badge badge-green">under {selectedSubCategoryName}</span>
                )}
              </div>
            </div>

            <div className="tips-card">
              <p className="tips-title">Tips for a clean listing</p>
              <ul>
                <li>Use consistent units across a subcategory (kg, g, ml)</li>
                <li>Keep the label short — it sits on a small selector</li>
                <li>Only add an image if it visually differs from the base product</li>
              </ul>
            </div>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={2000} />
      </section>
    </AdminLayout>
  );
};

export default AddAdminVariant;