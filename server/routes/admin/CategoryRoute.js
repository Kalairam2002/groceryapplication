import express from 'express';
import {upload} from '../../configs/multer.js';
const app = express.Router();
import  {AddCategory,GetCategory,dldCategory,AddsubCategory,getcategorydata,updateCategory,mainCategory,GetMainCategory,dldMainCategory,getMaincategorydata,updateMainCategory,GetSubCategory,dldSubCategory,getSubcategorydata,updateSubCategory}  from '../../controllers/admin/Category.controller.js';

app.post('/addCategory',upload.single("image"),AddCategory);
app.post('/mainCategory',upload.array(['images']),mainCategory);
app.get('/getCategory',GetCategory);
app.get('/getmainCategory',GetMainCategory);
app.delete('/dldCategory/:id',dldCategory);
app.delete('/dldmainCategory/:id',dldMainCategory);
app.get('/GetCategoryData/:id',getcategorydata)
app.get('/GetmainCategoryData/:id',getMaincategorydata)
app.put('/updateCategory/:id', upload.array(['images']), updateCategory);
app.put('/updatemainCategory/:id', upload.array(['images']), updateMainCategory);

// subcategory routes
app.post('/addSubCategory',upload.single(['images']),AddsubCategory);
app.get('/getsubCategory',GetSubCategory);
app.delete('/dldsubCategory/:id',dldSubCategory);
app.get('/GetsubCategoryData/:id',getSubcategorydata)
app.put('/updatesubCategory/:id', upload.array(['images']), updateSubCategory);



export default app;
