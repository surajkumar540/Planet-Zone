const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES, ROLE_VALUES } = require("../constants/roles");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, trim: true, maxlength: 60, default: "" },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    phone: { type: String, trim: true, default: "" },
    avatar: { type: String, default: "" },

    // Never returned by default; must be requested explicitly with `.select('+password')`.
    password: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.CUSTOMER,
      index: true,
    },
    // Retained so existing clients that read `isAdmin` keep working; kept in
    // sync with `role` by the pre-save hook below.
    isAdmin: { type: Boolean, required: true, default: false },

    // Saved-for-later products. Stored on the user rather than in its own
    // collection because it is only ever read whole, for one user at a time.
    wishlist: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      default: [],
    },

    emailVerify: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("fullName").get(function getFullName() {
  return [this.firstName, this.lastName].filter(Boolean).join(" ");
});

// Keeps the legacy `isAdmin` flag and the canonical `role` from diverging,
// whichever of the two a caller happens to set.
userSchema.pre("save", function syncRole(next) {
  if (this.isModified("role")) {
    this.isAdmin = this.role === ROLES.ADMIN;
  } else if (this.isModified("isAdmin")) {
    this.role = this.isAdmin ? ROLES.ADMIN : this.role || ROLES.CUSTOMER;
  }
  next();
});

/**
 * Documents written before `role` existed hydrate with the schema default of
 * `customer`, which would strip access from an existing administrator. The
 * legacy flag wins whenever the two disagree on load.
 */
userSchema.post("init", function normalizeLegacyRole(doc) {
  if (doc.isAdmin === true && doc.role !== ROLES.ADMIN) {
    doc.role = ROLES.ADMIN;
  }
});

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Supports the dashboard's "new customers over time" and role filters.
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
