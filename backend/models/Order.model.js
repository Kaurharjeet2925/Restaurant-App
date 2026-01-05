const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: String,
  price: Number,
  variant: {
    type: String,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  total: Number,
  status: {
    type: String,
    enum: ["pending", "prepared"],
    default: "pending",
  },
});

const kotSchema = new mongoose.Schema(
  {
    kotNo: Number,
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "served"],
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
      enum: ["draft", "sent_to_kitchen", "preparing", "ready", "served", "completed"],
      default: "draft",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

     subTotal: { type: Number, default: 0 },

    tax: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },

    serviceAmount: { type: Number, default: 0 },
    servicePercent: { type: Number, default: 0 },

    discount: { type: Number, default: 0 },

    totalAmount: { type: Number, default: 0 },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card"],
    },
 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
