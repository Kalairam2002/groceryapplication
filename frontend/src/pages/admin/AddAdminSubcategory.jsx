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
      <section className="orders py-5">
        <div className="container">
          <h3 className="mb-4">Add New Subcategory</h3>

          <div className="add-category-card p-4 bg-white rounded shadow-sm">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              
              {/* Subcategory Name */}
              <div>
                <label className="form-label fw-semibold">Subcategory Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter subcategory name"
                  value={subCategoryName}
                  onChange={(e) => setSubCategoryName(e.target.value)}
                  required
                />
              </div>

              {/* Select Category */}
              <div>
                <label className="form-label fw-semibold">Select Category</label>
                <select
                  className="form-control"
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

              {/* Subcategory Image */}
              <div>
                <label className="form-label fw-semibold">Subcategory Image</label>
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
                {loading ? "Adding..." : "Add Subcategory"}
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
