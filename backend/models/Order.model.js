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
  enum: ["pending", "preparing", "prepared", "served"],
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

/* ================= ORDER COUNTER ================= */
const orderCounterSchema = new mongoose.Schema({
   restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
    index: true,
  },
  orderType: {
    type: String,
    enum: ["dine_in", "counter"],
    required: true,
  },
  counter: {
    type: Number,
    default: 0,
  },
});

const OrderCounter = mongoose.model("OrderCounter", orderCounterSchema);

/* ================= ORDER ================= */
const orderSchema = new mongoose.Schema(
  
 {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
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
      enum: ["pending", "processing", "served", "completed", "cancelled"],
      default: "pending",
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

/* 🔐 PRE-SAVE HOOK: GENERATE ORDER NUMBER */
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
     const counterDoc = await OrderCounter.findOneAndUpdate(
  {
    restaurantId: this.restaurantId,
    orderType: this.orderType,
  },
  { $inc: { counter: 1 } },
  { new: true, upsert: true }
);

      const counterValue = counterDoc.counter.toString().padStart(5, "0");
      this.orderNumber =
        this.orderType === "dine_in" ? `DINE${counterValue}` : `POS${counterValue}`;
    } catch (error) {
      if (typeof next === "function") {
        next(error);
      } else {
        throw error; 
      }
      return; 
    }
  }
  if (typeof next === "function") {
    next();
  }
});

module.exports = mongoose.model("Order", orderSchema);
