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
      unique: true, // "Main Area", "Ground Floor"
      trim: true
    },

    description: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Area", areaSchema);
