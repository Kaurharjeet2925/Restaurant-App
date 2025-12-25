const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
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

    // ✅ ADD THIS
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);
