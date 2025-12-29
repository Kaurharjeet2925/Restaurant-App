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

const kotSchema = new mongoose.Schema(
  {
    kotNo: Number,
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ["pending", "preparing", "ready"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    // ✅ CURRENT BILL ITEMS
    items: [orderItemSchema],

    // ✅ KOT HISTORY (NEW)
    kots: [kotSchema],

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
