const mongoose = require("mongoose");
const { slugify } = require("../utils/slug");

/**
 * A node in the category tree.
 *
 * Depth is unbounded, but each node caches its `ancestors` and materialised
 * `path`, so a subtree can be fetched with a single indexed query instead of
 * a recursive walk.
 */
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    description: { type: String, default: "", maxlength: 2000 },
    image: { type: String, default: "" },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    /** Every ancestor from the root down, nearest last. */
    ancestors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    /** Slug path, e.g. `clothing/mens/shirts`. Unique across the tree. */
    path: { type: String, required: true, lowercase: true, trim: true, unique: true },
    depth: { type: Number, default: 0, min: 0 },

    /** Manual ordering within a parent; ties break alphabetically. */
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },

    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      keywords: { type: [String], default: [] },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

categorySchema.pre("validate", function deriveSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

// Listing a parent's children in display order.
categorySchema.index({ parent: 1, position: 1, name: 1 });
// Fetching a whole subtree: every descendant lists its ancestors.
categorySchema.index({ ancestors: 1 });
categorySchema.index({ isActive: 1, isFeatured: -1 });

module.exports = mongoose.model("Category", categorySchema);
