import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import Barcode from "react-barcode";
import { useQuery } from "@tanstack/react-query";

// NOTE: mirrors SellerAddProduct.jsx's image asset import — this file lives in
// pages/admin/, and image.js lives in pages/seller/, so it's referenced from there.
import { image } from "../seller/image";

const unitMapping = {
  grocery: ["Gm", "Kg", "Ltr", "Pcs"],
  fresh: ["Gm", "Kg", "Ltr", "Pcs"],
  "electrical and electronics": ["Kg", "Litre", "Inch", "Watt"],
  "clothing and garments": ["Size", "Waist", "Shoe-Size", "Pcs"],
};

const AdminAddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [Category, setCategory] = useState("");
  const [Subcategory, setSubcategory] = useState("");
  const [Brand, setBrand] = useState("");
  const [returnable, setReturnable] = useState(false);

  // NEW: which seller this product is being added on behalf of
  const [sellerId, setSellerId] = useState("");

  const [variants, setVariants] = useState([
    { price: "", offerPrice: "", quantity: "", unit: "Kg", tax: "", stock: "", stockUnit: "Kg", expiryDate: "" },
  ]);

  const [barcodeOption, setBarcodeOption] = useState("manual");
  const [barcode, setBarcode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [variantsListdata, setVariantsListdata] = useState([]);
  const [variantId, setVariantId] = useState("");

  // Fetch Categories
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["adminAddProduct-categoryData"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admindata/getCategory`);
      return res.data.categories || res.data;
    },
  });

  // Fetch Brands
  const { data: brandData, isLoading: brandLoading } = useQuery({
    queryKey: ["adminAddProduct-brandData"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/brand`);
      return res.data.brands;
    },
  });

  // NEW: Fetch Sellers (same endpoint the Seller List admin page already uses)
  const { data: sellerData, isLoading: sellerLoading } = useQuery({
    queryKey: ["adminAddProduct-sellerData"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/seller/seller-list`);
      return res.data.data || [];
    },
  });

  const getUnitOptions = (catId) => {
    const id = catId || Category;
    if (!id || !categoryData) return ["Pcs", "Kg", "Ltr", "GM"];
    const selectedCategory = categoryData.find((c) => c._id === id)?.name?.toLowerCase();
    if (selectedCategory?.includes("grocery")) return unitMapping["grocery"];
    if (selectedCategory?.includes("electrical")) return unitMapping["electrical and electronics"];
    if (selectedCategory?.includes("clothing")) return unitMapping["clothing and garments"];
    return ["Pcs", "Kg", "Ltr", "GM"];
  };

  const handleCategoryChange = (e) => {
    const newCategoryId = e.target.value;
    setCategory(newCategoryId);
    const units = getUnitOptions(newCategoryId);
    const firstUnit = units[0];
    setVariants((prev) => prev.map((v) => ({ ...v, unit: firstUnit })));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariantRow = () => {
    const units = getUnitOptions(Category);
    setVariants([
      ...variants,
      { price: "", offerPrice: "", quantity: "", unit: units[0], tax: "", stock: "", stockUnit: units[0], expiryDate: "" },
    ]);
  };

  const removeVariantRow = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Fetch Subcategories based on Category
  useEffect(() => {
    if (!Category) {
      setSubcategories([]);
      setSubcategory("");
      return;
    }
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/subcategory/byCategory/${Category}`)
      .then((res) => {
        if (res.data.success) setSubcategories(res.data.subCategories);
        else setSubcategories([]);
      })
      .catch((err) => console.error("Error fetching subcategories:", err));
  }, [Category]);

  // Fetch Variants based on Subcategory
  useEffect(() => {
    if (!Subcategory) {
      setVariantsListdata([]);
      return;
    }
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/variant/bySubCategory/${Subcategory}`)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.variants)) setVariantsListdata(res.data.variants);
        else if (Array.isArray(res.data)) setVariantsListdata(res.data);
        else setVariantsListdata([]);
      })
      .catch((err) => {
        console.error("Error fetching variants:", err);
        setVariantsListdata([]);
      });
  }, [Subcategory]);

  const generateBarcode = () => "BC" + Date.now() + Math.floor(1000 + Math.random() * 9000);

  const isGroceryOrFreshCategory = categoryData
    ?.find((c) => c._id === Category)
    ?.name?.toLowerCase()
    .match(/grocery|fresh/);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---- Required-field checks (this is the disclaimer you asked for, enforced) ----
    const missing = [];
    if (files.filter(Boolean).length === 0) missing.push("at least one product image");
    if (!Category) missing.push("a category");
    if (!Subcategory) missing.push("a subcategory");
    if (!sellerId) missing.push("a seller");
    const missingPricing = variants.some((v) => !v.price || !v.quantity || v.stock === "");
    if (missingPricing) missing.push("price, quantity, and stock for every variant");

    if (missing.length > 0) {
      alert("Please provide: " + missing.join(", "));
      return;
    }

    if (isGroceryOrFreshCategory) {
      const missingExpiry = variants.some((v) => !v.expiryDate);
      if (missingExpiry) {
        alert("Please fill Expiry Date for all variants!");
        return;
      }
    }

    setIsPending(true);
    try {
      let finalBarcode = barcode;
      if (barcodeOption === "auto" && !barcode) {
        finalBarcode = generateBarcode();
        setBarcode(finalBarcode);
      }

      const productData = {
        name,
        description: description.split("\n"),
        brand: Brand,
        category: Category,
        subcategory: Subcategory,
        seller: sellerId, // NEW: which seller this listing belongs to
        variants: variants.map((v) => ({
          ...v,
          expiryDate: isGroceryOrFreshCategory ? v.expiryDate : null,
        })),
        variantdata: variantId,
        barcode: finalBarcode,
        returnable,
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));
      formData.append("variants", JSON.stringify(productData.variants));
      files.forEach((file) => file && formData.append("images", file));

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/product/add`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      alert(res.data.message);
      if (res.data.success) {
        setName("");
        setDescription("");
        setFiles([]);
        setCategory("");
        setSubcategory("");
        setBrand("");
        setSellerId("");
        setBarcode("");
        setBarcodeOption("manual");
        setVariants([{ price: "", offerPrice: "", quantity: "", unit: "Kg", tax: "", stock: "", stockUnit: "Kg", expiryDate: "" }]);
        setReturnable(false);
      }
    } catch (error) {
      console.error("Error adding product:", error.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AdminLayout page="admin-add-product">
      <section style={{ padding: "0" }}>

        <div className="page-header-bar">
          <span className="eyebrow">Catalogue / Products</span>
          <h3 style={{ margin: "6px 0 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", fontWeight: 600, color: "#1C2620" }}>
            Add product on behalf of a seller
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#6E7A6C" }}>
            Fill in the listing details below and assign it to the correct seller.
          </p>
        </div>

        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          {/* Requirements disclaimer */}
          <div className="requirements-banner">
            <span className="req-icon">!</span>
            <div>
              <p className="req-title">All of the following are required before this can be submitted</p>
              <ul>
                <li>At least one product image</li>
                <li>Category and subcategory</li>
                <li>The seller this listing belongs to</li>
                <li>Price, quantity, and stock for every pricing variant</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>

              {/* LEFT SIDE: Product Details */}
              <div style={{ flex: 1, minWidth: "320px", background: "#fff", border: "1px solid #E3E8DD", borderRadius: "14px", padding: "1.5rem" }}>

                <div className="form-group">
                  <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block", color: "#1C2620" }}>
                    Product Images
                  </label>
                  <div className="admin-image-upload-container">
                    {Array(1).fill("").map((_, index) => (
                      <label key={index} className="admin-image-upload-label">
                        <input
                          type="file"
                          hidden
                          onChange={(e) => {
                            const updated = [...files];
                            updated[index] = e.target.files[0];
                            setFiles(updated);
                          }}
                        />
                        <img
                          src={files[index] ? URL.createObjectURL(files[index]) : image.upload_area}
                          alt="upload"
                          className="admin-image-preview"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row" style={{ marginTop: "14px" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <select className="admin-form-select" value={Brand} onChange={(e) => setBrand(e.target.value)} required>
                    <option value="">-- Select Brand --</option>
                    {!brandLoading && brandData?.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <select className="admin-form-select" value={Category} onChange={handleCategoryChange} required>
                    <option value="">-- Select Category --</option>
                    {!categoryLoading && categoryData?.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    className="admin-form-select"
                    value={Subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    required
                    disabled={!Category}
                  >
                    <option value="">-- Select Subcategory --</option>
                    {subcategories.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <select
                    className="admin-form-select"
                    value={variantId}
                    onChange={(e) => setVariantId(e.target.value)}
                    disabled={variantsListdata.length === 0}
                  >
                    <option value="">
                      {variantsListdata.length === 0 ? "-- No Variants Found --" : "-- Select Variant --"}
                    </option>
                    {variantsListdata.map((v) => (
                      <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                {/* NEW: Seller dropdown — placed just below the variant dropdown */}
                <div className="form-group">
                  <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block", color: "#1C2620" }}>
                    Assign to seller
                  </label>
                  <select
                    className="admin-form-select"
                    value={sellerId}
                    onChange={(e) => setSellerId(e.target.value)}
                    required
                    disabled={sellerLoading}
                  >
                    <option value="">{sellerLoading ? "Loading sellers..." : "-- Select Seller --"}</option>
                    {sellerData?.map((s) => (
                      <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>

                <textarea
                  className="admin-form-textarea"
                  rows={4}
                  placeholder="Product Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* RIGHT SIDE: Pricing Options */}
              <div style={{ flex: 1, minWidth: "320px", background: "#fff", border: "1px solid #E3E8DD", borderRadius: "14px", padding: "1.5rem" }}>
                <div className="admin-variant-title" style={{ marginBottom: "12px" }}>Multiple Pricing Options</div>

                {variants.map((v, index) => (
                  <div key={index} className="admin-variant-card">
                    {index > 0 && (
                      <button type="button" className="admin-remove-variant-btn" onClick={() => removeVariantRow(index)}>✕</button>
                    )}

                    <div className="admin-variant-row">
                      <input className="admin-variant-input" placeholder="Price" type="number" value={v.price}
                        onChange={(e) => handleVariantChange(index, "price", e.target.value)} />
                      <input className="admin-variant-input" placeholder="Offer Price" type="number" value={v.offerPrice}
                        onChange={(e) => handleVariantChange(index, "offerPrice", e.target.value)} />
                    </div>
                    <div className="admin-variant-row">
                      <input className="admin-variant-input" placeholder="Quantity" type="number" value={v.quantity}
                        onChange={(e) => handleVariantChange(index, "quantity", e.target.value)} />
                      <select className="admin-variant-input" value={v.unit} onChange={(e) => handleVariantChange(index, "unit", e.target.value)}>
                        {getUnitOptions(Category).map((u) => (<option key={u} value={u}>{u}</option>))}
                      </select>
                    </div>
                    <div className="admin-variant-row">
                      <input className="admin-variant-input" placeholder="Tax %" type="number" value={v.tax}
                        onChange={(e) => handleVariantChange(index, "tax", e.target.value)} />
                    </div>
                    <div className="admin-variant-row">
                      <input className="admin-variant-input" placeholder="Stock" type="number" value={v.stock}
                        onChange={(e) => handleVariantChange(index, "stock", e.target.value)} />
                      <select className="admin-variant-input" value={v.stockUnit} onChange={(e) => handleVariantChange(index, "stockUnit", e.target.value)}>
                        {getUnitOptions(Category).map((u) => (<option key={u} value={u}>{u}</option>))}
                      </select>
                    </div>
                    {isGroceryOrFreshCategory && (
                      <div className="admin-variant-row">
                        <div style={{ width: "100%" }}>
                          <label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "5px", display: "block", color: "#1C2620" }}>
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            className="admin-variant-input"
                            style={{ width: "100%" }}
                            value={v.expiryDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => handleVariantChange(index, "expiryDate", e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button type="button" className="admin-add-variant-btn" onClick={addVariantRow}>+ Add Another Variant</button>

                <div className="form-group" style={{ marginTop: "18px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block", color: "#1C2620" }}>
                    Barcode Option
                  </label>
                  <div style={{ display: "flex", gap: "20px", fontSize: "13.5px", color: "#1C2620" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input type="radio" value="manual" checked={barcodeOption === "manual"} onChange={(e) => setBarcodeOption(e.target.value)} />
                      Manual
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input type="radio" value="auto" checked={barcodeOption === "auto"} onChange={(e) => { setBarcodeOption(e.target.value); setBarcode(generateBarcode()); }} />
                      Auto Generate
                    </label>
                  </div>
                </div>

                {barcodeOption === "manual" && (
                  <input type="text" className="form-input" placeholder="Enter Barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
                )}

                {barcode && (
                  <div style={{ marginTop: "12px", textAlign: "center" }}>
                    <Barcode value={barcode} />
                  </div>
                )}

                <div
                  onClick={() => setReturnable(!returnable)}
                  className={`toggle-row ${returnable ? "on" : "off"}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: returnable ? "#fff" : "#fff",
                      border: `1px solid ${returnable ? "#2F6D4F" : "#E3E8DD"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={returnable ? "#2F6D4F" : "#9AA69A"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
                        <path d="M3 12h4m14 0h-4M12 3v4m0 14v-4" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1C2620" }}>Returnable</div>
                      <div style={{ fontSize: "12px", marginTop: "2px", color: returnable ? "#1F4B37" : "#9AA69A" }}>
                        {returnable ? "Customers can return this product" : "Customers cannot return this product"}
                      </div>
                    </div>
                  </div>
                  <div style={{ width: "40px", height: "22px", borderRadius: "11px", background: returnable ? "#2F6D4F" : "#D6DDCA", position: "relative", flexShrink: 0 }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: returnable ? "21px" : "3px", transition: "left 0.2s" }} />
                  </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <button type="submit" className="btn-submit" disabled={isPending} style={{ width: "100%" }}>
                    {isPending ? "Adding..." : "Add Product"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminAddProduct;