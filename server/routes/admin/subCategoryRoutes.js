import express from "express";
import multer from "multer";
import {
  addSubCategory,
  getAllSubCategories,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoriesByCategory,
  getsubdata
} from "../../controllers/admin/subCategoryController.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({});
const upload = multer({ storage });

router.post("/", upload.single("image"), addSubCategory);
router.get("/", getAllSubCategories);
router.put("/:id", upload.single("image"), updateSubCategory);
router.delete("/:id", deleteSubCategory);
router.get("/byCategory/:categoryId", getSubCategoriesByCategory);
router.get("/getsubdata/:id", getsubdata);

export default router;
