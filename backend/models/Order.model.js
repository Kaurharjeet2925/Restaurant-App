const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: String,
  price: Number,
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  total: Number,
});

const orderSchema = new mongoose.Schema(
  {
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    items: [orderItemSchema],

    status: {
      type: String,
      enum: ["draft", "sent_to_kitchen", "preparing", "ready", "completed"],
      default: "draft",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

    subTotal: Number,
    tax: Number,
    discount: Number,
    totalAmount: Number,

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
