import express from 'express';
import { addProduct, changeStock, productById, productList, deleteProduct, productByBarcode, updateProduct, getSingleProduct, productListSeller, getProductsBySeller, existingProductAdd, expiredProducts, createExpiredVariant } from '../controllers/productController.js';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import Product from "../models/Product.js";

const productRouter = express.Router();

// ── POST Routes 
productRouter.post('/add', upload.array(['images']), authSeller, addProduct);
productRouter.post('/existingproductadd', existingProductAdd);
productRouter.post('/stock', authSeller, changeStock);
productRouter.post("/expired-variant", createExpiredVariant);

// ── GET Fixed Routes
productRouter.get('/list', productList);
productRouter.get('/id', productById);
productRouter.get('/expired', expiredProducts);

// ── Search Route
productRouter.get("/search", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.json({ success: false, message: "Search query is required" });
    }
    const products = await Product.find({
      name: { $regex: name, $options: "i" },
      inStock: true
    }).populate("seller", "name").lean();
    res.json({ success: true, products });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// ── Seller Routes
productRouter.get("/list/seller", authSeller, productListSeller);
productRouter.get("/seller/:sellerId", getProductsBySeller);

// ── Barcode Route 
productRouter.get('/scan-barcode/:barcode', productByBarcode);

// ── Dynamic ID Routes 
productRouter.get("/:id", getSingleProduct);
productRouter.put("/update/:id", upload.array("images", 4), updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;