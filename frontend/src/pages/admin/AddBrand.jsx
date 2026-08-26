import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import "./AdminDashboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddBrand = () => {
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setBrandImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const clearImage = () => {
    setBrandImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brandName || !brandImage) {
      toast.warn("Please fill all fields!");
      return;
    }

    const formData = new FormData();
    formData.append("name", brandName);
    formData.append("image", brandImage);

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/brand`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(res.data?.message || "Brand added successfully!");
      setBrandName("");
      setBrandImage(null);
      setPreview(null);
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Error adding brand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout page="add-brand">
      <section style={{ padding: "0" }}>

        <div className="page-header-bar">
          <span className="eyebrow">Catalogue / Brands</span>
          <h3 style={{ margin: "6px 0 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", fontWeight: 600, color: "#1C2620" }}>
            Add new brand
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#6E7A6C" }}>
            Create and manage the brands shoppers can filter by.
          </p>
        </div>

        <div className="add-page-grid">

          <div className="form-card">
            <div className="form-field">
              <label>Brand name</label>
              <input
                type="text"
                placeholder="e.g. Nike, Apple..."
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
              <span className="form-hint">Shown on product pages and brand filters.</span>
            </div>

            <div className="form-field">
              <label>Brand image</label>

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
                      {brandImage?.name}
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
                onClick={() => { setBrandName(""); setBrandImage(null); setPreview(null); }}
              >
                Reset
              </button>
              <button type="button" className="btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? "Adding..." : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add brand
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
                <span className="preview-name">{brandName || "Brand name"}</span>
              </div>
            </div>

            <div className="tips-card">
              <p className="tips-title">Tips for a clean listing</p>
              <ul>
                <li>Use the brand's actual logo where possible</li>
                <li>A transparent or plain background works best</li>
                <li>Keep the name exactly as customers search for it</li>
              </ul>
            </div>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={2000} />
      </section>
    </AdminLayout>
  );
};

export default AddBrand;