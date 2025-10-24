import Brand from "../../models/admin/Brand.model.js";
import { v2 as cloudinary } from "cloudinary";

// ✅ Cloudinary configuration (optional)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ➕ Add Brand
export const addBrand = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !req.file) {
      return res.status(400).json({ success: false, message: "Name and image are required" });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "brands",
    });

    const brand = new Brand({
      name,
      image: uploadResult.secure_url,
    });

    await brand.save();
    res.status(201).json({ success: true, message: "Brand added successfully", brand });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding brand", error });
  }
};

// 📋 Get All Brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching brands", error });
  }
};

// ✏️ Update Brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const brand = await Brand.findById(id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "brands" });
      brand.image = uploadResult.secure_url;
    }

    if (name) brand.name = name;

    await brand.save();
    res.status(200).json({ success: true, message: "Brand updated successfully", brand });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating brand", error });
  }
};

// ❌ Delete Brand
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    res.status(200).json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting brand", error });
  }
};
