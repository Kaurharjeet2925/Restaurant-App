const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema(
  {
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
