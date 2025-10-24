import express from "express";
import multer from "multer";
import {
  addBrand,
  getBrands,
  updateBrand,
  deleteBrand,
} from "../../controllers/admin/BrandController.js";

const brandRouter = express.Router();

// Multer setup
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Routes
brandRouter.post("/", upload.single("image"), addBrand);
brandRouter.get("/", getBrands);
brandRouter.put("/:id", upload.single("image"), updateBrand);
brandRouter.delete("/:id", deleteBrand);

export default brandRouter;
