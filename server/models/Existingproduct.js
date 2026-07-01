import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  tax: { type: Number, default: 0 },       
  stock: { type: Number, default: 0 },    
  sizeLabel: { type: String, default: "" },
  expiryDate: { type: Date, default: null },
});

const existingProductSchema = new mongoose.Schema({ 
    existingProductId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    variantdata:[variantSchema],
    // expiryDate: { type: Date, required: true },

})

const ExistingProduct = mongoose.models.ExistingProduct || mongoose.model('ExistingProduct', existingProductSchema);

export default ExistingProduct;