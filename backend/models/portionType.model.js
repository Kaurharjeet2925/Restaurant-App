// models/PortionType.js
const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true },   // Half, Full, Small, Piece
  value: { type: Number, required: true }   // % or price
});

const portionTypeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["plate", "size", "quantity"],
      required: true,
      unique: true
    },
    pricingRule: {
      type: String,
      enum: ["percentage", "per_unit"],
      required: true
    },
    units: [unitSchema],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PortionType", portionTypeSchema);
