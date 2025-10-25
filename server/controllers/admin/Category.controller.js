import { v2 as cloudinary } from 'cloudinary';
import Category from "../../models/admin/Category.model.js"; // ✅ fixed capitalization
import MainCategory from "../../models/admin/MainCategory.model.js";
import SubCategory from "../../models/admin/SubCategory.model.js";
import Product from '../../models/Product.js';

// Add Category
// ✅ Add Category Controller (Improved)
export const AddCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const imageFile = req.file;

    // 1️⃣ Validate name
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // 2️⃣ Check for duplicate (case-insensitive)
    const existingCategory = await Category.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    // 3️⃣ Upload image (optional)
    let imageUrl = "";
    if (imageFile) {
      const result = await cloudinary.uploader.upload(imageFile.path, {
        folder: "categories",
      });
      imageUrl = result.secure_url;
    }

    // 4️⃣ Create new category
    const newCategory = new Category({
      name,
      image: imageUrl,
    });

    await newCategory.save();

    // 5️⃣ Send response
    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};


// Main Category
export const mainCategory = async (req, res) => {
  try {
    const categoryData = JSON.parse(req.body.categoryData);
    const images = req.files;

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    await MainCategory.create({ ...categoryData, image: imagesUrl });
    res.json({ success: true, message: "category Added" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Categories
export const GetCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetMainCategory = async (req, res) => {
  try {
    const maincategories = await MainCategory.find();
    res.json(maincategories);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetSubCategory = async (req, res) => {
  try {
    const subcategories = await SubCategory.find();
    res.json(subcategories);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Categories
export const dldCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    await category.deleteOne();
    res.json({ success: true, message: "Category Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const dldSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await SubCategory.findByIdAndDelete(id);
    res.json({ success: true, message: "SubCategory Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const dldMainCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await MainCategory.findByIdAndDelete(id);
    res.json({ success: true, message: "Main Category Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Category Data
export const getcategorydata = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = await Product.find({ Category: id });
    if (!categoryData) return res.status(404).json({ success: false, message: "Category not found" });
    res.json(categoryData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubcategorydata = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategoryData = await SubCategory.findById(id);
    if (!subcategoryData) return res.status(404).json({ success: false, message: "Category not found" });
    res.json(subcategoryData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMaincategorydata = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = await MainCategory.findById(id);
    if (!categoryData) return res.status(404).json({ success: false, message: "Main Category not found" });
    res.json(categoryData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryDataObj = JSON.parse(req.body.categoryData);
    const categoryDoc = await Category.findById(id);
    const images = req.files;

    if (!categoryDoc) return res.status(404).json({ message: "Category not found" });

    let uploadedImages = [];
    if (images && images.length > 0) {
      uploadedImages = await Promise.all(
        images.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
          return result.secure_url;
        })
      );
    }

    categoryDoc.name = categoryDataObj.name || categoryDoc.name;
    categoryDoc.image = uploadedImages.length > 0 ? uploadedImages : categoryDoc.image;
    categoryDoc.maincategory = categoryDataObj.maincategory || categoryDoc.maincategory;
    await categoryDoc.save();

    res.status(200).json({ message: "Category updated", category: categoryDoc });

  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update SubCategory
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryDataObj = JSON.parse(req.body.categoryData);
    const categoryDoc = await SubCategory.findById(id);
    const images = req.files;

    if (!categoryDoc) return res.status(404).json({ message: "Category not found" });

    let uploadedImages = [];
    if (images && images.length > 0) {
      uploadedImages = await Promise.all(
        images.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
          return result.secure_url;
        })
      );
    }

    categoryDoc.name = categoryDataObj.name || categoryDoc.name;
    categoryDoc.image = uploadedImages.length > 0 ? uploadedImages : categoryDoc.image;
    categoryDoc.categoryid = categoryDataObj.categoryid || categoryDoc.categoryid;
    await categoryDoc.save();

    res.status(200).json({ message: "Sub Category updated", category: categoryDoc });

  } catch (error) {
    console.error("Error updating subcategory:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Main Category
export const updateMainCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryDataObj = JSON.parse(req.body.categoryData);
    const categoryDoc = await MainCategory.findById(id);
    const images = req.files;

    if (!categoryDoc) return res.status(404).json({ message: "Category not found" });

    let uploadedImages = [];
    if (images && images.length > 0) {
      uploadedImages = await Promise.all(
        images.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
          return result.secure_url;
        })
      );
    }

    const existingImages = categoryDataObj.existingImages || [];
    const finalImageList = [...existingImages, ...uploadedImages];
    categoryDoc.name = categoryDataObj.name || categoryDoc.name;
    categoryDoc.image = finalImageList.length > 0 ? finalImageList : categoryDoc.image;
    await categoryDoc.save();

    res.status(200).json({ message: "Main Category updated", category: categoryDoc });

  } catch (error) {
    console.error("Error updating main category:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add SubCategory
export const AddsubCategory = async (req, res) => {
  try {
    const subcategoryData = JSON.parse(req.body.subcategoryData);
    const imageFile = req.file;
    let imageUrl;

    if (imageFile) {
      const result = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      imageUrl = result.secure_url;
    }

    await SubCategory.create({ ...subcategoryData, image: imageUrl });
    res.json({ success: true, message: "Subcategory Added" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Category 
// Get All Categories
export const adminGetCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Category
export const adminGetCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Category (Improved)
export const adminUpdateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    // 1️⃣ Find category
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // 2️⃣ Prevent duplicate category names (case-insensitive)
    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await Category.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Category name already exists",
        });
      }
    }

    // 3️⃣ Handle image upload (if new file is provided)
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
      });
      category.image = uploadResult.secure_url;
    }

    // 4️⃣ Update category fields
    category.name = name || category.name;

    await category.save();

    // 5️⃣ Send success response
    return res.status(200).json({
      success: true,
      message: "✅ Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};


// Delete Category
export const adminDeleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
