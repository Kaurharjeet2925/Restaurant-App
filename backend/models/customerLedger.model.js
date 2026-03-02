// models/customerLedger.model.js
const mongoose = require("mongoose");

const CustomerLedgerSchema = new mongoose.Schema(
  {
    restaurantId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Restaurant",
  required: true,
  index: true,
},
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    // bill | payment
    type: {
      type: String,
      enum: ["bill", "payment"],
      required: true,
    },

    // Order reference (optional but useful)
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    debit: {
      type: Number,
      default: 0, // bill amount
    },

    credit: {
      type: Number,
      default: 0, // payment amount
    },

    // running balance AFTER this entry
    balanceAfter: {
      type: Number,
      required: true,
    },

    // optional notes (cash / upi / credit etc)
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CustomerLedger",
  CustomerLedgerSchema
);
