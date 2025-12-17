const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    required: true
  },

  items: [
    {
      menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem"
      },
      name: String,
      price: Number,
      qty: Number
    }
  ],

  status: {
    type: String,
    enum: ["draft", "sent_to_kitchen", "preparing", "ready", "paid"],
    default: "draft"
  },

  totalAmount: Number,
  paymentMethod: String
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
