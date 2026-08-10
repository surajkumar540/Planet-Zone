const mongoose = require("mongoose");
const { slugify } = require("../utils/slug");

const attributeValueSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 80 },
    value: { type: String, required: true, trim: true, maxlength: 80 },
    /** Optional swatch colour or image, used by colour-style pickers. */
    swatch: { type: String, default: "" },
    position: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * A reusable product property such as Colour, Size or Material.
 *
 * Attributes flagged `isVariantAttribute` may be combined to generate product
 * variants; the rest are descriptive only and appear in specification tables.
 */
const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    code: { type: String, required: true, lowercase: true, trim: true, unique: true },
    inputType: {
      type: String,
      enum: ["select", "multiselect", "text", "number", "boolean", "color"],
      default: "select",
    },
    values: { type: [attributeValueSchema], default: [] },

    isVariantAttribute: { type: Boolean, default: false, index: true },
    isFilterable: { type: Boolean, default: true },
    isRequired: { type: Boolean, default: false },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

attributeSchema.pre("validate", function deriveCode(next) {
  if (!this.code && this.name) this.code = slugify(this.name);
  next();
});

attributeSchema.index({ position: 1, name: 1 });

module.exports = mongoose.model("Attribute", attributeSchema);
