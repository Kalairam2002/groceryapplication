import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    requiresExpiry: { type: Boolean, default: false },

},{timestamps:true})

const Category = mongoose.model('Category',CategorySchema)
export default Category;


    // maincategory:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'MainCategory'
    // }