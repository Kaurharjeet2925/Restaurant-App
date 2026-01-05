const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // ✅ FOOD TYPE
    foodType: {
      type: String,
      enum: ["veg", "nonveg", "egg"],
      default: "veg",
    },

    // ✅ BASIC PRICE (still required for now)
    price: { type: Number, required: true },

    // ✅ PORTION TYPE (OPTIONAL)
    portionType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PortionType",
      default: null,
    },

    available: { type: Boolean, default: true },

    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", MenuItemSchema);
