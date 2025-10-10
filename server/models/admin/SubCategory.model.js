import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name:{type:String,requried:true},
    image:{type:Array,requried:true},
    categoryid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    }

},{timestamps:true})

const SubCategory = mongoose.model('SubCategory',CategorySchema)
export default SubCategory;

