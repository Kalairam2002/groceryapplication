
import SubCategory from "../models/admin/SubCategory.model.js";
import variant from "../models/admin/VariantModel.js";




export const getsubcategorydatas = async (req, res) => {
  try {
    const { id } = req.params; // category ID

    // Find all subcategories that belong to this category
    const subCategories = await SubCategory.find({ category: id })
      .populate("category") // populates full category details
      .sort({ createdAt: -1 }); // latest first

    if (!subCategories || subCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No subcategories found for this category",
      });
    }

    res.status(200).json(
      subCategories
      
    );
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subcategories",
      error: error.message,
    });
  }
};




export const getveriantdatas = async (req, res) => {
  try {
    const { id } = req.params; // category ID

    // Find all subcategories that belong to this category
    const variantdata = await variant.find({ subcategory: id })
     

    if (!variantdata || variantdata.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No variant found for this subcategory",
      });
    }

    res.status(200).json(
      variantdata
      
    );
  } catch (error) {
    console.error("Error fetching variantdata:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching variantdata",
      error: error.message,
    });
  }
};


