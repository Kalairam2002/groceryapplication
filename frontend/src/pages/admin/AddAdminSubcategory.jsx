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

  const clearImage = () => {
    setSubCategoryImage(null);
    setPreview(null);
  };

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
        { headers: { "Content-Type": "multipart/form-data" } }
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

  const selectedCategoryName = categories.find((c) => c._id === selectedCategory)?.name;

  return (
    <AdminLayout page="add-subcategory">
      <section style={{ padding: "0" }}>

        <div className="page-header-bar">
          <span className="eyebrow">Catalogue / Subcategories</span>
          <h3 style={{ margin: "6px 0 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", fontWeight: 600, color: "#1C2620" }}>
            Add new subcategory
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#6E7A6C" }}>
            Create subcategories under your main categories.
          </p>
        </div>

        <div className="add-page-grid">

          <div className="form-card">
            <div className="form-field">
              <label>Subcategory name</label>
              <input
                type="text"
                placeholder="e.g. Mobiles, Shirts..."
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                required
              />
              <span className="form-hint">Shown nested under its parent category.</span>
            </div>

            <div className="form-field">
              <label>Select category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Subcategory image</label>

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
                      {subCategoryImage?.name}
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
                  setSubCategoryName("");
                  setPreview(null);
                  setSubCategoryImage(null);
                  setSelectedCategory("");
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
                    Add subcategory
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
                <span className="preview-name">{subCategoryName || "Subcategory name"}</span>
                {selectedCategoryName && (
                  <span className="badge badge-green">under {selectedCategoryName}</span>
                )}
              </div>
            </div>

            <div className="tips-card">
              <p className="tips-title">Tips for a clean listing</p>
              <ul>
                <li>Pick the right parent category first</li>
                <li>Keep names short and specific</li>
                <li>Use a square image with a plain background</li>
              </ul>
            </div>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={2000} />
      </section>
    </AdminLayout>
  );
};

export default AddAdminSubCategory;