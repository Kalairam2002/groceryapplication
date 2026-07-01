import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "./AdminLayout";

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: "", image: null, preview: "" });
  const [showModal, setShowModal] = useState(false);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const brandsPerPage = 5;
  const totalPages = Math.ceil(brands.length / brandsPerPage);

  // ✅ Fetch Brands
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

  // ✅ Delete Brand
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

  // ✅ Open Edit Modal
  const openModal = (brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, image: null, preview: brand.image });
    setShowModal(true);
  };

  // ✅ Handle Save
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

  // ✅ Pagination logic
  const indexOfLast = currentPage * brandsPerPage;
  const indexOfFirst = indexOfLast - brandsPerPage;
  const currentBrands = brands.slice(indexOfFirst, indexOfLast);

  return (
    <AdminLayout>
      <div style={styles.container}>
        <h2 style={styles.heading}>🛍️ Brand Management</h2>

        {loading ? (
          <p style={styles.textMuted}>Loading brands...</p>
        ) : brands.length === 0 ? (
          <p style={styles.textMuted}>No brands found</p>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Image</th>
                    <th style={styles.th}>Brand Name</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBrands.map((brand, index) => (
                    <tr key={brand._id} style={styles.tr}>
                      <td style={styles.td}>{indexOfFirst + index + 1}</td>
                      <td style={styles.td}>
                        <img
                          src={brand.image}
                          alt={brand.name}
                          style={styles.brandImg}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      </td>
                      <td style={styles.td}>{brand.name}</td>
                      <td style={styles.td}>
                        <FaEdit
                          onClick={() => openModal(brand)}
                          style={{ ...styles.icon, color: "#007bff" }}
                          title="Edit"
                        />
                        <FaTrash
                          onClick={() => handleDelete(brand._id)}
                          style={{ ...styles.icon, color: "#e74c3c" }}
                          title="Delete"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ Pagination Controls */}
            <div style={styles.paginationContainer}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageButton,
                  backgroundColor: currentPage === 1 ? "#ccc" : "#007bff",
                }}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    ...styles.pageButton,
                    backgroundColor: currentPage === i + 1 ? "#007bff" : "#eee",
                    color: currentPage === i + 1 ? "#fff" : "#000",
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.pageButton,
                  backgroundColor: currentPage === totalPages ? "#ccc" : "#007bff",
                }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* ✅ Edit Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Edit Brand</h3>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Brand Name"
              style={styles.input}
            />
            <input type="file" onChange={handleImageChange} style={styles.fileInput} />
            {formData.preview && (
              <img src={formData.preview} alt="Preview" style={styles.previewImg} />
            )}
            <div style={styles.modalActions}>
              <button style={styles.btnSave} onClick={handleSave}>
                Save
              </button>
              <button style={styles.btnCancel} onClick={() => setShowModal(false)}>
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

// ✅ Styles
const styles = {
  container: {
    padding: "40px",
    background: "#f9fafc",
    minHeight: "100vh",
  },
  heading: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "30px",
    fontWeight: "700",
    fontSize: "28px",
  },
  textMuted: {
    textAlign: "center",
    color: "#888",
    fontSize: "16px",
  },
  tableWrapper: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    background: "linear-gradient(to right, #007bff, #00c6ff)",
    color: "#fff",
  },
  th: {
    padding: "12px",
    textAlign: "center",
    fontWeight: "600",
  },
  tr: {
    borderBottom: "1px solid #eee",
    transition: "background 0.2s",
  },
  td: {
    textAlign: "center",
    padding: "12px",
    color: "#34495e",
    fontSize: "15px",
  },
  brandImg: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "2px solid #f1f1f1",
  },
  icon: {
    fontSize: "18px",
    margin: "0 8px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
    gap: "8px",
  },
  pageButton: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    color: "#fff",
    transition: "background 0.2s",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    width: "400px",
    maxWidth: "90%",
    boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
    textAlign: "center",
  },
  modalTitle: {
    marginBottom: "15px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  fileInput: {
    width: "100%",
    marginBottom: "10px",
  },
  previewImg: {
    width: "100px",
    height: "100px",
    borderRadius: "10px",
    objectFit: "cover",
    marginBottom: "10px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  btnSave: {
    background: "#27ae60",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  btnCancel: {
    background: "#bdc3c7",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default BrandList;
