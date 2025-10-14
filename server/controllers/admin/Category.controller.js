import {v2 as cloudinary} from 'cloudinary';
import category from "../../models/admin/Category.model.js";
import MainCategory from "../../models/admin/MainCategory.model.js";
import SubCategory from "../../models/admin/SubCategory.model.js";

export const AddCategory = async (req, res) => {
  try {
    // let categoryData = JSON.parse(req.body.categoryData);
      const {name} = req.body;
      
      const imageFile = req.file;
     
      if(!name){
        return res.status(400).json({ success: false, message: "category data is not available" });
      }
      if (!imageFile) {
      return res.status(400).json({ success: false, message: "Image file is missing" });
      }

      const existingcategory = await category.findOne({ name });
      if (existingcategory) {
        return res.status(400).json({ success: false, message: "Category already exists" });
      }

    const result = await cloudinary.uploader.upload(imageFile.path, {
      folder: "categories",
    });


    const imageUrl = result.secure_url;
      
      const newCategory = new category({ 
        name : name
        ,image : imageUrl
       });

       if(newCategory){
          await newCategory.save();
          return res.status(201).json({ success: true, message: "Category Added" });

       }else{

          return res.status(400).json({ success: false, message: "Invalid category data" });
       }
       

    // const images = req.files;

    // let imagesUrl = await Promise.all(
    //   images.map(async (item) => {
    //     let result = await cloudinary.uploader.upload(item.path, {
    //       resource_type: "image",
    //     });
    //     return result.secure_url;
    //   })
    // );

    // await category.create({ ...categoryData, image: imagesUrl });

    
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const mainCategory = async (req, res) => {
  try {
    let categoryData = JSON.parse(req.body.categoryData);

    const images = req.files;

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    await MainCategory.create({ ...categoryData, image: imagesUrl });

    res.json({ success: true, message: "category Added" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const GetCategory = async (req, res) => {
  try {
    const categories = await category.find();
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
    const Subcategories = await SubCategory.find();
    res.json(Subcategories);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const dldCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await category.findByIdAndDelete(id);
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

export const getcategorydata = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = await category.findById(id);
    if (!categoryData) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json(categoryData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getSubcategorydata = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategoryData = await SubCategory.findById(id);
    if (!subcategoryData) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json(subcategoryData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMaincategorydata = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = await MainCategory.findById(id);
    if (!categoryData) {
      return res.status(404).json({ success: false, message: "Main Category not found" });
    }
    res.json(categoryData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categorydatas = await category.findById(id);
    const categoryData = JSON.parse(req.body.categoryData);
    const images = req.files;
    
    if (!categorydatas) {
      return res.status(404).json({ message: "Category not found" });
    }

    let uploadedImages = [];
    if (images && images.length > 0) {
      const uploadPromises = images.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image", });
        return result.secure_url;
      });
      uploadedImages = await Promise.all(uploadPromises);
    }
    categorydatas.name = categoryData.name;
    categorydatas.image = uploadedImages;
    categorydatas.maincategory = categoryData.maincategory;
    await categorydatas.save();

    res.status(200).json({ message: "Category updated", category });

    
  } catch (error) {
    console.log("Error updating category:", error);
    console.log("Error updating category.............");
    
    return res.status(500).json({ success: false, message: error.message });
  } 
};

export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categorydatas = await SubCategory.findById(id);
    const categoryData = JSON.parse(req.body.categoryData);
    const images = req.files;
    
    if (!categorydatas) {
      return res.status(404).json({ message: "Category not found" });
    }

    let uploadedImages = [];
    if (images && images.length > 0) {
      const uploadPromises = images.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image", });
        return result.secure_url;
      });
      uploadedImages = await Promise.all(uploadPromises);
    }
    categorydatas.name = categoryData.name;
    categorydatas.image = uploadedImages;
    categorydatas.categoryid = categoryData.categoryid;
    await categorydatas.save();

    res.status(200).json({ message: "Sub Category updated" , category: categorydatas });

    
  } catch (error) {
    console.log("Error updating category:", error);
    console.log("Error updating category.............");
    
    return res.status(500).json({ success: false, message: error.message });
  } 
};

export const updateMainCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categorydatas = await MainCategory.findById(id);
    const categoryData = JSON.parse(req.body.categoryData);
    const images = req.files;
    
    if (!categorydatas) {
      return res.status(404).json({ message: "Category not found" });
    }

    let uploadedImages = [];
    if (images && images.length > 0) {
      const uploadPromises = images.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image", });
        return result.secure_url;
      });
      uploadedImages = await Promise.all(uploadPromises);
    }

    const existingImages = categoryData.existingImages ;
    console.log("existingImages by ram", existingImages);
    const finalImageList = [...existingImages, ...uploadedImages];
    categorydatas.name = categoryData.name;
    categorydatas.image = finalImageList;
    await categorydatas.save();

    res.status(200).json({ message: "Category updated" });

    
  } catch (error) {
    console.log("Error updating category:", error);
    console.log("Error updating category.............");
    
    return res.status(500).json({ success: false, message: error.message });
  } 
};



// Subcategory controller
export const AddsubCategory = async (req, res) => {
  try {
    // const { id } = req.params;
    const subcategoryData = JSON.parse(req.body.subcategoryData);
    const images = req.file;

    let imageUrl;
    if (images) {
      let result = await cloudinary.uploader.upload(images.path, {
        resource_type: "image",
      });
      imageUrl = result.secure_url;
    }




    await SubCategory.create({ ...subcategoryData, image: imageUrl });
   
    res.json({ success: true, message: "Subcategory Added" });
  } catch (error) { 
    return res.status(500).json({ success: false, message: error.message });
  }
}

