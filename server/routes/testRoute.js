import express from "express";
import { getsubcategorydatas,getveriantdatas } from "../controllers/test.controller.js";
 

const router = express.Router();

router.get("/getsubcategorydata/:id",getsubcategorydatas);
router.get("/getveriantdata/:id",getveriantdatas);

export default router;
