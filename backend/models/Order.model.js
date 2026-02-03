const mongoose = require("mongoose");

/* ================= ORDER ITEM ================= */
const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: String,
  price: Number,
  variant: String,
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

/* ================= KOT ================= */
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

/* ================= ORDER ================= */
const orderSchema = new mongoose.Schema(
  {
    /* 🔹 ORDER TYPE */
    orderType: {
      type: String,
      enum: ["dine_in", "counter"],
      required: true,
    },

    /* 🔹 TABLE (ONLY FOR DINE-IN) */
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: function () {
        return this.orderType === "dine_in";
      },
    },

    /* 🔹 CUSTOMER (DINE-IN OR CREDIT) */
    customer: {
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  name: String,
  phone: String,
},

    items: [orderItemSchema],
    kots: [kotSchema],

    /* 🔹 ORDER STATUS */
    status: {
      type: String,
      enum: ["draft", "sent_to_kitchen", "preparing", "ready", "completed"],
      default: "draft",
    },

    /* 🔹 PAYMENT MODE */
    paymentType: {
      type: String,
      enum: ["immediate", "credit"],
      default: "immediate",
    },

    /* 🔹 PAYMENT STATUS */
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card"],
    },

    /* 🔹 AMOUNTS */
    subTotal: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    servicePercent: { type: Number, default: 0 },
    serviceAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    /* 🔹 CREDIT */
    dueAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* 🔐 VALIDATION: CUSTOMER REQUIRED FOR DINE-IN OR CREDIT */
// orderSchema.pre("validate", function () {
//   if (
//     (this.orderType === "dine_in" || this.paymentType === "credit") &&
//     (!this.customer?.name || !this.customer?.phone)
//   ) {
//     throw new Error(
//       "Customer name and phone required for dine-in or credit order"
//     );
//   }
// });


module.exports = mongoose.model("Order", orderSchema);
