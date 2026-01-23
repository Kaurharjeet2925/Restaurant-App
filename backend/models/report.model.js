// models/order.model.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
  tenantId: {
  type: mongoose.Schema.Types.ObjectId,
  required: true,
  index: true,
},


    orderNo: String,

    tableNo: String,
    items: [
      {
        name: String,
        qty: Number,
        price: Number
      }
    ],
    grossAmount: Number,
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    netAmount: Number,
    paymentMode: {
      type: String,
      enum: ["cash", "upi", "card", "online"]
    },
    status: {
      type: String,
      enum: ["completed", "cancelled", "running"],
      default: "running"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
