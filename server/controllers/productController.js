import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';
import cron from "node-cron";
import ExistingProduct from '../models/Existingproduct.js';
import ExpiredVariant from '../models/ExpiredVariant.js';

import fs from "fs";
import path from "path";

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const productData = JSON.parse(req.body.productData);
    const images = req.files;

    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    if (!productData.barcode) {
      return res.json({ success: false, message: "Barcode is required" });
    }

    await Product.create({
      name: productData.name,
      description: productData.description,
      image: imagesUrl,
      variants: productData.variants,
      variantdata: productData.variantdata || "",
      brand: productData.brand,
      category: productData.category,
      subcategory: productData.subcategory,
      barcode: productData.barcode,
      seller: sellerId,
      returnable: productData.returnable || false,
    });

    res.json({ success: true, message: "Product Added Successfully" });
  } catch (error) {
    console.log("addProduct error:", error.message);
    res.json({ success: false, message: error.message });
  }
};


// cron.schedule("0 0 * * *", async () => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

   
//     await Product.updateMany(
//       { "variants.expiryDate": { $lt: today } }, 
//       {
//         $pull: {
//           variants: {
//             expiryDate: { $lt: today, $ne: null }, 
//           },
//         },
//       }
//     );

   
//     await Product.deleteMany({ variants: { $size: 0 } });

//     console.log("✅ Expired variants cleaned up successfully");
//   } catch (error) {
//     console.log("❌ Cron error:", error.message);
//   }
// });

// export const existingProductAdd = async (req, res) => {
//   try {
//     const { existingProductId, variantdata,  } = req.body;

    
//     if (!existingProductId || !variantdata ) {
//       return res.json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

   
//     const newData = new ExistingProduct({
//       existingProductId,
//       variantdata,
//     });

    
//     await newData.save();

//     res.json({
//       success: true,
//       message: "Data added successfully",
//       data: newData,
//     });

//   } catch (error) {
//     console.log("existingProductAdd error:", error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

export const createExpiredVariant = async (req, res) => {
  try {
    const {
      productId,
      productName,
      sellerId,
      variantId,
      price,
      offerPrice,
      stock,
      expiryDate,
    } = req.body;

    // Basic validation
    if (!productId || !productName || !sellerId || !variantId) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const expiredVariant = new ExpiredVariant({
      productId,
      productName,
      sellerId,
      variantId,
      price,
      offerPrice,
      stock,
      expiryDate,
    });

    const savedData = await expiredVariant.save();

    return res.status(201).json({
      success: true,
      message: "Expired variant saved successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("[createExpiredVariant]", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    //  Step 1: Find all products that have at least one expired variant
    const productsWithExpired = await Product.find({
      variants: {
        $elemMatch: {
          expiryDate: { $lt: today, $ne: null },
        },
      },
    }).populate("seller", "_id");

    //  Step 2: Extract expired variants and prepare for saving
    const expiredDocs = [];

    for (const product of productsWithExpired) {
      const expiredVariants = product.variants.filter((v) => {
        if (!v.expiryDate) return false;
        const expiry = new Date(v.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        return expiry < today;
      });

      for (const variant of expiredVariants) {
        expiredDocs.push({
          productId: product._id,
          productName: product.name,
          sellerId: product.seller._id,
          variantId: variant._id,
          price: variant.price,
          offerPrice: variant.offerPrice,
          stock: variant.stock,
          expiryDate: variant.expiryDate,
          deletedAt: new Date(),
        });
      }
    }

    //  Step 3: Save all expired variants to ExpiredVariants collection
    if (expiredDocs.length > 0) {
      await ExpiredVariant.insertMany(expiredDocs);
      console.log(`✅ ${expiredDocs.length} expired variants archived`);
    }

    //  Step 4: Now delete expired variants from Product
    await Product.updateMany(
      { "variants.expiryDate": { $lt: today } },
      {
        $pull: {
          variants: {
            expiryDate: { $lt: today, $ne: null },
          },
        },
      }
    );

    //  Step 5: Delete products where variants array is now empty
    await Product.deleteMany({ variants: { $size: 0 } });

    console.log("✅ Expired variants cleaned up successfully");
  } catch (error) {
    console.log("❌ Cron error:", error.message);
  }
});


export const existingProductAdd = async (req, res) => {
  try {
    const { existingProductId, variantdata } = req.body;

    //  Step 1: Find the original product
    const product = await Product.findById(existingProductId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    //  Step 2: Save in ExistingProduct DB
    const existingProduct = await ExistingProduct.create({
      existingProductId,
      variantdata,
    });

    //  Step 3: Push new variants into Product's variants array
    product.variants.push(...variantdata);
    await product.save();

    res.json({
      success: true,
      message: "Variants added to product successfully",
      existingProduct,
    });
  } catch (error) {
    console.log("addExistingProduct error:", error.message);
    res.json({ success: false, message: error.message });
  }
};



// Get all products (for admin or customers): /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const expiredProducts = async (req, res) => {
  try {
    const ExpiredVariantdata = await ExpiredVariant.find({})
    res.json({ success: true, ExpiredVariantdata });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};



// Get product list for logged-in seller : /api/product/list/seller
export const productListSeller = async (req, res) => {
  try {
    const sellerId = req.sellerId;

    const products = await Product.find({ seller: sellerId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get single Product by ID : /api/product/list/id
export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get product by Barcode : GET /api/product/scan-barcode/:barcode
export const productByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ success: false, message: "Barcode is required" });
    }

    const product = await Product.findOne({ barcode });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product by barcode:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// Change product inStock : /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: 'Stock Updated' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Delete product by ID
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { productData } = req.body;

    if (!productData) {
      return res.status(400).json({ success: false, message: "Product data missing" });
    }

    const data = JSON.parse(productData);
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    product.name = data.name;
    product.description = data.description;
    product.price = data.price;
    product.offerPrice = data.offerPrice;
    product.unit = data.unit;
    product.stock = data.stock;
    product.brand = data.brand;
    product.category = data.category;
    product.subcategory = data.subcategory;
    product.barcode = data.barcode;

    if (req.files && req.files.length > 0) {
      product.image = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    }

    await product.save();

    res.json({ success: true, product, message: "Product updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Get all products for a specific seller
export const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    const products = await Product.find({ seller: sellerId })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    if (!products.length) {
      return res.status(200).json({
        success: true,
        message: "No products found for this seller",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching seller products",
    });
  }
};
