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
  // const [expiryDate, setExpiryDate] = useState(""); 

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

  // ✅ Fetch all products
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

  // ✅ When product is selected from dropdown
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

  // ✅ Handle variant field change
  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  // ✅ Add new variant row
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

  // ✅ Remove variant row
  const removeVariantRow = (index) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };


  const handleSubmit = async () => {
  try {
    // 🔴 basic validation
    if (!selectedProductId) {
      alert("Please select a product");
      return;
    }

    // if (!expiryDate) {
    //   alert("Please select expiry date");
    //   return;
    // }

    // ✅ Prepare payload
    const payload = {
      existingProductId: selectedProductId,
      //expiryDate: expiryDate,  matches your backend
      variantdata: variants.map((v) => ({
        price: Number(v.price),
        offerPrice: Number(v.offerPrice),
        quantity: Number(v.quantity),
        unit: v.unit,
        tax: Number(v.tax) || 0,
        stock: Number(v.stock) || 0,
        expiryDate: v.expiryDate ? new Date(v.expiryDate) : null, // Convert to Date or set null
      })),
    };

    // ✅ API call
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/product/existingproductadd`,
      payload,
      { withCredentials: true }
    );

    if (res.data.success) {
      alert("Product added successfully ✅");

      // 🔄 Reset form
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
      <div className="card product-card">
        <h4>Existing Products</h4>

        {/* ✅ Product Dropdown */}
        <div className="form-group mt-2">
          <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block" }}>
            Choose Existing Product
          </label>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <select
              className="form-select"
              value={selectedProductId}
              onChange={handleProductSelect}
              style={{ width: "100%", marginBottom: "20px" }}
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

        {/* ✅ Show pricing section only after product is selected */}
        {selectedProduct && (
          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

            {/* LEFT — Selected Product Info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "16px",
                  border: "1px solid #e5e7eb",
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
                  }}
                />
                <h5 style={{ fontWeight: "700", marginBottom: "6px" }}>
                  {selectedProduct.name}
                </h5>
                <p style={{ fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "600" }}>
                      Existing Variants:
                </p>

                {/* Existing Variants */}
                <div style={{border:"1px solid black", padding:"10px", borderRadius:"8px", marginBottom:"10px"}}>
                  <p style={{ fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "600" }}>
                    Batch 1:
                  </p>
                {selectedProduct.variants?.length > 0 && (
                  <div>
                    {/* <p style={{ fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "600" }}>
                      Existing Variants:
                    </p> */}
                    {selectedProduct.variants.map((v, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          marginBottom: "6px",
                          fontSize: "13px",
                        }}
                      >
                        📦 {v.quantity} {v.unit} — ₹{v.offerPrice || v.price} &nbsp;|&nbsp; Stock: {v.stock}
                      </div>

                    ))}
                  </div>
                )}

                {/* <div>
                  expiryDate: {selectedProduct.expiryDate ? new Date(selectedProduct.expiryDate).toLocaleDateString() : "N/A"}
                </div> */}
                </div>
                


                {/* ✅ Expiry Date — below existing variants */}
                {/* <div style={{ marginTop: "14px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "5px", display: "block" }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      fontSize: "13px",
                    }}
                  />
                </div> */}

              </div>
            </div>

            {/* RIGHT — Multiple Pricing Options */}
            <div style={{ flex: 1 }}>
              <div className="variant-title" style={{ marginBottom: "10px" }}>
                Multiple Pricing Options
              </div>

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
                    {/* ✅ Unit dropdown — Gm, Kg, Ltr, Pcs */}
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
                        <div className="form-group mt-2" style={{ width: "100%" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "5px", display: "block" }}>
        Expiry Date
      </label>
      <input
        type="date"
        className="form-input"
        value={v.expiryDate}   // ✅ variant's own expiryDate
        min={new Date().toISOString().split("T")[0]}
        onChange={(e) => handleVariantChange(index, "expiryDate", e.target.value)}  // ✅ update that variant
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
                + Add Another Variant
              </button>
            </div>
          </div>
        )}
      </div>
      <button
  type="button"
  onClick={handleSubmit}
  style={{
    marginTop: "20px",
    padding: "10px 16px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  }}
>
  Submit Product
</button>
    </SellerLayout>
  );
};

export default SellerExistingProducts;