// models/PortionType.js
const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true },   // Half, Full, Small, Piece
  value: { type: Number, required: true }   // % or price
});

const portionTypeSchema = new mongoose.Schema(
{
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: ["plate", "size", "quantity"],
    required: true
  },

  pricingRule: {
    type: String,
    enum: ["percentage", "per_unit"],
    required: true
  },

  units: [unitSchema],

  isActive: {
    type: Boolean,
    default: true
  }

},
{ timestamps: true }
);

/* Unique per restaurant */
portionTypeSchema.index({ restaurantId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("PortionType", portionTypeSchema);