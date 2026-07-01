import { v2 as cloudinary } from 'cloudinary';
import Product from '../../models/Product.js';
import fs from "fs";
import path from "path";

// Get product list : /api/product/list 
export const productList = async (req, res) => {
    try {
        // Populate seller name
        const products = await Product.find({}).populate("seller", "name");
        res.json({ success: true, products });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

