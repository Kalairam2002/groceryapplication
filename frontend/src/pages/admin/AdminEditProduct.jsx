import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";
import Barcode from "react-barcode";
import { image } from "../seller/image";

// ✅ NEW — same unit mapping used on the Add Product forms, so the
// Stock Unit dropdown here offers the same options per category.
const unitMapping = {
  grocery: ["Gm", "Kg", "Ml", "Ltr", "Pcs"],
  fresh: ["Gm", "Kg", "Ml", "Ltr", "Pcs"],
  "electrical and electronics": ["Kg", "Ml", "Litre", "Inch", "Watt"],
  "clothing and garments": ["Size", "Waist", "Shoe-Size", "Pcs"],
};

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [Category, setCategory] = useState("");
  const [Subcategory, setSubcategory] = useState("");
  const [Brand, setBrand] = useState("");
  const [barcode, setBarcode] = useState("");

  // The real source of truth — the product's actual variants array,
  // each with its own price/offerPrice/quantity/unit/tax and its own
  // batches (each batch = one delivery/lot with its own stock + expiry).
  const [variants, setVariants] = useState([]);

  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  // Fetch categories
  const { data: categories, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/api/admindata/Category`);
      return data.categories || [];
    },
  });

  // Fetch brands
  const { data: brands, isLoading: isBrandLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/api/brand`);
      return data.brands || [];
    },
  });

  // ✅ Category-driven expiry flag — reads the real `requiresExpiry` field
  // set on the Category document, instead of guessing from the name.
  const isGroceryOrFreshCategory = categories
    ?.find((c) => c._id === Category)
    ?.requiresExpiry === true;

  // ✅ NEW — same unit-options logic as the Add Product forms, so the
  // Stock Unit dropdown offers the right choices for the selected category.
  const getUnitOptions = (catId) => {
    const id = catId || Category;
    if (!id || !categories) return ["Pcs", "Kg", "Ml", "Ltr", "GM"];
    const selectedCategory = categories.find((c) => c._id === id)?.name?.toLowerCase();
    if (selectedCategory?.includes("grocery")) return unitMapping["grocery"];
    if (selectedCategory?.includes("electrical")) return unitMapping["electrical and electronics"];
    if (selectedCategory?.includes("clothing")) return unitMapping["clothing and garments"];
    return ["Pcs", "Kg", "Ml", "Ltr", "GM"];
  };

  // Normalize a variant coming from the API — guarantees a `batches` array
  // even for older documents saved before batch tracking existed (falls
  // back to the legacy single stock/expiryDate as that variant's one batch,
  // so nothing is ever silently dropped from the edit form).
  //
  // ✅ FIXED — also reformats each batch's expiryDate into the YYYY-MM-DD
  // shape the <input type="date"> needs. Without this, a full ISO
  // timestamp from MongoDB (e.g. "2026-12-15T00:00:00.000Z") silently
  // shows as a blank date field even though the value exists.
  const normalizeVariant = (v) => {
    if (v.batches && v.batches.length > 0) {
      return {
        ...v,
        batches: v.batches.map((b) => ({
          ...b,
          stock: b.stock ?? 0,
          expiryDate: b.expiryDate
            ? new Date(b.expiryDate).toISOString().split("T")[0]
            : "",
        })),
      };
    }
    if ((v.stock || 0) > 0 || v.expiryDate) {
      return {
        ...v,
        batches: [
          {
            stock: v.stock || 0,
            expiryDate: v.expiryDate
              ? new Date(v.expiryDate).toISOString().split("T")[0]
              : "",
          },
        ],
      };
    }
    return { ...v, batches: [] };
  };

  // Fetch product data for editing
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API}/api/product/${id}`);
        if (!data.success || !data.product) {
          toast.error("❌ Failed to fetch product");
          setLoading(false);
          return;
        }

        const p = data.product;

        setName(p.name || "");
        setDescription(
          Array.isArray(p.description) ? p.description.join("\n") : p.description || ""
        );
        setCategory(p.category || "");
        setSubcategory(p.subcategory || "");
        setBrand(p.brand?._id || p.brand || "");
        setBarcode(p.barcode || "");
        setFiles(p.image || []);
        setVariants((p.variants || []).map(normalizeVariant));

        if (p.category) {
          const { data: subData } = await axios.get(
            `${API}/api/subcategory/byCategory/${p.category}`
          );
          if (subData.success) setSubcategories(subData.subCategories || []);
        }
      } catch (err) {
        console.error("Fetch product error:", err);
        toast.error("❌ Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVariantFieldChange = (variantIndex, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex] = { ...updated[variantIndex], [field]: value };
      return updated;
    });
  };

  // ---- Restock: add a brand-new batch to an existing variant. The
  // existing batches are left completely untouched — this is the whole
  // point of batching, so an old delivery's real expiry never gets
  // overwritten by a new one. ----
  const addNewBatch = (variantIndex) => {
    setVariants((prev) => {
      const updated = [...prev];
      const variant = updated[variantIndex];
      updated[variantIndex] = {
        ...variant,
        batches: [...(variant.batches || []), { stock: "", expiryDate: "", isNew: true }],
      };
      return updated;
    });
  };

  const handleBatchChange = (variantIndex, batchIndex, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      const batches = [...updated[variantIndex].batches];
      batches[batchIndex] = { ...batches[batchIndex], [field]: value };
      updated[variantIndex] = { ...updated[variantIndex], batches };
      return updated;
    });
  };

  // Only a just-added batch (not yet saved) can be removed from the form —
  // an existing saved batch is never deletable here, since that would
  // silently destroy real inventory history. Use "0" stock instead if a
  // batch is fully sold through.
  const removeNewBatch = (variantIndex, batchIndex) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex] = {
        ...updated[variantIndex],
        batches: updated[variantIndex].batches.filter((_, i) => i !== batchIndex),
      };
      return updated;
    });
  };

  // Submit product update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingBatchFields = variants.some((v) =>
      (v.batches || []).some(
        (b) => b.stock === "" || (isGroceryOrFreshCategory && !b.expiryDate)
      )
    );
    if (missingBatchFields) {
      toast.error("Please fill stock (and expiry date, if applicable) for every batch");
      return;
    }

    setIsPending(true);

    try {
      const productData = {
        name,
        description: description.split("\n"),
        brand: Brand,
        category: Category,
        subcategory: Subcategory,
        barcode,
        variants: variants.map((v) => ({
          ...v,
          batches: (v.batches || []).map((b) => ({
            stock: Number(b.stock) || 0,
            expiryDate: isGroceryOrFreshCategory && b.expiryDate ? b.expiryDate : null,
          })),
        })),
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));

      files.forEach((file) => {
        if (file instanceof File) formData.append("images", file);
      });

      const { data } = await axios.put(
        `${API}/api/product/update/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        toast.success("✅ Product updated successfully");
        setTimeout(() => navigate("/admin/product-list"), 1500);
      } else {
        toast.error("❌ Failed to update product");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  // Barcode download
  const downloadBarcode = () => {
    const svg = document.querySelector("#barcode svg");
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
      const pngFile = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = pngFile;
      link.download = `${barcode}.png`;
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgStr);
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setCategory(catId);
    setSubcategory("");
    if (catId) {
      axios
        .get(`${API}/api/subcategory/byCategory/${catId}`)
        .then((res) => {
          if (res.data.success) setSubcategories(res.data.subCategories || []);
        })
        .catch((err) => console.error(err));
    } else {
      setSubcategories([]);
    }
  };

  if (loading || isCategoryLoading) return <p>Loading product...</p>;

  return (
    <AdminLayout page="edit-product">
      <div className="card product-card">
        <h4>Edit Product</h4>
        <form onSubmit={handleSubmit}>
          {/* Product Images */}
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
                        const updatedFiles = [...files];
                        updatedFiles[index] = e.target.files[0];
                        setFiles(updatedFiles);
                      }}
                    />
                    <img
                      src={
                        files[index]
                          ? typeof files[index] === "string"
                            ? files[index]
                            : URL.createObjectURL(files[index])
                          : image.upload_area
                      }
                      alt="upload"
                      className="image-preview"
                    />
                  </label>
                ))}
            </div>
          </div>

          {/* Name + Brand */}
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
              <option value="" disabled>
                -- Select Brand --
              </option>
              {!isBrandLoading &&
                brands?.map((b) => (
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
              <option value="" disabled>
                -- Select Category --
              </option>
              {categories?.map((c) => (
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
              disabled={!Category || subcategories.length === 0}
            >
              <option value="" disabled>
                -- Select Subcategory --
              </option>
              {subcategories.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
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

          {/* Variants + Batches — the real pricing/stock model */}
          <div className="variant-title mt-2" style={{ marginBottom: "10px" }}>
            Pricing Variants &amp; Stock Batches
          </div>

          {variants.map((v, vIndex) => (
            <div key={v._id || vIndex} className="variant-card" style={{ marginBottom: "16px" }}>
              <div className="variant-row">
                <input
                  className="variant-input"
                  placeholder="Price"
                  type="number"
                  value={v.price}
                  onChange={(e) => handleVariantFieldChange(vIndex, "price", e.target.value)}
                />
                <input
                  className="variant-input"
                  placeholder="Offer Price"
                  type="number"
                  value={v.offerPrice}
                  onChange={(e) => handleVariantFieldChange(vIndex, "offerPrice", e.target.value)}
                />
              </div>
              <div className="variant-row">
                <div style={{ fontSize: "13px", color: "#555", padding: "8px 0" }}>
                  Spec: {v.sizeLabel || `${v.quantity} ${v.unit}`}
                </div>
                <input
                  className="variant-input"
                  placeholder="Tax %"
                  type="number"
                  value={v.tax}
                  onChange={(e) => handleVariantFieldChange(vIndex, "tax", e.target.value)}
                />
              </div>

              {/* ✅ NEW — editable Stock Unit dropdown. Previously this was
                  impossible to fix from the Edit page at all; a wrong
                  stockUnit picked at Add time (e.g. "Ml" left over instead
                  of "Ltr") could only be corrected by deleting and
                  re-adding the whole product. */}
              <div className="variant-row">
                <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>
                  Stock Unit
                </label>
                <select
                  className="variant-input"
                  value={v.stockUnit || ""}
                  onChange={(e) => handleVariantFieldChange(vIndex, "stockUnit", e.target.value)}
                  style={{ width: "100%" }}
                >
                  {getUnitOptions(Category).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batches for this variant */}
              <div style={{ marginTop: "8px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#555", display: "block", marginBottom: "4px" }}>
                  Stock Batches
                </label>
                {(v.batches || []).map((batch, bIndex) => (
                  <div
                    key={bIndex}
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "flex-end",
                      marginBottom: "6px",
                      background: batch.isNew ? "#eef2ff" : "#f9fafb",
                      padding: "8px",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "11px", color: "#888" }}>
                        {batch.isNew ? "New batch — stock" : `Batch ${bIndex + 1} — stock`}
                      </label>
                      <input
                        className="variant-input"
                        type="number"
                        value={batch.stock}
                        onChange={(e) => handleBatchChange(vIndex, bIndex, "stock", e.target.value)}
                        style={{ width: "100%" }}
                      />
                    </div>
                    {isGroceryOrFreshCategory && (
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "11px", color: "#888" }}>Expiry Date</label>
                        <input
                          type="date"
                          className="form-input"
                          value={batch.expiryDate || ""}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => handleBatchChange(vIndex, bIndex, "expiryDate", e.target.value)}
                          style={{ width: "100%" }}
                        />
                      </div>
                    )}
                    {batch.isNew && (
                      <button
                        type="button"
                        onClick={() => removeNewBatch(vIndex, bIndex)}
                        style={{ background: "none", border: "none", color: "#A32D2D", cursor: "pointer", fontSize: "14px", padding: "6px" }}
                        title="Remove this new batch"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addNewBatch(vIndex)}
                  style={{
                    background: "none",
                    border: "1px dashed #6c63ff",
                    color: "#6c63ff",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  + Add New Batch (Restock)
                </button>
              </div>
            </div>
          ))}

          {/* Barcode */}
          <div className="form-row mt-2">
            <input type="text" className="form-input" value={barcode} readOnly />
          </div>

          {barcode && (
            <div className="mt-2 text-center" id="barcode">
              <Barcode value={barcode} />
              <button
                type="button"
                className="btn btn-secondary mt-2"
                onClick={downloadBarcode}
              >
                Download Barcode
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 mt-4"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default AdminEditProduct;