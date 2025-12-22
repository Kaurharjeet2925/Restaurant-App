const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
    },

    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: true
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

    // 🔥 ADD THIS (ONLY THIS)
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true }
);

// unique table per area
tableSchema.index({ tableNumber: 1, area: 1 }, { unique: true });

module.exports = mongoose.model("Table", tableSchema);
