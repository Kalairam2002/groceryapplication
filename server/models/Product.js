import mongoose from "mongoose";

// A batch represents one delivery/lot of stock for a variant — its own
// quantity and its own expiry date, tracked separately so restocking never
// overwrites an existing batch's real expiry (the original bug this fixes).
const batchSchema = new mongoose.Schema({
  stock: { type: Number, required: true, default: 0 },
  expiryDate: { type: Date, default: null },
  addedDate: { type: Date, default: Date.now },
});

const variantSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  stockUnit: { type: String, default: "" },
  tax: { type: Number, default: 0 },

  // NEW: batch-tracked stock. Each variant can hold multiple batches, each
  // with its own stock count and expiry date.
  batches: { type: [batchSchema], default: [] },

  // LEGACY fields — kept so old code paths and old documents (written before
  // batches existed) still work. New writes should populate `batches`
  // instead; these two are treated as read-only derived values going
  // forward (see productController's virtual-style helpers).
  stock: { type: Number, default: 0 },
  expiryDate: { type: Date, default: null },

  sizeLabel: { type: String, default: "" },
});

// Convenience instance methods used by controllers/UI code — total stock is
// always the sum of batch stock; a variant with no batches falls back to
// its legacy `stock` field (pre-migration documents).
variantSchema.methods.getTotalStock = function () {
  if (this.batches && this.batches.length > 0) {
    return this.batches.reduce((sum, b) => sum + (b.stock || 0), 0);
  }
  return this.stock || 0;
};

// Earliest expiry among batches that still have stock — used for
// "expiring soon" / "expired" alerts. Falls back to the legacy single
// expiryDate for pre-migration documents.
variantSchema.methods.getEarliestExpiry = function () {
  if (this.batches && this.batches.length > 0) {
    const withStock = this.batches.filter((b) => (b.stock || 0) > 0 && b.expiryDate);
    if (withStock.length === 0) return null;
    return withStock.reduce(
      (earliest, b) => (!earliest || b.expiryDate < earliest ? b.expiryDate : earliest),
      null
    );
  }
  return this.expiryDate || null;
};

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: Array },
    image: { type: Array, required: true },
    inStock: { type: Boolean, default: true },

    //  Multiple variants stored here
    variants: [variantSchema],

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: { type: String, required: true },
    subcategory: { type: String },
    barcode: { type: String, unique: true },
    variantdata: { type: String, default: "" }, 
    // expiryDate: { type: Date, default: null }, 

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    returnable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;