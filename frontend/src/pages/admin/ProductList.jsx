import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/getProductList`
      );
      if (data.success) setProducts(data.products || []);
    } catch (error) {
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // pagination calculations
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AdminLayout page="product-list">
      <div className="container mt-4">
        <h4 className="mb-4">Product List</h4>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <>
            <table className="classic-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Seller</th> {/* Added seller column */}
                  <th>Price</th>
                  <th>Offer Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, index) => (
                  <tr key={product._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      <img
                        src={product.image[0]}
                        alt={product.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.brand}</td>
                    <td>{product.seller?.name || "N/A"}</td> {/* Display seller name */}
                    <td>₹{product.price}</td>
                    <td>
                      {product.offerPrice ? (
                        <span style={{ color: "green" }}>₹{product.offerPrice}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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
      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default ProductList;
