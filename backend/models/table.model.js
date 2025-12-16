const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["free", "occupied", "reserved"],
      default: "free",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);
