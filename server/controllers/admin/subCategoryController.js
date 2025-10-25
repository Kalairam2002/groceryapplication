import SubCategory from "../../models/admin/SubCategory.model.js";
import Category from "../../models/admin/Category.model.js";
import { v2 as cloudinary } from "cloudinary";
import Product from "../../models/Product.js";

// ✅ Cloudinary configuration (same as Brand)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ➕ Add SubCategory
export const addSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Name, category, and image are required",
      });
    }

    // ✅ Check for existing subcategory with same name (case-insensitive) under the same category
    const existingSubCategory = await SubCategory.findOne({
      category,
      name: { $regex: `^${name}$`, $options: "i" }, // case-insensitive exact match
    });

    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: "Subcategory already exists in this category",
      });
    }

    // ✅ Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "subcategories",
    });

    // ✅ Create new subcategory
    const subCategory = new SubCategory({
      name,
      category,
      image: uploadResult.secure_url,
    });

    await subCategory.save();

    res.status(201).json({
      success: true,
      message: "Subcategory added successfully",
      subCategory,
    });
  } catch (error) {
    console.error("Add SubCategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding subcategory",
      error: error.message,
    });
  }
};


// 📋 Get All SubCategories
export const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(subCategories);
  } catch (error) {
    console.error("Get SubCategories Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching subcategories", error });
  }
};

// ✏️ Update SubCategory
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });
    }

    // ✅ Check for duplicate (case-insensitive)
    if (name) {
      const duplicate = await SubCategory.findOne({
        _id: { $ne: id }, // exclude current subcategory
        category: category || subCategory.category,
        name: { $regex: `^${name}$`, $options: "i" }, // case-insensitive exact match
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Subcategory with this name already exists in this category",
        });
      }
    }

    // ✅ If new image uploaded, replace it
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "subcategories",
      });
      subCategory.image = uploadResult.secure_url;
    }

    // ✅ Update fields
    if (name) subCategory.name = name;
    if (category) subCategory.category = category;

    await subCategory.save();

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      subCategory,
    });
  } catch (error) {
    console.error("Update SubCategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating subcategory",
      error: error.message,
    });
  }
};


// ❌ Delete SubCategory
export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await SubCategory.findByIdAndDelete(id);

    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });
    }

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    console.error("Delete SubCategory Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error deleting subcategory", error });
  }
};

// GET /api/subcategory/byCategory/:categoryId
export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ category: req.params.categoryId })
      .sort({ createdAt: -1 });
    res.json({ success: true, subCategories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get SubCategory Data
export const getsubdata = async (req, res) => {
  try { 
    const { id } = req.params;
    const subCategoryData = await Product.find({ subcategory : id });
    res.status(200).json(subCategoryData);
  } catch (error) {
    console.error("Get SubCategory Data Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subcategory data",
      error: error.message,
    });
  } 
};
