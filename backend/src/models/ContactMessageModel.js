const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    city: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    isRead: { type: Boolean, default: false, index: true },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

contactMessageSchema.index({ createdAt: -1 });

// Keeps the existing `contactuses` collection.
module.exports = mongoose.model("ContactUs", contactMessageSchema);
