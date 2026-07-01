import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { toast, ToastContainer } from "react-toastify";
import { Pencil, Trash2, ImagePlus } from "lucide-react";
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

  // ✅ Fetch Subcategories
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

  // ✅ Fetch Categories
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

  // ✅ Edit Modal Logic
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

  // ✅ Image Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file)
      setFormData({
        ...formData,
        image: file,
        preview: URL.createObjectURL(file),
      });
  };

  // ✅ Save Edited Subcategory
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

  // ✅ Delete
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

  // ✅ Pagination
  const totalPages = Math.ceil(subcategories.length / itemsPerPage);
  const currentData = subcategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout page="subcategory-list">
      <div className="admin-container">
        <h2 className="page-title">Subcategory Management</h2>

        {loading ? (
          <p>Loading...</p>
        ) : subcategories.length === 0 ? (
          <p>No subcategories found.</p>
        ) : (
          <>
            <div className="table-card">
              <table className="modern-table">
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
                  {currentData.map((subcategory, index) => (
                    <tr key={subcategory._id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>
                        {subcategory.image ? (
                          <img
                            src={subcategory.image}
                            alt={subcategory.name}
                            className="thumb-img"
                          />
                        ) : (
                          <div className="no-img">
                            <ImagePlus size={20} />
                          </div>
                        )}
                      </td>
                      <td>{subcategory.name}</td>
                      <td>{subcategory.category?.name || "—"}</td>
                      <td className="actions">
                        <button className="icon-btn edit" onClick={() => openEditModal(subcategory)}>
                          <Pencil size={18} />
                        </button>
                        <button
                          className="icon-btn delete"
                          onClick={() => handleDelete(subcategory._id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ Pagination */}
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ✅ Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Edit Subcategory</h4>

            <input
              type="text"
              placeholder="Subcategory Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input type="file" onChange={handleImageChange} />
            {formData.preview && <img src={formData.preview} alt="Preview" className="preview-img" />}

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
              <button className="cancel-btn" onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />

      <style>{`
        .admin-container {
          padding: 30px;
          background: #f8fafc;
          min-height: 100vh;
        }
        .page-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #333;
        }
        .table-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          overflow-x: auto;
        }
        .modern-table {
          width: 100%;
          border-collapse: collapse;
        }
        .modern-table th {
          background: #f4f6f8;
          color: #555;
          font-weight: 700;
          padding: 14px;
          text-align: left;
        }
        .modern-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #eee;
        }
        .modern-table tr:hover {
          background: #f3f4f6;
        }
        .thumb-img {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
        }
        .no-img {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border-radius: 8px;
          color: #94a3b8;
        }
        .actions {
          display: flex;
          gap: 10px;
        }
        .icon-btn {
          border: none;
          background: none;
          padding: 6px;
          cursor: pointer;
          border-radius: 6px;
          transition: 0.2s;
        }
        .icon-btn.edit:hover {
          background: #e0f2fe;
          color: #0369a1;
        }
        .icon-btn.delete:hover {
          background: #fee2e2;
          color: #b91c1c;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          margin-top: 20px;
          gap: 6px;
        }
        .pagination button {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
          transition: 0.2s;
        }
        .pagination button.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }
        .pagination button:hover {
          background: #eff6ff;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.4);
          z-index: 999;
        }
        .modal-box {
          background: white;
          padding: 25px;
          border-radius: 10px;
          width: 400px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .modal-box input, .modal-box select {
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        .preview-img {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          align-self: center;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 10px;
        }
        .save-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
        }
        .cancel-btn {
          background: #9ca3af;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminSubCategoryList;
