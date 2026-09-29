import React, { useState } from "react";
import axios from "axios";
import ExcelJS from "exceljs/dist/exceljs.min.js";

/**
 * Bulk product upload from an Excel sheet — now also reads images that are
 * embedded/pasted directly into a cell (not just text/URL columns).
 *
 * Sheet columns (header names must match):
 *   name, description, brand, category, subcategory,
 *   price, offerPrice, quantity, unit, tax, sizeLabel, stock,
 *   returnable, expiryDate, barcode
 *
 * To attach an image: paste/insert the picture INTO a cell on that product's
 * row (any column). It gets matched to the row it's anchored on.
 *
 * Multiple pricing options: repeat the same name + brand + category on
 * several rows. Those rows become ONE product with one pricing option per
 * row. Only the FIRST of those rows needs the image — later rows reuse it.
 *
 * Requires: npm install exceljs   (xlsx package is no longer needed here)
 *
 * Usage inside SellerAddProduct.jsx:
 *   <BulkProductUpload categoryData={categoryData} brandData={brandData} />
 */

const generateBarcode = () =>
  "BC" + Date.now() + Math.floor(1000 + Math.random() * 9000);

const matchByName = (list, text) => {
  if (!text || !list) return null;
  const clean = String(text).trim().toLowerCase();
  const found = list.find((item) => item.name?.trim().toLowerCase() === clean);
  return found ? found._id : null;
};

const emptyVariant = () => ({
  price: "",
  offerPrice: "",
  quantity: "",
  unit: "Pcs",
  tax: "",
  sizeLabel: "",
  stock: "",
  expiryDate: "",
});

// ---------- styles ----------
const C = {
  ink: "#1E2233",
  purple: "#6c63ff",
  border: "#E4E7F0",
  soft: "#F6F7FB",
  muted: "#6B7280",
  green: "#16a34a",
  greenBg: "#ECFDF3",
  amber: "#B45309",
  amberBg: "#FFF7E6",
  red: "#B42318",
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.muted,
  marginBottom: 4,
  display: "block",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  border: `1px solid #D7DAE5`,
  borderRadius: 8,
  fontSize: 13,
  background: "#fff",
  color: C.ink,
  minWidth: 0,
};

const smallBtn = {
  border: `1px solid #D7DAE5`,
  background: "#fff",
  color: C.ink,
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const Field = ({ label, children, style }) => (
  <div style={style}>
    <span style={labelStyle}>{label}</span>
    {children}
  </div>
);

const EXT_TO_MIME = { png: "image/png", jpeg: "image/jpeg", jpg: "image/jpeg", gif: "image/gif" };

const BulkProductUpload = ({ categoryData = [], brandData = [] }) => {
  const [rows, setRows] = useState([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  // ---------- helpers about a product ----------
  const categoryOf = (row) => categoryData.find((c) => c._id === row.categoryId);
  const needsExpiry = (row) => categoryOf(row)?.requiresExpiry === true;
  const showSize = (row) =>
    categoryOf(row)?.name?.toLowerCase().includes("clothing") ||
    row.variants.some((v) => v.sizeLabel);

  const getMissing = (row) => {
    const m = [];
    if (!row.imageFile) m.push("image");
    if (!row.barcode) m.push("barcode");
    if (!row.categoryId) m.push("category");
    if (!row.subcategoryId) m.push("subcategory");
    if (!row.brandId) m.push("brand");
    if (row.variants.some((v) => !v.price || !v.quantity || v.stock === ""))
      m.push("price / quantity / stock");
    if (needsExpiry(row) && row.variants.some((v) => !v.expiryDate))
      m.push("expiry date");
    return m;
  };

  // ---------- 1. Parse the sheet: text via ExcelJS cell values, images via embedded media ----------
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResults(null);
    setIsParsing(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const sheet = workbook.worksheets[0];

      // Header row -> column index map
      const headerRow = sheet.getRow(1);
      const colMap = {}; // e.g. { name: 1, brand: 2, ... }
      headerRow.eachCell((cell, colNumber) => {
        const key = String(cell.value || "").trim();
        if (key) colMap[key] = colNumber;
      });

      const getCell = (rowNumber, key) => {
        const col = colMap[key];
        if (!col) return "";
        const val = sheet.getRow(rowNumber).getCell(col).value;
        return val == null ? "" : val;
      };

      // Build one image (as a File) per Excel row number, from embedded media
      const imagesByRow = {};
      const images = sheet.getImages(); // [{ imageId, range: { tl: { nativeRow, nativeCol }, ... } }]
      images.forEach((img) => {
        const media = workbook.model.media.find((m) => m.index === img.imageId);
        if (!media) return;
        const rowNumber = Math.floor(img.range.tl.nativeRow) + 1; // nativeRow is 0-based
        const mime = EXT_TO_MIME[media.extension] || "image/png";
        const blob = new Blob([media.buffer], { type: mime });
        imagesByRow[rowNumber] = new File([blob], `row${rowNumber}.${media.extension}`, {
          type: mime,
        });
      });

      // Walk data rows (row 2 onward) and group into products
      const groups = new Map();
      const lastRow = sheet.actualRowCount;
      for (let rowNumber = 2; rowNumber <= lastRow; rowNumber++) {
        const name = getCell(rowNumber, "name");
        if (!name) continue; // skip blank rows

        const rBrand = getCell(rowNumber, "brand");
        const rCategory = getCell(rowNumber, "category");
        const rSubcategory = getCell(rowNumber, "subcategory");
        const key = [name, rCategory, rBrand]
          .map((v) => String(v).trim().toLowerCase())
          .join("|");

        const variant = {
          price: getCell(rowNumber, "price"),
          offerPrice: getCell(rowNumber, "offerPrice"),
          quantity: getCell(rowNumber, "quantity"),
          unit: getCell(rowNumber, "unit") || "Pcs",
          tax: getCell(rowNumber, "tax"),
          sizeLabel: getCell(rowNumber, "sizeLabel"),
          stock: getCell(rowNumber, "stock") || getCell(rowNumber, "quantity"),
          expiryDate: getCell(rowNumber, "expiryDate"),
        };

        const rowImage = imagesByRow[rowNumber] || null;
        const sheetBarcode = String(getCell(rowNumber, "barcode") || "");

        if (!groups.has(key)) {
          const categoryId = matchByName(categoryData, rCategory);
          const brandId = matchByName(brandData, rBrand);
          groups.set(key, {
            name,
            description: String(getCell(rowNumber, "description") || ""),
            sheetBrand: rBrand,
            brandId,
            categoryId,
            subcategoryName: rSubcategory,
            subcategoryId: null,
            returnable: String(getCell(rowNumber, "returnable")).toUpperCase() === "TRUE",
            imageFile: rowImage,
            barcode: sheetBarcode,
            variants: [variant],
            notes: [
              !categoryId ? `Category "${rCategory}" not found — please pick one` : "",
              categoryId && !brandId ? `Brand "${rBrand}" not found — please pick one` : "",
            ].filter(Boolean),
          });
        } else {
          const g = groups.get(key);
          g.variants.push(variant);
          if (!g.imageFile && rowImage) g.imageFile = rowImage; // pick up image from any variant row
          if (!g.barcode && sheetBarcode) g.barcode = sheetBarcode;
        }
      }

      const parsed = [...groups.values()].map((p, i) => ({ ...p, _rowId: i }));
      setRows(parsed);

      const uniqueCategoryIds = [...new Set(parsed.map((r) => r.categoryId).filter(Boolean))];
      const subMap = {};
      await Promise.all(
        uniqueCategoryIds.map(async (catId) => {
          try {
            const res = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/subcategory/byCategory/${catId}`
            );
            if (res.data.success) subMap[catId] = res.data.subCategories;
          } catch (err) {
            console.error("subcategory fetch failed for", catId, err.message);
          }
        })
      );
      setSubcategoriesByCategory(subMap);

      setRows((prev) =>
        prev.map((row) => {
          if (!row.categoryId) return row;
          const subId = matchByName(subMap[row.categoryId] || [], row.subcategoryName);
          return {
            ...row,
            subcategoryId: subId,
            notes:
              row.subcategoryName && !subId
                ? [...row.notes, `Subcategory "${row.subcategoryName}" not found — please pick one`]
                : row.notes,
          };
        })
      );
    } catch (err) {
      console.error("Sheet parse error:", err);
      alert("Could not read that file. Make sure it's a real .xlsx file.");
    } finally {
      setIsParsing(false);
      e.target.value = ""; // allow re-selecting the same file later
    }
  };

  // ---------- 2. Editing helpers ----------
  const updateRow = (rowId, field, value) => {
    setRows((prev) => prev.map((r) => (r._rowId === rowId ? { ...r, [field]: value } : r)));
  };

  const changeCategory = async (rowId, catId) => {
    setRows((prev) =>
      prev.map((r) => (r._rowId === rowId ? { ...r, categoryId: catId, subcategoryId: null } : r))
    );
    if (catId && !subcategoriesByCategory[catId]) {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subcategory/byCategory/${catId}`
        );
        if (res.data.success) {
          setSubcategoriesByCategory((prev) => ({ ...prev, [catId]: res.data.subCategories }));
        }
      } catch (err) {
        console.error("subcategory fetch failed for", catId, err.message);
      }
    }
  };

  const updateVariant = (rowId, vIndex, field, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r._rowId === rowId
          ? { ...r, variants: r.variants.map((v, i) => (i === vIndex ? { ...v, [field]: value } : v)) }
          : r
      )
    );
  };

  const addVariant = (rowId) => {
    setRows((prev) =>
      prev.map((r) => (r._rowId === rowId ? { ...r, variants: [...r.variants, emptyVariant()] } : r))
    );
  };

  const removeVariant = (rowId, vIndex) => {
    setRows((prev) =>
      prev.map((r) =>
        r._rowId === rowId && r.variants.length > 1
          ? { ...r, variants: r.variants.filter((_, i) => i !== vIndex) }
          : r
      )
    );
  };

  const removeRow = (rowId) => setRows((prev) => prev.filter((r) => r._rowId !== rowId));

  const generateAllBarcodes = () => {
    setRows((prev) => prev.map((r) => ({ ...r, barcode: r.barcode || generateBarcode() })));
  };

  // ---------- 3. Submit every product ----------
  const readyCount = rows.filter((r) => getMissing(r).length === 0).length;
  const attentionCount = rows.length - readyCount;

  const handleBulkSubmit = async () => {
    if (attentionCount > 0) {
      alert("Some products still need attention. Fill in what is marked in red.");
      return;
    }

    setIsSubmitting(true);
    const created = [];
    const failed = [];

    for (const row of rows) {
      try {
        const requiresExpiry = needsExpiry(row);

        const variants = row.variants.map((v) => ({
          price: v.price,
          offerPrice: v.offerPrice,
          quantity: v.quantity,
          unit: v.unit,
          tax: v.tax,
          stockUnit: v.unit,
          sizeLabel: v.sizeLabel || "",
          batches: [{ stock: Number(v.stock) || 0, expiryDate: requiresExpiry ? v.expiryDate : null }],
        }));

        const productData = {
          name: row.name,
          description: String(row.description).split("\n"),
          brand: row.brandId,
          category: row.categoryId,
          subcategory: row.subcategoryId,
          variants,
          variantdata: "",
          barcode: row.barcode,
          returnable: row.returnable,
        };

        const formData = new FormData();
        formData.append("productData", JSON.stringify(productData));
        formData.append("variants", JSON.stringify(variants));
        formData.append("images", row.imageFile);

        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/product/add`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
        );

        if (res.data.success) created.push(row.name);
        else failed.push({ name: row.name, reason: res.data.message });
      } catch (err) {
        failed.push({ name: row.name, reason: err.message });
      }
    }

    setResults({ created, failed });
    setIsSubmitting(false);

    if (failed.length === 0) {
      alert(`${created.length} product(s) added successfully`);
      setRows([]);
    } else {
      alert(
        `${created.length} product(s) added successfully.\n${failed.length} failed:\n` +
          failed.map((f) => `- ${f.name}: ${f.reason}`).join("\n")
      );
      const failedNames = new Set(failed.map((f) => f.name));
      setRows((prev) => prev.filter((r) => failedNames.has(r.name)));
    }
  };

  // ---------- upload box ----------
  if (rows.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: `1.5px dashed ${C.purple}`,
          borderRadius: 14,
          padding: "1.5rem",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        <label style={{ cursor: "pointer", fontWeight: 700, color: C.purple, fontSize: 15 }}>
          {isParsing ? "Reading sheet..." : "📄 Bulk Upload from Excel Sheet"}
          <input type="file" accept=".xlsx" hidden onChange={handleFileSelect} disabled={isParsing} />
        </label>
        <p style={{ fontSize: 12, color: C.muted, margin: "8px 0 2px" }}>
          Sheet columns: name, description, brand, category, subcategory, price, offerPrice,
          quantity, unit, tax, sizeLabel, stock, returnable, expiryDate, barcode
        </p>
        <p style={{ fontSize: 12, color: C.muted, margin: "2px 0" }}>
          For multiple pricing options, repeat the same name, brand and category on several rows.
        </p>
        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
          To attach a photo, paste/insert the picture into any cell on that product's row — it will
          be picked up automatically. Only .xlsx (not .csv or .xls) supports embedded images.
        </p>
      </div>
    );
  }

  // ---------- review screen ----------
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.25rem", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, color: C.ink }}>
            Review {rows.length} product{rows.length > 1 ? "s" : ""} before adding
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: C.muted }}>
            Images and barcodes already in the sheet were picked up automatically. Check what's left
            marked in red.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" style={smallBtn} onClick={generateAllBarcodes}>Generate remaining barcodes</button>
          <button type="button" style={{ ...smallBtn, color: C.red }} onClick={() => setRows([])}>Cancel upload</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, fontSize: 12.5, fontWeight: 600 }}>
        <span style={{ background: C.greenBg, color: C.green, padding: "5px 12px", borderRadius: 20 }}>
          ✓ {readyCount} ready
        </span>
        <span style={{ background: attentionCount ? C.amberBg : C.soft, color: attentionCount ? C.amber : C.muted, padding: "5px 12px", borderRadius: 20 }}>
          ! {attentionCount} need attention
        </span>
      </div>

      {rows.map((row, idx) => {
        const missing = getMissing(row);
        const ready = missing.length === 0;
        const withSize = showSize(row);
        const withExpiry = needsExpiry(row);

        const cols = [
          { key: "price", label: "Price (₹)", type: "number" },
          { key: "offerPrice", label: "Offer price (₹)", type: "number" },
          { key: "quantity", label: "Quantity", type: "number" },
          { key: "unit", label: "Unit", type: "text" },
          { key: "tax", label: "Tax %", type: "number" },
          ...(withSize ? [{ key: "sizeLabel", label: "Size", type: "text" }] : []),
          { key: "stock", label: "Stock", type: "number" },
          ...(withExpiry ? [{ key: "expiryDate", label: "Expiry date", type: "date" }] : []),
        ];
        const gridCols = `repeat(${cols.length}, minmax(90px, 1fr)) 30px`;

        return (
          <div key={row._rowId} style={{ border: `1.5px solid ${ready ? "#BFE8CC" : C.border}`, borderRadius: 12, padding: 16, marginBottom: 16, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", background: C.ink, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {idx + 1}
              </span>
              <input
                value={row.name}
                onChange={(e) => updateRow(row._rowId, "name", e.target.value)}
                style={{ ...inputStyle, flex: 1, minWidth: 180, fontSize: 15, fontWeight: 600 }}
                placeholder="Product name"
              />
              <span style={{ background: ready ? C.greenBg : C.amberBg, color: ready ? C.green : C.amber, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                {ready ? "✓ Ready" : `! ${missing.length} to fix`}
              </span>
              <button type="button" onClick={() => removeRow(row._rowId)} title="Remove this product" style={{ ...smallBtn, color: C.red, padding: "6px 10px" }}>
                Remove
              </button>
            </div>

            {!ready && <div style={{ fontSize: 12, color: C.red, marginBottom: 12 }}>Still needed: {missing.join(", ")}</div>}
            {row.notes.map((n, i) => (
              <div key={i} style={{ fontSize: 12, color: C.amber, marginBottom: 6 }}>⚠ {n}</div>
            ))}

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 110 }}>
                <span style={labelStyle}>
                  Product image {row.imageFile ? "(from sheet)" : "*"}
                </span>
                <label style={{ width: 110, height: 110, borderRadius: 10, border: `1.5px dashed ${row.imageFile ? C.border : C.purple}`, background: C.soft, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", cursor: "pointer", overflow: "hidden", textAlign: "center" }}>
                  {row.imageFile ? (
                    <img src={URL.createObjectURL(row.imageFile)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <>
                      <span style={{ fontSize: 24, color: C.purple, lineHeight: 1 }}>＋</span>
                      <span style={{ fontSize: 11.5, color: C.purple, fontWeight: 600 }}>Add image</span>
                    </>
                  )}
                  <input type="file" accept="image/*" hidden onChange={(e) => updateRow(row._rowId, "imageFile", e.target.files[0])} />
                </label>
                {row.imageFile && <span style={{ fontSize: 11, color: C.muted }}>Click to replace</span>}
              </div>

              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 12 }}>
                  <Field label="Category *">
                    <select style={inputStyle} value={row.categoryId || ""} onChange={(e) => changeCategory(row._rowId, e.target.value)}>
                      <option value="">-- Select category --</option>
                      {categoryData.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Subcategory *">
                    <select style={inputStyle} value={row.subcategoryId || ""} disabled={!row.categoryId} onChange={(e) => updateRow(row._rowId, "subcategoryId", e.target.value)}>
                      <option value="">-- Select subcategory --</option>
                      {(subcategoriesByCategory[row.categoryId] || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Brand *">
                    <select style={inputStyle} value={row.brandId || ""} onChange={(e) => updateRow(row._rowId, "brandId", e.target.value)}>
                      <option value="">-- Select brand --</option>
                      {brandData.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </Field>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                  <Field label={`Barcode ${row.barcode ? "(from sheet)" : "*"}`}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input style={inputStyle} value={row.barcode} placeholder="Type a barcode or generate" onChange={(e) => updateRow(row._rowId, "barcode", e.target.value)} />
                      <button type="button" style={{ ...smallBtn, whiteSpace: "nowrap", color: C.purple, borderColor: C.purple }} onClick={() => updateRow(row._rowId, "barcode", generateBarcode())}>
                        Generate
                      </button>
                    </div>
                  </Field>
                  <Field label="Description">
                    <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 36 }} rows={2} value={row.description} onChange={(e) => updateRow(row._rowId, "description", e.target.value)} />
                  </Field>
                </div>

                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 13, color: C.ink, cursor: "pointer" }}>
                  <input type="checkbox" checked={row.returnable} onChange={(e) => updateRow(row._rowId, "returnable", e.target.checked)} />
                  Customers can return this product
                </label>
              </div>
            </div>

            <div style={{ marginTop: 16, background: C.soft, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 8 }}>
                Pricing options <span style={{ fontWeight: 400, color: C.muted }}>({row.variants.length})</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: cols.length * 100 }}>
                  <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 8, marginBottom: 4 }}>
                    {cols.map((c) => <span key={c.key} style={{ ...labelStyle, marginBottom: 0 }}>{c.label}</span>)}
                    <span />
                  </div>
                  {row.variants.map((v, vi) => (
                    <div key={vi} style={{ display: "grid", gridTemplateColumns: gridCols, gap: 8, marginBottom: 8, alignItems: "center" }}>
                      {cols.map((c) => (
                        <input key={c.key} type={c.type} style={inputStyle} value={v[c.key]} onChange={(e) => updateVariant(row._rowId, vi, c.key, e.target.value)} />
                      ))}
                      <button type="button" onClick={() => removeVariant(row._rowId, vi)} disabled={row.variants.length === 1} title="Remove this pricing option" style={{ border: "none", background: "none", color: row.variants.length === 1 ? "#ccc" : C.red, cursor: row.variants.length === 1 ? "default" : "pointer", fontSize: 16 }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => addVariant(row._rowId)} style={{ background: "none", border: `1px dashed ${C.purple}`, color: C.purple, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                + Add another pricing option
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleBulkSubmit}
        disabled={isSubmitting || attentionCount > 0}
        style={{ width: "100%", padding: 14, background: attentionCount > 0 ? "#9AA0B4" : C.ink, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: attentionCount > 0 || isSubmitting ? "not-allowed" : "pointer" }}
      >
        {isSubmitting ? "Adding products..." : `Add all ${rows.length} product${rows.length > 1 ? "s" : ""}`}
      </button>
      {attentionCount > 0 && (
        <p style={{ textAlign: "center", fontSize: 12, color: C.amber, margin: "8px 0 0" }}>
          {attentionCount} product{attentionCount > 1 ? "s" : ""} still need attention — see "Still needed" on each card.
        </p>
      )}

      {results && results.failed.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 13, color: C.red }}>
          {results.failed.length} failed:
          <ul>{results.failed.map((f, i) => <li key={i}>{f.name}: {f.reason}</li>)}</ul>
        </div>
      )}
    </div>
  );
};

export default BulkProductUpload;