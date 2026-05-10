const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  value: {
    type: Number,
    required: true
  }
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
    required: true,
    trim: true,
    lowercase: true
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

portionTypeSchema.index(
  { restaurantId: 1, type: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "PortionType",
  portionTypeSchema
);