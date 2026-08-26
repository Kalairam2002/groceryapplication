import React, { useState, useEffect } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";

const unitOptions = ["Gm", "Kg", "Ltr", "Pcs"];

const SellerExistingProducts = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [variants, setVariants] = useState([
    {
      price: "",
      offerPrice: "",
      quantity: "",
      unit: "Gm",
      tax: "",
      stock: "",
      expiryDate: "",
    },
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/list`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductSelect = (e) => {
    const id = e.target.value;
    setSelectedProductId(id);
    const found = products.find((p) => p._id === id);
    setSelectedProduct(found || null);

    setVariants([
      {
        price: "",
        offerPrice: "",
        quantity: "",
        unit: "Gm",
        tax: "",
        stock: "",
        expiryDate: "",
      },
    ]);
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariantRow = () => {
    setVariants([
      ...variants,
      {
        price: "",
        offerPrice: "",
        quantity: "",
        unit: "Gm",
        tax: "",
        stock: "",
        expiryDate: "",
      },
    ]);
  };

  const removeVariantRow = (index) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedProductId) {
        alert("Please select a product");
        return;
      }

      const payload = {
        existingProductId: selectedProductId,
        variantdata: variants.map((v) => ({
          price: Number(v.price),
          offerPrice: Number(v.offerPrice),
          quantity: Number(v.quantity),
          unit: v.unit,
          tax: Number(v.tax) || 0,
          stock: Number(v.stock) || 0,
          expiryDate: v.expiryDate ? new Date(v.expiryDate) : null,
        })),
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/product/existingproductadd`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success) {
        alert("Product added successfully ✅");

        setSelectedProductId("");
        setSelectedProduct(null);

        setVariants([
          {
            price: "",
            offerPrice: "",
            quantity: "",
            unit: "Gm",
            tax: "",
            stock: "",
          },
        ]);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <SellerLayout page="existing-products">
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Page header */}
        <div className="page-header-bar">
          <span className="eyebrow">Catalogue / Existing Products</span>
          <h3>Add stock to an existing product</h3>
          <p className="subtitle">Pick a product already in the catalogue and add new pricing or stock batches.</p>
        </div>

        <div style={{ background: "#fff", border: "1px solid #E4E7F0", borderRadius: "14px", padding: "1.75rem" }}>

          {/* Product picker */}
          <div className="form-group" style={{ maxWidth: "480px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block", color: "#1E2233" }}>
              Choose existing product
            </label>
            {loading ? (
              <p style={{ color: "#6B7280", fontSize: "13px" }}>Loading products...</p>
            ) : (
              <select
                className="form-select"
                value={selectedProductId}
                onChange={handleProductSelect}
                style={{ width: "100%" }}
              >
                <option value="">-- Select a Product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Show pricing section only after product is selected */}
          {selectedProduct && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "24px", alignItems: "start", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #F0F1F7" }}>

              {/* LEFT — Selected Product Info */}
              <div>
                <div
                  style={{
                    background: "#F6F7FB",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid #E4E7F0",
                  }}
                >
                  <img
                    src={selectedProduct.image?.[0]}
                    alt={selectedProduct.name}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "contain",
                      marginBottom: "12px",
                      borderRadius: "8px",
                      background: "#fff",
                    }}
                  />
                  <h5 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: "600", marginBottom: "12px", color: "#1E2233" }}>
                    {selectedProduct.name}
                  </h5>

                  {/* Existing Variants */}
                  <div style={{ background: "#fff", border: "1px solid #E4E7F0", padding: "12px", borderRadius: "10px" }}>
                    <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Existing batches
                    </p>
                    {selectedProduct.variants?.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {selectedProduct.variants.map((v, i) => (
                          <div
                            key={i}
                            style={{
                              background: "#F6F7FB",
                              border: "1px solid #E4E7F0",
                              borderRadius: "8px",
                              padding: "8px 12px",
                              fontSize: "12.5px",
                              color: "#1E2233",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>📦 {v.quantity} {v.unit}</span>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>₹{v.offerPrice || v.price}</span>
                            <span style={{ color: "#6B7280" }}>Stock: {v.stock}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: "12.5px", color: "#9AA0B4", margin: 0 }}>No batches yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT — Multiple Pricing Options */}
              <div>
                <div className="variant-title">Multiple pricing options</div>

                {variants.map((v, index) => (
                  <div key={index} className="variant-card">
                    {index > 0 && (
                      <button
                        type="button"
                        className="remove-variant-btn"
                        onClick={() => removeVariantRow(index)}
                      >
                        ✕
                      </button>
                    )}

                    <div className="variant-row">
                      <input
                        className="variant-input"
                        placeholder="Price"
                        type="number"
                        value={v.price}
                        onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                      />
                      <input
                        className="variant-input"
                        placeholder="Offer Price"
                        type="number"
                        value={v.offerPrice}
                        onChange={(e) => handleVariantChange(index, "offerPrice", e.target.value)}
                      />
                    </div>

                    <div className="variant-row">
                      <input
                        className="variant-input"
                        placeholder="Quantity"
                        type="number"
                        value={v.quantity}
                        onChange={(e) => handleVariantChange(index, "quantity", e.target.value)}
                      />
                      <select
                        className="variant-input"
                        value={v.unit}
                        onChange={(e) => handleVariantChange(index, "unit", e.target.value)}
                      >
                        {unitOptions.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="variant-row">
                      <input
                        className="variant-input"
                        placeholder="Tax %"
                        type="number"
                        value={v.tax}
                        onChange={(e) => handleVariantChange(index, "tax", e.target.value)}
                      />
                      <input
                        className="variant-input"
                        placeholder="Stock"
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                      />
                    </div>

                    <div className="variant-row">
                      <div className="form-group" style={{ width: "100%", marginBottom: 0 }}>
                        <label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "5px", display: "block", color: "#1E2233" }}>
                          Expiry date
                        </label>
                        <input
                          type="date"
                          className="form-input"
                          value={v.expiryDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => handleVariantChange(index, "expiryDate", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="add-variant-btn"
                  onClick={addVariantRow}
                >
                  + Add another variant
                </button>
              </div>
            </div>
          )}

          {/* Submit — inside the card, aligned right */}
          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #F0F1F7" }}>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary"
            >
              Submit product
            </button>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerExistingProducts;