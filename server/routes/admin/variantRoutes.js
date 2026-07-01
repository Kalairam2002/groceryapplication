import express from "express";
import multer from "multer";
import {
  addVariant,
  getAllVariants,
  updateVariant,
  deleteVariant,
  getVariantsBySubCategory,
  getVariantData,
} from "../../controllers/admin/variantController.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({});
const upload = multer({ storage });

// ➕ Add Variant
router.post("/", upload.single("image"), addVariant);

// 📋 Get All Variants
router.get("/", getAllVariants);

// ✏️ Update Variant
router.put("/:id", upload.single("image"), updateVariant);

// ❌ Delete Variant
router.delete("/:id", deleteVariant);

// 🔍 Get Variants by SubCategory
router.get("/bySubCategory/:subcategoryId", getVariantsBySubCategory);

// 📦 Get Variant-related Product Data
router.get("/getvariantdata/:id", getVariantData);

export default router;
