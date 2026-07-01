import Variant from "../../models/admin/VariantModel.js";
import SubCategory from "../../models/admin/SubCategory.model.js";
import { v2 as cloudinary } from "cloudinary";
import Product from "../../models/Product.js";

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ➕ Add Variant
export const addVariant = async (req, res) => {
  try {
    const { name, subcategory } = req.body;

    if (!name || !subcategory || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Name, subcategory, and image are required",
      });
    }

    // ✅ Check for existing variant with same name under the same subcategory (case-insensitive)
    const existingVariant = await Variant.findOne({
      subcategory,
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existingVariant) {
      return res.status(400).json({
        success: false,
        message: "Variant already exists in this subcategory",
      });
    }

    // ✅ Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "variants",
    });

    // ✅ Create new variant
    const variant = new Variant({
      name,
      subcategory,
      image: uploadResult.secure_url,
    });

    await variant.save();

    res.status(201).json({
      success: true,
      message: "Variant added successfully",
      variant,
    });
  } catch (error) {
    console.error("Add Variant Error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding variant",
      error: error.message,
    });
  }
};

// 📋 Get All Variants
export const getAllVariants = async (req, res) => {
  try {
    const variants = await Variant.find()
      .populate("subcategory", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(variants);
  } catch (error) {
    console.error("Get Variants Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching variants", error });
  }
};

// ✏️ Update Variant
export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subcategory } = req.body;

    const variant = await Variant.findById(id);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    // ✅ Check for duplicate name under same subcategory
    if (name) {
      const duplicate = await Variant.findOne({
        _id: { $ne: id },
        subcategory: subcategory || variant.subcategory,
        name: { $regex: `^${name}$`, $options: "i" },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Variant with this name already exists in this subcategory",
        });
      }
    }

    // ✅ Replace image if new one is uploaded
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "variants",
      });
      variant.image = uploadResult.secure_url;
    }

    // ✅ Update fields
    if (name) variant.name = name;
    if (subcategory) variant.subcategory = subcategory;

    await variant.save();

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      variant,
    });
  } catch (error) {
    console.error("Update Variant Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating variant",
      error: error.message,
    });
  }
};

// ❌ Delete Variant
export const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await Variant.findByIdAndDelete(id);

    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    console.error("Delete Variant Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting variant",
      error,
    });
  }
};

// 🔍 Get Variants by SubCategory
export const getVariantsBySubCategory = async (req, res) => {
  try {
    const variants = await Variant.find({ subcategory: req.params.subcategoryId })
      .sort({ createdAt: -1 });
    res.json({ success: true, variants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📦 Get Variant-related Product Data
export const getVariantData = async (req, res) => {
  try {
    const { id } = req.params;
    const variantData = await Product.find({ variant: id });
    res.status(200).json(variantData);
  } catch (error) {
    console.error("Get Variant Data Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching variant data",
      error: error.message,
    });
  }
};
