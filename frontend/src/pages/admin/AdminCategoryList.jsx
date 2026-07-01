import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminCategoryList.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Trash2 } from "lucide-react";

const AdminCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", image: null, preview: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/admindata/category`);
      if (data.success) setCategories(data.categories || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Open edit modal
  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      image: null,
      preview: category.image || "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCategory(null);
    setFormData({ name: "", image: null, preview: "" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file, preview: URL.createObjectURL(file) });
    }
  };

  // Save edited category
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const fd = new FormData();
    fd.append("name", formData.name);
    if (formData.image) fd.append("image", formData.image);

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admindata/${editingCategory._id}`,
        fd
      );
      if (data.success) {
        toast.success("Category updated successfully!");
        fetchCategories();
        closeEditModal();
      } else {
        toast.error(data.message || "Failed to update category");
      }
    } catch (error) {
      toast.error("Error updating category");
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const { data } = await axios.delete(`${process.env.REACT_APP_API_URL}/api/admindata/${id}`);
      if (data.success) {
        setCategories((prev) => prev.filter((cat) => cat._id !== id));
        toast.success("Category deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Error deleting category");
    }
  };

  // Pagination
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AdminLayout page="category-list">
      <div className="admin-container">
        <div className="header-bar">
          <h2>📦 Category Management</h2>
          <p className="subtitle">Manage and update your product categories easily</p>
        </div>

        {loading ? (
          <div className="loader">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="no-data">No categories found.</div>
        ) : (
          <div className="table-card">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category, index) => (
                  <tr key={category._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{category._id}</td>
                    <td>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="table-img"
                        />
                      ) : (
                        <span className="no-img">No Image</span>
                      )}
                    </td>
                    <td>{category.name}</td>
                    <td className="text-center">
                      {/* <button className="btn-edit" onClick={() => openEditModal(category)}>
                        Edit
                      </button> */}
                      <button className="icon-btn edit btn-edit"  onClick={() => openEditModal(category)}>
                          <Pencil size={18} />
                        </button>
                      {/* <button className="btn-delete" onClick={() => handleDelete(category._id)}>
                        Delete
                      </button> */}

                      <button className="icon-btn delete btn-delete" onClick={() => handleDelete(category._id)}>
                          <Trash2 size={18} />
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
                  className={`page-btn ${currentPage === page + 1 ? "active" : ""}`}
                  onClick={() => handlePageChange(page + 1)}
                >
                  {page + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit Category</h3>
            <input
              type="text"
              placeholder="Category name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input type="file" onChange={handleImageChange} />
            {formData.preview && <img src={formData.preview} alt="preview" className="preview-img" />}
            <div className="modal-actions">
              <button className="btn-save" onClick={handleSave}>
                Update
              </button>
              <button className="btn-cancel" onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default AdminCategoryList;
