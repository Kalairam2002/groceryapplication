import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "./AdminLayout";

const VariantList = () => {
  const [variants, setVariants] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    subcategory: "",
    image: null,
    preview: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Fetch variants
  const fetchVariants = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/variant`
      );
      setVariants(data.variants || data || []);
    } catch (error) {
      toast.error("Failed to fetch variants");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch subcategories
  const fetchSubcategories = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subcategory`
      );
      setSubcategories(
        Array.isArray(data)
          ? data
          : data.subCategories || data.subcategories || []
      );
    } catch {
      toast.error("Failed to fetch subcategories");
    }
  };

  useEffect(() => {
    fetchVariants();
    fetchSubcategories();
  }, []);

  // ✅ Edit modal handlers
  const openEditModal = (variant) => {
    setEditingVariant(variant);
    setFormData({
      name: variant.name,
      subcategory: variant.subcategory?._id || "",
      image: null,
      preview: variant.image || "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingVariant(null);
    setFormData({ name: "", subcategory: "", image: null, preview: "" });
  };

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

  // ✅ Save variant
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subcategory) {
      toast.error("Please fill all required fields");
      return;
    }

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("subcategory", formData.subcategory);
    if (formData.image) fd.append("image", formData.image);

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/variant/${editingVariant._id}`,
        fd
      );
      if (data.success) {
        toast.success("Variant updated successfully!");
        fetchVariants();
        closeEditModal();
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Error updating variant");
    }
  };

  // ✅ Delete variant
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) return;

    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/variant/${id}`
      );
      if (data.success) {
        setVariants((prev) => prev.filter((v) => v._id !== id));
        toast.success("Variant deleted successfully!");
      }
    } catch {
      toast.error("Error deleting variant");
    }
  };

  // ✅ Pagination
  const totalPages = Math.ceil(variants.length / itemsPerPage);
  const currentVariants = variants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout page="variant-list">
      <div className="variant-container">
        <h3 className="title">Variant List</h3>

        {loading ? (
          <p className="loading">Loading variants...</p>
        ) : variants.length === 0 ? (
          <p className="empty">No variants found.</p>
        ) : (
          <>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Subcategory</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentVariants.map((variant, index) => (
                  <tr key={variant._id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>
                      {variant.image ? (
                        <img
                          src={variant.image}
                          alt={variant.name}
                          className="variant-img"
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                    <td>{variant.name}</td>
                    <td>{variant.subcategory?.name || "Unassigned"}</td>
                    <td>
                      <FaEdit
                        className="action-icon edit"
                        onClick={() => openEditModal(variant)}
                      />
                      <FaTrash
                        className="action-icon delete"
                        onClick={() => handleDelete(variant._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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
          <div className="modal">
            <h4>Edit Variant</h4>
            <input
              type="text"
              placeholder="Variant name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <select
              value={formData.subcategory}
              onChange={(e) =>
                setFormData({ ...formData, subcategory: e.target.value })
              }
            >
              <option value="">-- Select Subcategory --</option>
              {subcategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>

            <input type="file" onChange={handleImageChange} />
            {formData.preview && (
              <img src={formData.preview} alt="preview" className="preview" />
            )}

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>
                Update
              </button>
              <button className="cancel-btn" onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />

      {/* ✅ Modern CSS */}
      <style>
        {`
        .variant-container {
          background: #f8f9fb;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .title {
          text-align: center;
          font-weight: 600;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        .styled-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .styled-table th, .styled-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .styled-table th {
          background: #f3f6f9;
          color: #34495e;
        }
        .variant-img {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .action-icon {
          font-size: 18px;
          margin-right: 12px;
          cursor: pointer;
          transition: 0.2s ease;
        }
        .action-icon.edit { color: #3498db; }
        .action-icon.delete { color: #e74c3c; }
        .action-icon:hover { transform: scale(1.1); }
        .pagination {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          gap: 6px;
        }
        .pagination button {
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          background: #ecf0f1;
          cursor: pointer;
        }
        .pagination button.active {
          background: #3498db;
          color: white;
        }
        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .modal {
          background: white;
          padding: 25px;
          border-radius: 10px;
          width: 400px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .modal input, .modal select {
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .preview {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
          align-self: center;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .save-btn {
          background: #27ae60;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        .cancel-btn {
          background: #95a5a6;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        `}
      </style>
    </AdminLayout>
  );
};

export default VariantList;
