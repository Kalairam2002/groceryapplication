import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name:{type:String,requried:true},
    image:{type:Array,requried:true},
    maincategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'MainCategory'
    }
},{timestamps:true})

const Category = mongoose.model('Category',CategorySchema)
export default Category;

