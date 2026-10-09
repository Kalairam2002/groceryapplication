import mongoose from "mongoose";
import Product from "../models/Product.js";

// ---------- helpers ----------

// Total stock of one pricing option — same rule the product page uses:
// sum of batch stock, or the legacy top-level stock on old documents.
const variantStock = (variant) => {
  if (variant.batches && variant.batches.length > 0) {
    return variant.batches.reduce((sum, b) => sum + (Number(b.stock) || 0), 0);
  }
  return Number(variant.stock) || 0;
};

// These two MUST stay identical to `normalize` / `slug` in BulkProductUpload.jsx,
// so a variation uploaded later gets the very same group id as the earlier ones.
const normalize = (t) => String(t ?? "").trim().replace(/\s+/g, " ").toLowerCase();
const slug = (t) => normalize(t).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Group id = base name + brand + category (the seller is matched separately
// when the group is read, so two sellers never mix).
const makeGroupId = (baseName, brandId, categoryId) =>
  `vg_${slug(baseName)}_${brandId}_${categoryId}`;

// ---------- GET /api/product/:id/variations ----------
// Returns the products linked to this one through `variationGroup`
// (e.g. "Single Boiled" and "Steam Sortex" of the same rice).
//
// Only products from the SAME seller are returned, so two sellers who list
// a product with the same name are never mixed on one page.
// A product with no variationGroup simply gets an empty list.
export const getProductVariations = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: true, variationType: "", variations: [] });
    }

    const product = await Product.findById(id).select("variationGroup variationType seller");
    if (!product || !product.variationGroup) {
      return res.json({ success: true, variationType: "", variations: [] });
    }

    const siblings = await Product.find({
      variationGroup: product.variationGroup,
      seller: product.seller,
    })
      .select("variationName variationType image inStock variants")
      .sort({ createdAt: 1 }); // same order they were uploaded in

    const variations = siblings.map((s) => {
      const totalStock = (s.variants || []).reduce((sum, v) => sum + variantStock(v), 0);
      return {
        _id: s._id,
        variationName: s.variationName || "",
        image: s.image && s.image.length > 0 ? s.image[0] : "",
        inStock: !!s.inStock && totalStock > 0,
      };
    });

    const variationType =
      siblings.map((s) => s.variationType).find(Boolean) || product.variationType || "";

    return res.json({ success: true, variationType, variations });
  } catch (error) {
    console.error("getProductVariations error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------- POST /api/product/link-variation ----------
// body: { barcode, baseName, groupBase, variationName, variationType }
//
// Called by the bulk upload right after a variation product has been saved.
// It finds the product by its (unique) barcode, among THIS seller's products,
// and stores the variation fields on it. Doing it here, after the save, means
// the add-product function does not need to know about variations at all.
export const linkProductVariation = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { barcode, baseName, groupBase, variationName, variationType } = req.body;

    if (!barcode || !baseName || !variationName) {
      return res.status(400).json({
        success: false,
        message: "barcode, baseName and variationName are required",
      });
    }

    // If these paths are missing from the schema, Mongoose would silently
    // ignore the update — so say so clearly instead.
    const missing = ["baseName", "variationName", "variationType", "variationGroup"].filter(
      (p) => !Product.schema.path(p)
    );
    if (missing.length > 0) {
      return res.status(500).json({
        success: false,
        message: `The Product schema is missing: ${missing.join(", ")}. Add these fields to the Product model and restart the server.`,
      });
    }

    const product = await Product.findOne({
      barcode: String(barcode).trim(),
      seller: sellerId,
    }).select("_id brand category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this seller (check the barcode)",
      });
    }

    // groupBase = the name exactly as it was in the sheet, so renaming a product
    // on the review screen does not break linking with variations uploaded later.
    const variationGroup = makeGroupId(groupBase || baseName, product.brand, product.category);

    // updateOne (not save): no validators or save-hooks run on the whole document
    await Product.updateOne(
      { _id: product._id },
      {
        $set: {
          baseName: String(baseName).trim(),
          variationName: String(variationName).trim(),
          variationType: String(variationType || "").trim(),
          variationGroup,
        },
      }
    );

    return res.json({ success: true, message: "Variation linked", variationGroup });
  } catch (error) {
    console.error("linkProductVariation error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};