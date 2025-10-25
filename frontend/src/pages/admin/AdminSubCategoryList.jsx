import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminSubCategoryList = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    image: null,
    preview: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Fetch all subcategories
  const fetchSubcategories = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subcategory`
      );
      setSubcategories(data || []);
    } catch (error) {
      toast.error("Failed to fetch subcategories");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch categories for dropdown in edit modal
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admindata/category`
      );
      if (data.success) setCategories(data.categories || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  // ✅ Open edit modal
  const openEditModal = (subcategory) => {
    setEditingSubCategory(subcategory);
    setFormData({
      name: subcategory.name,
      category: subcategory.category?._id || "",
      image: null,
      preview: subcategory.image || "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingSubCategory(null);
    setFormData({ name: "", category: "", image: null, preview: "" });
  };

  // ✅ Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  // ✅ Save edited subcategory
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category) {
      toast.error("Please enter all required fields");
      return;
    }

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("category", formData.category);
    if (formData.image) fd.append("image", formData.image);

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subcategory/${editingSubCategory._id}`,
        fd
      );
      if (data.success) {
        toast.success("Subcategory updated successfully!");
        fetchSubcategories();
        closeEditModal();
      } else {
        toast.error(data.message || "Failed to update subcategory");
      }
    } catch (error) {
      toast.error("Error updating subcategory");
    }
  };

  // ✅ Delete subcategory
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/subcategory/${id}`
      );
      if (data.success) {
        setSubcategories((prev) => prev.filter((s) => s._id !== id));
        toast.success("Subcategory deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete subcategory");
      }
    } catch (error) {
      toast.error("Error deleting subcategory");
    }
  };

  // ✅ Pagination
  const totalPages = Math.ceil(subcategories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubcategories = subcategories.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AdminLayout page="subcategory-list">
      <div className="container mt-4">
        <h4 className="mb-4">Subcategory List</h4>

        {loading ? (
          <p>Loading subcategories...</p>
        ) : subcategories.length === 0 ? (
          <p>No subcategories found.</p>
        ) : (
          <>
            <table className="classic-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSubcategories.map((subcategory, index) => (
                  <tr key={subcategory._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      {subcategory.image ? (
                        <img
                          src={subcategory.image}
                          alt={subcategory.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                    <td>{subcategory.name}</td>
                    <td>{subcategory.category?.name || "Unassigned"}</td>
                    <td>
                      <button
                        onClick={() => openEditModal(subcategory)}
                        style={{
                          backgroundColor: "#3498db",
                          color: "white",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "5px",
                          marginRight: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subcategory._id)}
                        style={{
                          backgroundColor: "#e74c3c",
                          color: "white",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              {Array.from({ length: totalPages }, (_, page) => (
                <button
                  key={page + 1}
                  className={currentPage === page + 1 ? "active" : ""}
                  onClick={() => handlePageChange(page + 1)}
                >
                  {page + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ✅ Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Edit Subcategory</h5>

            <input
              type="text"
              placeholder="Enter subcategory name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-control mb-3"
            />

            <select
              className="form-control mb-3"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input type="file" onChange={handleImageChange} className="form-control mb-3" />

            {formData.preview && (
              <img
                src={formData.preview}
                alt="preview"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  marginBottom: "10px",
                }}
              />
            )}

            <div className="d-flex justify-content-end gap-2">
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Update
              </button>
              <button
                onClick={closeEditModal}
                style={{
                  backgroundColor: "#95a5a6",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex; justify-content: center; align-items: center;
          z-index: 9999;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 10px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        `}
      </style>

      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default AdminSubCategoryList;
