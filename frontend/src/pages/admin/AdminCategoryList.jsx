import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminCategoryList.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Trash2, ImageOff } from "lucide-react";

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
          <div>
            <span className="eyebrow">Catalogue / Categories</span>
            <h2>Category management</h2>
            <p className="subtitle">Manage and update your product categories</p>
          </div>
          <a href="/addcategory" className="btn-add-new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New category
          </a>
        </div>

        {loading ? (
          <div className="loader">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="no-data">No categories found.</div>
        ) : (
          <div className="table-card">
            <div className="table-card-top">
              <span className="count-pill"><b>{categories.length}</b> categories total</span>
            </div>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category, index) => (
                  <tr key={category._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td className="cat-id">{category._id}</td>
                    <td>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="table-img"
                        />
                      ) : (
                        <span className="img-placeholder"><ImageOff size={16} /></span>
                      )}
                    </td>
                    <td className="cat-name">{category.name}</td>
                    <td className="text-center">
                      <button className="icon-btn edit btn-edit" onClick={() => openEditModal(category)}>
                        <Pencil size={16} />
                      </button>
                      <button className="icon-btn delete btn-delete" onClick={() => handleDelete(category._id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
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
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit category</h3>

            <div className="modal-field">
              <label>Category name</label>
              <input
                type="text"
                placeholder="Category name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <label>Category image</label>
              <div className="modal-file-row">
                {formData.preview && <img src={formData.preview} alt="preview" className="preview-img" />}
                <label className="file-btn" htmlFor="editImageInput">Choose image</label>
                <input id="editImageInput" type="file" onChange={handleImageChange} />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeEditModal}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSave}>
                Update category
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