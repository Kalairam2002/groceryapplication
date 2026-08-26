import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, ImageOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "./AdminLayout";
import "./AdminCategoryList.css";

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: "", image: null, preview: "" });
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const brandsPerPage = 5;
  const totalPages = Math.ceil(brands.length / brandsPerPage);

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/brand`);
      if (data.success) setBrands(data.brands);
    } catch {
      toast.error("Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    try {
      const { data } = await axios.delete(`${process.env.REACT_APP_API_URL}/api/brand/${id}`);
      if (data.success) {
        toast.success("Brand deleted successfully!");
        setBrands((prev) => prev.filter((b) => b._id !== id));
      }
    } catch {
      toast.error("Failed to delete brand");
    }
  };

  const openModal = (brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, image: null, preview: brand.image });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error("Brand name is required");
    const fd = new FormData();
    fd.append("name", formData.name);
    if (formData.image) fd.append("image", formData.image);

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/brand/${editingBrand._id}`,
        fd
      );
      if (data.success) {
        toast.success("Brand updated!");
        fetchBrands();
        setShowModal(false);
      }
    } catch {
      toast.error("Update failed");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      image: file,
      preview: file ? URL.createObjectURL(file) : formData.preview,
    });
  };

  const indexOfFirst = (currentPage - 1) * brandsPerPage;
  const currentBrands = brands.slice(indexOfFirst, indexOfFirst + brandsPerPage);

  return (
    <AdminLayout page="brand-list">
      <div className="admin-container">

        <div className="header-bar">
          <div>
            <span className="eyebrow">Catalogue / Brands</span>
            <h2>Brand management</h2>
            <p className="subtitle">Manage the brands your vendors sell under</p>
          </div>
          <a href="/addBrand" className="btn-add-new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New brand
          </a>
        </div>

        {loading ? (
          <div className="loader">Loading brands...</div>
        ) : brands.length === 0 ? (
          <div className="no-data">No brands found.</div>
        ) : (
          <div className="table-card">
            <div className="table-card-top">
              <span className="count-pill"><b>{brands.length}</b> brands total</span>
            </div>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Brand name</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBrands.map((brand, index) => (
                  <tr key={brand._id}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td>
                      {brand.image ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="table-img"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <span className="img-placeholder"><ImageOff size={16} /></span>
                      )}
                    </td>
                    <td className="cat-name">{brand.name}</td>
                    <td className="text-center">
                      <button className="icon-btn edit btn-edit" onClick={() => openModal(brand)}>
                        <Pencil size={16} />
                      </button>
                      <button className="icon-btn delete btn-delete" onClick={() => handleDelete(brand._id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit brand</h3>

            <div className="modal-field">
              <label>Brand name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Brand name"
              />
            </div>

            <div className="modal-field">
              <label>Brand image</label>
              <div className="modal-file-row">
                {formData.preview && <img src={formData.preview} alt="preview" className="preview-img" />}
                <label className="file-btn" htmlFor="editImageInput">Choose image</label>
                <input id="editImageInput" type="file" onChange={handleImageChange} />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSave}>
                Update brand
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default BrandList;