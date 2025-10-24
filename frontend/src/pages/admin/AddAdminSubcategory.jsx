import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import "./AdminDashboard.css"; // keep your admin CSS
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddAdminSubCategory = () => {
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Handle image preview
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

  // ✅ Handle form submit
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
        `${process.env.REACT_APP_API_URL}/api/brand`, // ✅ Correct endpoint
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
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
      <section className="orders py-5">
        <div className="container">
          <h3 className="mb-4">Add New Brand</h3>

          <div className="add-category-card p-4 bg-white rounded shadow-sm">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              {/* Brand Name */}
              <div>
                <label className="form-label fw-semibold">Brand Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter brand name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                />
              </div>

              {/* Brand Image */}
              <div>
                <label className="form-label fw-semibold">Brand Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
              </div>

              {/* Image Preview */}
              {preview && (
                <div>
                  <p className="mb-1 fw-semibold">Preview:</p>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "200px",
                      height: "auto",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary mt-2"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Brand"}
              </button>
            </form>
          </div>
        </div>
      </section>
      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default AddAdminSubCategory;
