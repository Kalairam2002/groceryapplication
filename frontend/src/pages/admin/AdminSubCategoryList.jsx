import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminCategoryList.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Trash2, ImageOff } from "lucide-react";

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

  const fetchSubcategories = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/subcategory`);
      setSubcategories(data || []);
    } catch {
      toast.error("Failed to fetch subcategories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/admindata/category`);
      if (data.success) setCategories(data.categories || []);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file)
      setFormData({
        ...formData,
        image: file,
        preview: URL.createObjectURL(file),
      });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category)
      return toast.error("Please fill all fields");

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
        toast.success("Subcategory updated!");
        fetchSubcategories();
        closeEditModal();
      } else toast.error("Failed to update");
    } catch {
      toast.error("Error updating subcategory");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      const { data } = await axios.delete(`${process.env.REACT_APP_API_URL}/api/subcategory/${id}`);
      if (data.success) {
        setSubcategories((prev) => prev.filter((s) => s._id !== id));
        toast.success("Deleted successfully!");
      } else toast.error("Delete failed");
    } catch {
      toast.error("Error deleting subcategory");
    }
  };

  const totalPages = Math.ceil(subcategories.length / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentData = subcategories.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  return (
    <AdminLayout page="subcategory-list">
      <div className="admin-container">

        <div className="header-bar">
          <div>
            <span className="eyebrow">Catalogue / Subcategories</span>
            <h2>Subcategory management</h2>
            <p className="subtitle">Manage subcategories nested under your main categories</p>
          </div>
          <a href="/addSubCategory" className="btn-add-new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New subcategory
          </a>
        </div>

        {loading ? (
          <div className="loader">Loading subcategories...</div>
        ) : subcategories.length === 0 ? (
          <div className="no-data">No subcategories found.</div>
        ) : (
          <div className="table-card">
            <div className="table-card-top">
              <span className="count-pill"><b>{subcategories.length}</b> subcategories total</span>
            </div>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((subcategory, index) => (
                  <tr key={subcategory._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      {subcategory.image ? (
                        <img src={subcategory.image} alt={subcategory.name} className="table-img" />
                      ) : (
                        <span className="img-placeholder"><ImageOff size={16} /></span>
                      )}
                    </td>
                    <td className="cat-name">{subcategory.name}</td>
                    <td>{subcategory.category?.name || "—"}</td>
                    <td className="text-center">
                      <button className="icon-btn edit btn-edit" onClick={() => openEditModal(subcategory)}>
                        <Pencil size={16} />
                      </button>
                      <button className="icon-btn delete btn-delete" onClick={() => handleDelete(subcategory._id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit subcategory</h3>

            <div className="modal-field">
              <label>Subcategory name</label>
              <input
                type="text"
                placeholder="Subcategory name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E3E8DD", background: "#F5F7F1", fontSize: "13.5px", color: "#1C2620" }}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Subcategory image</label>
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
                Update subcategory
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default AdminSubCategoryList;