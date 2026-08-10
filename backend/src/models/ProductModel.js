const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    User: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    // Author of the listing. Kept capitalised to match existing documents.
    User: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, trim: true, lowercase: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },

    countInStock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 5 },

    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, max: 100, default: 0 },
    gst: { type: Number, required: true, min: 0, max: 100, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },

    image: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String, required: true, maxlength: 5000 },

    reviews: { type: [reviewSchema], default: [] },
    numReviews: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual("inStock").get(function inStock() {
  return this.countInStock > 0;
});

productSchema.virtual("isLowStock").get(function isLowStock() {
  return this.countInStock > 0 && this.countInStock <= this.lowStockThreshold;
});

/**
 * Derives `totalPrice` from price, discount and GST so the stored value can
 * never drift from its inputs, and keeps the slug aligned with the name.
 */
productSchema.pre("validate", function deriveFields(next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = String(this.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  if (this.isModified("price") || this.isModified("discount") || this.isModified("gst")) {
    const discounted = this.price - (this.price * (this.discount || 0)) / 100;
    const withTax = discounted + (discounted * (this.gst || 0)) / 100;
    this.totalPrice = Math.round(withTax * 100) / 100;
  }
  next();
});

/** Recomputes the denormalised rating summary from the embedded reviews. */
productSchema.methods.recalculateRating = function recalculateRating() {
  const reviews = this.reviews || [];
  this.numReviews = reviews.length;
  this.rating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;
  return this;
};

// Free-text search across the fields the storefront and dashboard search on.
productSchema.index({ name: "text", description: "text", brand: "text", category: "text" });
// Catalogue browsing: filter by category, then sort by price or recency.
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
// Powers the dashboard's low-stock report.
productSchema.index({ countInStock: 1 });

module.exports = mongoose.model("Product", productSchema);
