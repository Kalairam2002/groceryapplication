import React, { useState, useEffect } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";
import { image } from "./image";
import Barcode from "react-barcode";
import { useQuery } from "@tanstack/react-query";

const unitMapping = {
  grocery: ["Gm", "Kg", "Ltr", "Pcs"],
  fresh: ["Gm", "Kg", "Ltr", "Pcs"],
  "electrical and electronics": ["Kg", "Litre", "Inch", "Watt"],
  "clothing and garments": ["Size", "Waist", "Shoe-Size", "Pcs"],
};

// Smart size presets based on product name keywords
const sizePresets = {
  shirt: ["S", "M", "L", "XL", "XXL"],
  "t-shirt": ["S", "M", "L", "XL", "XXL"],
  tshirt: ["S", "M", "L", "XL", "XXL"],
  top: ["S", "M", "L", "XL", "XXL"],
  jacket: ["S", "M", "L", "XL", "XXL"],
  hoodie: ["S", "M", "L", "XL", "XXL"],
  kurta: ["S", "M", "L", "XL", "XXL"],
  sweater: ["S", "M", "L", "XL", "XXL"],
  blazer: ["S", "M", "L", "XL", "XXL"],
  pant: ["28", "30", "32", "34", "36", "38", "42"],
  pants: ["28", "30", "32", "34", "36", "38", "42"],
  trouser: ["28", "30", "32", "34", "36", "38", "42"],
  trousers: ["28", "30", "32", "34", "36", "38", "42"],
  jeans: ["28", "30", "32", "34", "36", "38", "42"],
  shorts: ["28", "30", "32", "34", "36", "38", "42"],
  chinos: ["28", "30", "32", "34", "36", "38", "42"],
  shoe: ["6", "7", "8", "9", "10", "11", "12"],
  shoes: ["6", "7", "8", "9", "10", "11", "12"],
  slipper: ["6", "7", "8", "9", "10", "11", "12"],
  slippers: ["6", "7", "8", "9", "10", "11", "12"],
  sandal: ["6", "7", "8", "9", "10", "11", "12"],
  sandals: ["6", "7", "8", "9", "10", "11", "12"],
  boot: ["6", "7", "8", "9", "10", "11", "12"],
  boots: ["6", "7", "8", "9", "10", "11", "12"],
  sneaker: ["6", "7", "8", "9", "10", "11", "12"],
  sneakers: ["6", "7", "8", "9", "10", "11", "12"],
  loafer: ["6", "7", "8", "9", "10", "11", "12"],
  loafers: ["6", "7", "8", "9", "10", "11", "12"],
};

// Detect size preset from product name
const getSizePreset = (productName) => {
  if (!productName) return null;
  const lower = productName.toLowerCase();
  for (const keyword of Object.keys(sizePresets)) {
    if (lower.includes(keyword)) return sizePresets[keyword];
  }
  return null;
};

const SellerAddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [Category, setCategory] = useState("");
  const [Subcategory, setSubcategory] = useState("");
  const [Brand, setBrand] = useState("");
  const [returnable, setReturnable] = useState(false);
  
  // const [expiryDate, setExpiryDate] = useState(""); // ✅ Expiry Date State

  const [variants, setVariants] = useState([
    {
      price: "",
      offerPrice: "",
      quantity: "",
      unit: "Kg",
      tax: "",
      stock: "",
      stockUnit: "Kg",
      expiryDate: "",
      sizeLabel: "",
    },
  ]);

  const [selectedSizeType, setSelectedSizeType] = useState("");
  const [unitValue, setUnitValue] = useState("");
  const [unitType, setUnitType] = useState("Kg");
  const [showDropdown, setShowDropdown] = useState(false);
  const [barcodeOption, setBarcodeOption] = useState("manual");
  const [barcode, setBarcode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [variantsListdata, setVariantsListdata] = useState([]);
  const [variantId, setVariantId] = useState("");


  // Fetch Categories
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["categoryData"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admindata/getCategory`);
      return res.data.categories || res.data;
    },
  });

  // Fetch Brands
  const { data: brandData, isLoading: brandLoading } = useQuery({
    queryKey: ["brandData"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/brand`);
      return res.data.brands;
    },
  });

  const getUnitOptions = (catId) => {
    const id = catId || Category;
    if (!id || !categoryData) return ["Pcs","Kg","Ltr","GM",];
    const selectedCategory = categoryData.find(c => c._id === id)?.name?.toLowerCase();
    if (selectedCategory?.includes("grocery")) return unitMapping["grocery"];
    if (selectedCategory?.includes("electrical")) return unitMapping["electrical and electronics"];
    if (selectedCategory?.includes("clothing")) return unitMapping["clothing and garments"];
    return ["Pcs","Kg","Ltr","GM"];
  };

  const handleCategoryChange = (e) => {
    const newCategoryId = e.target.value;
    setCategory(newCategoryId);
    const units = getUnitOptions(newCategoryId);
    const firstUnit = units[0];
    setVariants((prev) =>
      prev.map((v) => ({ ...v, unit: firstUnit }))
    );
    
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
      {
        price: "",
        offerPrice: "",
        quantity: "",
        unit: units[0],
        tax: "",
        stock: "",
        stockUnit: units[0],
        expiryDate: "",
        sizeLabel: "",
      },
    ]);
  };

  const removeVariantRow = (index) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  const sizeTypeOptions = [
    { label: "-- Select Size Type --", value: "" },
    { label: "Clothing (S, M, L, XL, XXL)", value: "clothing" },
    { label: "Bottoms / Waist (28, 30, 32, 34, 36, 38, 42)", value: "bottoms" },
    { label: "Footwear (6, 7, 8, 9, 10, 11, 12)", value: "footwear" },
    { label: "Kids Clothing (2Y, 4Y, 6Y, 8Y, 10Y, 12Y)", value: "kids" },
    { label: "Free Size", value: "freesize" },
  ];

  const sizeTypePresets = {
    clothing: ["S", "M", "L", "XL", "XXL"],
    bottoms: ["28", "30", "32", "34", "36", "38", "42"],
    footwear: ["6", "7", "8", "9", "10", "11", "12"],
    kids: ["2Y", "4Y", "6Y", "8Y", "10Y", "12Y"],
    freesize: ["Free Size"],
  };

  const applySmartSizes = () => {
    if (!isClothingCategory) {
      addVariantRow();
      return;
    }

    const preset = sizeTypePresets[selectedSizeType] || getSizePreset(name);

    if (!preset) {
      alert("Please select a Size Type from the dropdown first.");
      return;
    }

    const newVariants = preset.map((size) => ({
      price: "",
      offerPrice: "",
      quantity: "",
      unit: "Size",
      tax: "",
      stock: "",
      stockUnit: "Size",
      expiryDate: "",
      sizeLabel: size,
    }));
    setVariants(newVariants);
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
        console.log("Variant API response:", res.data);
        if (res.data.success && Array.isArray(res.data.variants)) {
          setVariantsListdata(res.data.variants);
        } else if (Array.isArray(res.data)) {
          setVariantsListdata(res.data);
        } else {
          setVariantsListdata([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching variants:", err);
        setVariantsListdata([]);
      });
  }, [Subcategory]);

  // Generate Barcode
  const generateBarcode = () => "BC" + Date.now() + Math.floor(1000 + Math.random() * 9000);

  // Check if current category is clothing
  const isClothingCategory = categoryData
    ?.find((c) => c._id === Category)
    ?.name?.toLowerCase()
    .includes("clothing");

  // ✅ Check if current category is Grocery or Fresh
  const isGroceryOrFreshCategory = categoryData
    ?.find((c) => c._id === Category)
    ?.name?.toLowerCase()
    .match(/grocery|fresh/);

  // Handle Submit
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsPending(true);

  //   try {
  //     let finalBarcode = barcode;
  //     if (barcodeOption === "auto" && !barcode) {
  //       finalBarcode = generateBarcode();
  //       setBarcode(finalBarcode);
  //     }

  //     const productData = {
  //       name,
  //       description: description.split("\n"),
  //       brand: Brand,
  //       category: Category,
  //       subcategory: Subcategory,
  //       variants: variants,
  //       variantdata: variantId,
  //       barcode: finalBarcode,
  //       // expiryDate: isGroceryOrFreshCategory ? expiryDate : null, 
  //     };

  //     const formData = new FormData();
  //     formData.append("productData", JSON.stringify(productData));
  //     formData.append("variants", JSON.stringify(variants));
  //     files.forEach((file) => formData.append("images", file));

  //     const res = await axios.post(
  //       `${process.env.REACT_APP_API_URL}/api/product/add`,
  //       formData,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //         withCredentials: true,
  //       }
  //     );

  //     alert(res.data.message);
  //     if (res.data.success) {
  //       setName("");
  //       setDescription("");
  //       setFiles([]);
  //       setCategory("");
  //       setSubcategory("");
  //       setBrand("");
  //       setBarcode("");
  //       setBarcodeOption("manual");
  //       setSelectedSizeType("");
  //     // ✅ Reset expiry date on success
  //       setVariants([
  //         {
  //           price: "",
  //           offerPrice: "",
  //           quantity: "",
  //           unit: "Kg",
  //           tax: "",
  //           stock: "",
  //           expiryDate: "",
  //           sizeLabel: "",
  //         },
  //       ]);
  //     }
  //   } catch (error) {
  //     console.error("Error adding product:", error.message);
  //   } finally {
  //     setIsPending(false);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Required-field checks — this is the disclaimer above, enforced
  const missing = [];
  if (files.filter(Boolean).length === 0) missing.push("at least one product image");
  if (!Category) missing.push("a category");
  if (!Subcategory) missing.push("a subcategory");
  const missingPricing = variants.some((v) => !v.price || !v.quantity || v.stock === "");
  if (missingPricing) missing.push("price, quantity, and stock for every variant");

  if (missing.length > 0) {
    alert("Please provide: " + missing.join(", "));
    return;
  }

  setIsPending(true);

  try {
    // ✅ Validate expiryDate for Grocery/Fresh category
    if (isGroceryOrFreshCategory) {
      const missingExpiry = variants.some((v) => !v.expiryDate);
      if (missingExpiry) {
        alert("Please fill Expiry Date for all variants!");
        setIsPending(false);
        return;
      }
    }

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
      // ✅ Clean variants — send expiryDate only for grocery/fresh, null for others
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
    formData.append("variants", JSON.stringify(productData.variants)); // ✅ use cleaned variants
    files.forEach((file) => formData.append("images", file));

    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/product/add`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    alert(res.data.message);
    if (res.data.success) {
      setName("");
      setDescription("");
      setFiles([]);
      setCategory("");
      setSubcategory("");
      setBrand("");
      setBarcode("");
      setBarcodeOption("manual");
      setSelectedSizeType("");
      setVariants([
        {
          price: "",
          offerPrice: "",
          quantity: "",
          unit: "Kg",
          tax: "",
          stock: "",
          stockUnit: "Kg",
          expiryDate: "",
          sizeLabel: "",
        },
      ]);
    }
    setReturnable(false); // ✅ Reset returnable on success
  } catch (error) {
    console.error("Error adding product:", error.message);
  } finally {
    setIsPending(false);
  }
};

  return (
    <SellerLayout page="add-product">
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ marginBottom: "1.5rem" }}>
          <span style={{ display: "block", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#3B4C8A", marginBottom: "6px" }}>
            Catalogue / Products
          </span>
          <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: "600", color: "#1E2233" }}>
            Add new product
          </h3>
        </div>

        <div className="requirements-banner">
          <span className="req-icon">!</span>
          <div>
            <p className="req-title">All of the following are required before this can be submitted</p>
            <ul>
              <li>At least one product image</li>
              <li>Category and subcategory</li>
              <li>Price, quantity, and stock for every pricing variant</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* LEFT SIDE: Product Details */}
            <div style={{ flex: 1, minWidth: "320px", background: "#fff", border: "1px solid #E4E7F0", borderRadius: "14px", padding: "1.5rem" }}>
              {/* Upload Images */}
              <div className="form-group">
                <label>Product Images</label>
                <div className="image-upload-container">
                  {Array(1)
                    .fill("")
                    .map((_, index) => (
                      <label key={index} className="image-upload-label">
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
                          src={
                            files[index]
                              ? URL.createObjectURL(files[index])
                              : image.upload_area
                          }
                          alt="upload"
                          className="image-preview"
                        />
                      </label>
                    ))}
                </div>
              </div>

              {/* Product Name + Brand */}
              <div className="form-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <select
                  className="form-select"
                  value={Brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                >
                  <option value="">-- Select Brand --</option>
                  {!brandLoading &&
                    brandData?.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Category + Subcategory */}
              <div className="form-row mt-2">
                <select
                  className="form-select"
                  value={Category}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="">-- Select Category --</option>
                  {!categoryLoading &&
                    categoryData?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>

                <select
                  className="form-select"
                  value={Subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  required
                  disabled={!Category}
                >
                  <option value="">-- Select Subcategory --</option>
                  {subcategories.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Variant Dropdown */}
              <div className="form-group mt-2">
                <select
                  className="form-select"
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  required
                  disabled={variantsListdata.length === 0}
                >
                  <option value="">
                    {variantsListdata.length === 0
                      ? "-- No Variants Found --"
                      : "-- Select Variant --"}
                  </option>
                  {variantsListdata.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <textarea
                className="form-textarea mt-2"
                rows={4}
                placeholder="Product Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              {/* ✅ Expiry Date — only shown for Grocery / Fresh categories */}
              {/* {isGroceryOrFreshCategory && (
                <div className="form-group mt-2">
                  <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "5px", display: "block" }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={expiryDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </div>
              )} */}
            </div>

            {/* RIGHT SIDE: Pricing Options */}
            <div style={{ flex: 1, minWidth: "320px", background: "#fff", border: "1px solid #E4E7F0", borderRadius: "14px", padding: "1.5rem" }}>
              <div className="variant-title" style={{ marginBottom: "10px" }}>
                Multiple Pricing Options
              </div>

              {/* Size Type dropdown — only for Clothing and Garments */}
              {isClothingCategory && (
                <div style={{ marginBottom: "8px" }}>
                  <select
                    value={selectedSizeType}
                    onChange={(e) => setSelectedSizeType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      marginBottom: "8px",
                      fontSize: "13px",
                    }}
                  >
                    {sizeTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Auto-Fill Sizes button — for ALL categories */}
              {Category && (
                <button
                  type="button"
                  onClick={applySmartSizes}
                  style={{
                    marginBottom: "15px",
                    padding: "9px 16px",
                    backgroundColor: "#6c63ff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    width: "100%",
                  }}
                >
                  ✨ Auto-Fill Varients
                </button>
              )}

              {variants.map((v, index) => (
                <div key={index} className="variant-card">
                  {/* Size badge */}
                  {v.sizeLabel && (
                    <div
                      style={{
                        display: "inline-block",
                        background: "#6c63ff",
                        color: "white",
                        padding: "3px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        marginBottom: "8px",
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Size: {v.sizeLabel}
                    </div>
                  )}

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
                      onChange={(e) =>
                        handleVariantChange(index, "price", e.target.value)
                      }
                    />
                    <input
                      className="variant-input"
                      placeholder="Offer Price"
                      type="number"
                      value={v.offerPrice}
                      onChange={(e) =>
                        handleVariantChange(index, "offerPrice", e.target.value)
                      }
                    />
                  </div>
                  <div className="variant-row">
                    <input
                      className="variant-input"
                      placeholder="Quantity"
                      type="number"
                      value={v.quantity}
                      onChange={(e) =>
                        handleVariantChange(index, "quantity", e.target.value)
                      }
                    />
                    <select
                      className="variant-input"
                      value={v.unit}
                      onChange={(e) =>
                        handleVariantChange(index, "unit", e.target.value)
                      }
                    >
                      {getUnitOptions(Category).map((u) => (
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
                      onChange={(e) =>
                        handleVariantChange(index, "tax", e.target.value)
                      }
                    />
                  </div>
                  <div className="variant-row">
                    <input
                      className="variant-input"
                      placeholder="Stock"
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        handleVariantChange(index, "stock", e.target.value)
                      }
                    />
                    <select
                      className="variant-input"
                      value={v.stockUnit}
                      onChange={(e) =>
                        handleVariantChange(index, "stockUnit", e.target.value)
                      }
                    >
                      {getUnitOptions(Category).map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
             <div className="variant-row">
  {isGroceryOrFreshCategory && (
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
  )}
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

              {/* Barcode Options */}
              <div className="form-group mt-2">
                <label>Barcode Option</label>
                <div className="form-row">
                  <label>
                    <input
                      type="radio"
                      value="manual"
                      checked={barcodeOption === "manual"}
                      onChange={(e) => setBarcodeOption(e.target.value)}
                    />
                    Manual
                  </label>
                  <label style={{ marginLeft: "20px" }}>
                    <input
                      type="radio"
                      value="auto"
                      checked={barcodeOption === "auto"}
                      onChange={(e) => {
                        setBarcodeOption(e.target.value);
                        setBarcode(generateBarcode());
                      }}
                    />
                    Auto Generate
                  </label>
                </div>
              </div>

              {barcodeOption === "manual" && (
                <input
                  type="text"
                  className="form-input mt-1"
                  placeholder="Enter Barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              )}

              {barcode && (
                <div className="mt-2 text-center" id="barcode">
                  <Barcode value={barcode} />
                </div>
              )}

              {/* Returnable Option */}
              {/* <div className="form-group mt-2">
                <label>
                  <input
                    type="checkbox"
                    checked={returnable}
                    onChange={(e) => setReturnable(e.target.checked)}
                  />
                  Returnable
                </label>
              </div> */}

              <div
  onClick={() => setReturnable(!returnable)}
  style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: returnable ? "#f0fdf4" : "#f9fafb",
    border: `0.5px solid ${returnable ? "#22c55e" : "#e5e7eb"}`,
    borderRadius: "12px", padding: "14px 16px",
    cursor: "pointer", userSelect: "none",
    transition: "all 0.2s", marginTop: "8px",
  }}
>
  {/* Left — icon + text */}
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
    <div style={{
      width: "36px", height: "36px", borderRadius: "50%",
      background: returnable ? "#dcfce7" : "#fff",
      border: `0.5px solid ${returnable ? "#22c55e" : "#e5e7eb"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, transition: "all 0.2s",
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke={returnable ? "#16a34a" : "#9ca3af"}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/>
        <path d="M3 12h4m14 0h-4M12 3v4m0 14v-4"/>
      </svg>
    </div>
    <div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>
        Returnable
      </div>
      <div style={{ fontSize: "12px", marginTop: "2px",
        color: returnable ? "#16a34a" : "#9ca3af" }}>
        {returnable
          ? "Customers can return this product"
          : "Customers cannot return this product"}
      </div>
    </div>
  </div>

  {/* Right — toggle switch */}
  <div style={{
    width: "40px", height: "22px", borderRadius: "11px",
    background: returnable ? "#22c55e" : "#d1d5db",
    position: "relative", flexShrink: 0,
    transition: "background 0.2s",
  }}>
    <div style={{
      width: "16px", height: "16px", borderRadius: "50%",
      background: "#fff", position: "absolute",
      top: "3px", left: returnable ? "21px" : "3px",
      transition: "left 0.2s",
    }} />
  </div>
</div>


              {/* Add Product Button */}
              <div style={{ marginTop: "20px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isPending}
                  style={{ width: "100%" }}
                >
                  {isPending ? "Adding..." : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
};

export default SellerAddProduct;