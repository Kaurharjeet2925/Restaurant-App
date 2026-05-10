const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,
  },
  { timestamps: true }
);

// UNIQUE INSIDE SAME RESTAURANT ONLY
areaSchema.index(
  { restaurantId: 1, name: 1 },
  { unique: true }
);

module.exports = mongoose.model("Area", areaSchema);