import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import Barcode from "react-barcode";

const BarcodeScanner = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/list/seller`,
          { withCredentials: true }
        );
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ================= DOWNLOAD BARCODE =================
  const downloadBarcode = (id, barcodeValue) => {
    const svg = document.querySelector(`#barcode-${id} svg`);
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const png = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = png;
      link.download = `barcode-${barcodeValue}.png`;
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgStr);
  };

  return (
    <SellerLayout page="barcode-list">
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#F6F7FB",
          padding: "8px",
        }}
      >
        <span style={{ display: "block", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#3B4C8A", marginBottom: "6px" }}>
          Catalogue / Barcodes
        </span>
        <h2 style={{ marginBottom: "20px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "600", color: "#1E2233" }}>
          Product barcode list
        </h2>

        {loading && (
          <p style={{ color: "#666", fontSize: "14px" }}>
            Loading products...
          </p>
        )}

        {!loading && (
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #E4E7F0",
              borderRadius: "14px",
              boxShadow: "0 10px 30px rgba(38,47,82,0.06)",
              overflowX: "auto",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "#F6F7FB",
                    textAlign: "left",
                  }}
                >
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Product Image</th>
                  <th style={thStyle}>Product Name</th>
                  <th style={thStyle}>Barcode No</th>
                  <th style={thStyle}>Barcode Image</th>
                  <th style={thStyle}>Download</th>
                </tr>
              </thead>

              <tbody>
                {products.length > 0 ? (
                  products.map((item, index) => (
                    <tr
                      key={item._id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <td style={tdStyle}>{index + 1}</td>

                      <td style={tdStyle}>
                        <img
                          src={item.image?.[0]}
                          alt={item.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                          }}
                        />
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: "600",
                        }}
                      >
                        {item.name}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontFamily: "'IBM Plex Mono', monospace",
                          color: "#3B4C8A",
                        }}
                      >
                        {item.barcode || "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.barcode ? (
                          <div id={`barcode-${item._id}`}>
                            <Barcode
                              value={item.barcode}
                              height={45}
                              width={1.4}
                              fontSize={12}
                            />
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td style={tdStyle}>
                        {item.barcode && (
                          <button
                            onClick={() =>
                              downloadBarcode(item._id, item.barcode)
                            }
                            style={{
                              padding: "6px 14px",
                              backgroundColor: "#262F52",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={emptyStyle}>
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SellerLayout>
  );
};

// ================= INLINE STYLES =================
const thStyle = {
  padding: "12px 14px",
  fontSize: "11.5px",
  fontWeight: "600",
  color: "#6B7280",
  fontFamily: "'Space Grotesk', sans-serif",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  borderBottom: "1px solid #E4E7F0",
};

const tdStyle = {
  padding: "14px",
  fontSize: "14px",
  color: "#374151",
};

const emptyStyle = {
  padding: "20px",
  textAlign: "center",
  color: "#6b7280",
};

export default BarcodeScanner;