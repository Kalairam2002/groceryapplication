import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name:{type:String,requried:true},
    image:{type:String,requried:true},

},{timestamps:true})

const Category = mongoose.model('Category',CategorySchema)
export default Category;


    // maincategory:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'MainCategory'
    // }

