const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    image: { type: String }  
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", MenuItemSchema);
