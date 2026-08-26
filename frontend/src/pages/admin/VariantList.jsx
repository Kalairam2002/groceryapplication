import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, ImageOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "./AdminLayout";
import "./AdminCategoryList.css";

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

  const totalPages = Math.ceil(variants.length / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentVariants = variants.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  return (
    <AdminLayout page="variant-list">
      <div className="admin-container">

        <div className="header-bar">
          <div>
            <span className="eyebrow">Catalogue / Variants</span>
            <h2>Variant management</h2>
            <p className="subtitle">Manage product variants nested under subcategories</p>
          </div>
          <a href="/addVariant" className="btn-add-new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New variant
          </a>
        </div>

        {loading ? (
          <div className="loader">Loading variants...</div>
        ) : variants.length === 0 ? (
          <div className="no-data">No variants found.</div>
        ) : (
          <div className="table-card">
            <div className="table-card-top">
              <span className="count-pill"><b>{variants.length}</b> variants total</span>
            </div>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Subcategory</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentVariants.map((variant, index) => (
                  <tr key={variant._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      {variant.image ? (
                        <img src={variant.image} alt={variant.name} className="table-img" />
                      ) : (
                        <span className="img-placeholder"><ImageOff size={16} /></span>
                      )}
                    </td>
                    <td className="cat-name">{variant.name}</td>
                    <td>{variant.subcategory?.name || "Unassigned"}</td>
                    <td className="text-center">
                      <button className="icon-btn edit btn-edit" onClick={() => openEditModal(variant)}>
                        <Pencil size={16} />
                      </button>
                      <button className="icon-btn delete btn-delete" onClick={() => handleDelete(variant._id)}>
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
            <h3>Edit variant</h3>

            <div className="modal-field">
              <label>Variant name</label>
              <input
                type="text"
                placeholder="Variant name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <label>Subcategory</label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E3E8DD", background: "#F5F7F1", fontSize: "13.5px", color: "#1C2620" }}
              >
                <option value="">-- Select Subcategory --</option>
                {subcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Variant image</label>
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
                Update variant
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default VariantList;