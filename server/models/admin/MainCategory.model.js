import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name:{type:String,requried:true},
    image:{type:Array,requried:true},

},{timestamps:true})

const MainCategory = mongoose.model('MainCategory',CategorySchema)
export default MainCategory;

