import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import "./AdminDashboard.css"; // keep your admin CSS

const Addcategoryone = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setCategoryImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName || !categoryImage) {
      alert("Please fill all fields!");
      return;
    }

    const formData = new FormData();
    formData.append("name", categoryName);
    formData.append("images", categoryImage);

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admindata/addCategory`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      setLoading(false);
      setSuccess("Category added successfully!");
      setCategoryName("");
      setCategoryImage(null);
      setPreview(null);
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Category added successfully!");
        setCategoryName("");
      setCategoryImage(null);
       setPreview(null);
    }
  };

  return (
    <AdminLayout page="add-product">
      <section className="orders py-5">
        <div className="container">
          <h3 className="mb-4">Add New Category</h3>

          <div className="add-category-card p-4 bg-white rounded shadow-sm">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              
              {/* Category Name */}
              <div>
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>

              {/* Category Image */}
              <div>
                <label className="form-label">Category Image</label>
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
                  <p className="mb-1">Preview:</p>
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
                {loading ? "Adding..." : "Add Category"}
              </button>

              {/* Success Message */}
              {success && <p className="text-success mt-2">{success}</p>}
            </form>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default Addcategoryone;
