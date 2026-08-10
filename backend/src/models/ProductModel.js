const mongoose = require("mongoose");
const { slugify } = require("../utils/slug");
const { deriveTotalPrice } = require("../utils/money");

const reviewSchema = new mongoose.Schema(
  {
    User: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/** A descriptive property that does not create variants, e.g. Material: Cotton. */
const productAttributeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

/**
 * A purchasable combination of variant attributes, e.g. Colour: Red, Size: M.
 *
 * Each variant carries its own price and stock; when a product has variants,
 * these values take precedence over the product-level ones.
 */
const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true, uppercase: true },
    /** Variant-defining selections, e.g. `{ color: "red", size: "m" }`. */
    options: { type: Map, of: String, required: true },

    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    gst: { type: Number, min: 0, max: 100, default: 0 },
    totalPrice: { type: Number, min: 0, default: 0 },

    countInStock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 5 },

    image: { type: String, default: "" },
    barcode: { type: String, default: "", trim: true },
    weightGrams: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    // Author of the listing. Kept capitalised to match existing documents.
    User: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, trim: true, lowercase: true, index: true },
    sku: { type: String, trim: true, uppercase: true, default: "" },
    brand: { type: String, required: true, trim: true, index: true },

    /**
     * Denormalised category name, retained so existing storefront filters and
     * order snapshots keep working. `categoryRef` is the authoritative link.
     */
    category: { type: String, required: true, trim: true, index: true },
    categoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },

    countInStock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 5 },

    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, max: 100, default: 0 },
    gst: { type: Number, required: true, min: 0, max: 100, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },

    image: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String, required: true, maxlength: 5000 },
    shortDescription: { type: String, default: "", maxlength: 500 },

    attributes: { type: [productAttributeSchema], default: [] },
    variants: { type: [variantSchema], default: [] },
    hasVariants: { type: Boolean, default: false, index: true },

    weightGrams: { type: Number, min: 0, default: 0 },
    dimensions: {
      length: { type: Number, min: 0, default: 0 },
      width: { type: Number, min: 0, default: 0 },
      height: { type: Number, min: 0, default: 0 },
    },

    reviews: { type: [reviewSchema], default: [] },
    numReviews: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },

    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },

    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/** Total sellable units, summed across variants when the product has them. */
productSchema.virtual("availableStock").get(function availableStock() {
  if (!this.hasVariants) return this.countInStock;
  return (this.variants || [])
    .filter((variant) => variant.isActive)
    .reduce((sum, variant) => sum + variant.countInStock, 0);
});

productSchema.virtual("inStock").get(function inStock() {
  return this.availableStock > 0;
});

productSchema.virtual("isLowStock").get(function isLowStock() {
  return this.availableStock > 0 && this.availableStock <= this.lowStockThreshold;
});

/** Cheapest and dearest variant price, for "from ₹x" display. */
productSchema.virtual("priceRange").get(function priceRange() {
  if (!this.hasVariants || !this.variants?.length) {
    return { min: this.totalPrice, max: this.totalPrice };
  }
  const prices = this.variants.filter((v) => v.isActive).map((v) => v.totalPrice);
  return prices.length
    ? { min: Math.min(...prices), max: Math.max(...prices) }
    : { min: this.totalPrice, max: this.totalPrice };
});

/**
 * Keeps derived fields consistent: the slug follows the name, and every
 * tax-inclusive price is recomputed from its inputs so a stored total can
 * never drift from the values it came from.
 */
productSchema.pre("validate", function deriveFields(next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }

  if (this.isModified("price") || this.isModified("discount") || this.isModified("gst")) {
    this.totalPrice = deriveTotalPrice(this.price, this.discount, this.gst);
  }

  this.hasVariants = (this.variants || []).length > 0;

  for (const variant of this.variants || []) {
    // Variants inherit the product's tax rate unless they set their own.
    if (variant.gst === undefined || variant.gst === null) variant.gst = this.gst;
    variant.totalPrice = deriveTotalPrice(variant.price, variant.discount, variant.gst);
  }

  // With variants present, product-level stock is the sum of its children so
  // stock queries and reports stay meaningful either way.
  if (this.hasVariants) {
    this.countInStock = this.variants
      .filter((variant) => variant.isActive)
      .reduce((sum, variant) => sum + variant.countInStock, 0);
  }

  next();
});

/** Recomputes the denormalised rating summary from the embedded reviews. */
productSchema.methods.recalculateRating = function recalculateRating() {
  const reviews = (this.reviews || []).filter((review) => review.isApproved !== false);
  this.numReviews = reviews.length;
  this.rating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;
  return this;
};

/** Finds a variant by its subdocument id or SKU. */
productSchema.methods.findVariant = function findVariant(identifier) {
  if (!identifier) return null;
  const key = String(identifier);
  return (
    (this.variants || []).find(
      (variant) => String(variant._id) === key || variant.sku === key.toUpperCase()
    ) || null
  );
};

// Free-text search across the fields the storefront and dashboard search on.
productSchema.index({ name: "text", description: "text", brand: "text", category: "text" });
// Catalogue browsing: filter by category, then sort by price or recency.
productSchema.index({ category: 1, price: 1 });
productSchema.index({ categoryRef: 1, isActive: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
// Powers the dashboard's low-stock report.
productSchema.index({ countInStock: 1 });
// Variant lookup by SKU during checkout.
productSchema.index({ "variants.sku": 1 });

module.exports = mongoose.model("Product", productSchema);
