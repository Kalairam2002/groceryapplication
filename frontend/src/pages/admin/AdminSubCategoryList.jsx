import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminSubCategoryList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    preview: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Fetch all brands
  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/brand`
      );
      if (data.success) setBrands(data.brands || []);
    } catch (error) {
      toast.error("Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // ✅ Open edit modal
  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      image: null,
      preview: brand.image || "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingBrand(null);
    setFormData({ name: "", image: null, preview: "" });
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

  // ✅ Save edited brand
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    const fd = new FormData();
    fd.append("name", formData.name);
    if (formData.image) fd.append("image", formData.image);

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/brand/${editingBrand._id}`,
        fd
      );
      if (data.success) {
        toast.success("Brand updated successfully!");
        fetchBrands();
        closeEditModal();
      } else {
        toast.error(data.message || "Failed to update brand");
      }
    } catch (error) {
      toast.error("Error updating brand");
    }
  };

  // ✅ Delete brand
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;

    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/brand/${id}`
      );
      if (data.success) {
        setBrands((prev) => prev.filter((b) => b._id !== id));
        toast.success("Brand deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete brand");
      }
    } catch (error) {
      toast.error("Error deleting brand");
    }
  };

  // ✅ Pagination
  const totalPages = Math.ceil(brands.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = brands.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AdminLayout page="brand-list">
      <div className="container mt-4">
        <h4 className="mb-4">Brand List</h4>

        {loading ? (
          <p>Loading brands...</p>
        ) : brands.length === 0 ? (
          <p>No brands found.</p>
        ) : (
          <>
            <table className="classic-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBrands.map((brand, index) => (
                  <tr key={brand._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      {brand.image ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
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
                    <td>{brand.name}</td>
                    <td>
                      <button
                        onClick={() => openEditModal(brand)}
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
                        onClick={() => handleDelete(brand._id)}
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
            <h5>Edit Brand</h5>

            <input
              type="text"
              placeholder="Enter brand name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="form-control mb-3"
            />

            <input
              type="file"
              onChange={handleImageChange}
              className="form-control mb-3"
            />

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
