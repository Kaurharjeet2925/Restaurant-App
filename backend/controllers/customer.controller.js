const Customer = require("../models/customer.model")
const Order = require("../models/order.model");
const mongoose = require("mongoose");
const CustomerLedger = require("../models/customerLedger.model")
/* ================= CREATE ================= */
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name & phone required" });
    }

    const customer = await Customer.create({ name, phone, address , restaurantId: req.user.restaurantId });

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= READ ================= */
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ restaurantId: req.user.restaurantId }).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Customer.findOneAndUpdate(
      { _id: id, restaurantId: req.user.restaurantId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ================= */
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Customer.findOneAndDelete({
      _id: id,
      restaurantId: req.user.restaurantId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    const customer = await Customer.findOne({ phone, restaurantId: req.user.restaurantId }).lean();

    // IMPORTANT: return null if not found
    return res.status(200).json(customer || null);
  } catch (error) {
    console.error("Error fetching customer by phone:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/order.controller.js
exports.getCreditCustomers = async (req, res) => {
  try {

    const customers = await Customer.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(req.user.restaurantId)
        }
      },

      {
        $lookup: {
          from: "customerledgers",
          localField: "_id",
          foreignField: "customerId",
          as: "ledger"
        }
      },

      {
        $addFields: {
          lastLedger: { $arrayElemAt: ["$ledger", -1] }
        }
      },

      {
        $addFields: {
          currentBalance: {
            $ifNull: ["$lastLedger.balanceAfter", 0]
          }
        }
      },

      {
        $project: {
          customerId: "$_id",
          name: 1,
          phone: 1,
          currentBalance: 1
        }
      }

    ]);

    res.json(customers);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};


exports.getCustomerLedger = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ IMPORTANT: validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid customer id",
      });
    }

    const customerId = new mongoose.Types.ObjectId(id);

    const ledger = await CustomerLedger.find({ customerId, restaurantId: req.user.restaurantId })
      .sort({ createdAt: 1 });

    let totalDebit = 0;
    let totalCredit = 0;
    let currentBalance = 0;

    ledger.forEach((row, index) => {
      totalDebit += row.debit;
      totalCredit += row.credit;
      if (index === ledger.length - 1) {
        currentBalance = row.balanceAfter;
      }
    });

    return res.json({
      totalDebit,
      totalCredit,
      currentBalance,
      ledger,
    });
  } catch (error) {
    console.error("getCustomerLedger error:", error);
    return res.status(500).json({
      message: "Failed to fetch customer ledger",
    });
  }
};


exports.payCreditAmount = async (req, res) => {
  try {
    const {
      customerId,
      amount,
      paymentMethod = "cash",
      isAdvance = false,
    } = req.body;

    // ✅ VALIDATION
    if (
      !customerId ||
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !amount ||
      amount <= 0
    ) {
      return res.status(400).json({
        message: "customerId & valid amount required",
      });
    }

    let remaining = Number(amount);
    let paidAmount = 0;
    const updatedOrders = [];

    /* ================= FETCH UNPAID CREDIT ORDERS (FIFO) ================= */
   const orders = await Order.find({
  restaurantId: req.user.restaurantId,   // 🔥 REQUIRED
  paymentType: "credit",
  paymentStatus: { $ne: "paid" },
  "customer.customerId": customerId,
}).sort({ createdAt: 1 });

    /* ================= AUTO-ADJUST AGAINST ORDERS ================= */
  for (const order of orders) {

  if (remaining <= 0) break;

  const due = order.dueAmount || 0;
  const used = Math.min(due, remaining);

  order.dueAmount -= used;
  remaining -= used;
  paidAmount += used;

  order.paymentStatus =
    order.dueAmount === 0 ? "paid" : "partial";

  order.paymentMethod = paymentMethod;

  // 🔥 Fix for validation
  order.createdBy = order.createdBy || req.user.id;

  await order.save();

  updatedOrders.push({
    orderId: order._id,
    adjusted: used,
    dueAmount: order.dueAmount,
    paymentStatus: order.paymentStatus,
  });

}

    /* ================= LEDGER BALANCE ================= */
   const lastLedger = await CustomerLedger.findOne({
  customerId,
  restaurantId: req.user.restaurantId,   // 🔥 REQUIRED
}).sort({ createdAt: -1 });

    let runningBalance = lastLedger ? lastLedger.balanceAfter : 0;

    /* ================= LEDGER ENTRY : PAYMENT USED ================= */
    if (paidAmount > 0) {
      runningBalance -= paidAmount;

  await CustomerLedger.create({
  customerId,
  restaurantId: req.user.restaurantId,
  type: "payment",
  credit: remaining,
  balanceAfter: runningBalance,
  note: `Advance received (${paymentMethod})`,
});
    }

    /* ================= LEDGER ENTRY : ADVANCE (OPTIONAL) ================= */
    let advanceAmount = 0;
    if (isAdvance && remaining > 0) {
      advanceAmount = remaining;
      runningBalance -= remaining;

      await CustomerLedger.create({
        customerId,
        type: "payment",
        credit: remaining,
        balanceAfter: runningBalance,
        restaurantId: req.user.restaurantId,   // 🔥 REQUIRED
        note: `Advance received (${paymentMethod})`,
      });

      remaining = 0;
    }

    return res.json({
      message:
        paidAmount > 0
          ? "Payment collected and auto-adjusted"
          : "Advance received",
      paidAmount,
      advance: advanceAmount,
      finalBalance: runningBalance,
      updatedOrders,
    });
  } catch (err) {
    console.error("Credit payment error:", err);
    res.status(500).json({ message: "Payment failed" });
  }
};


exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Customer ID required" });

    const customer = await Customer.findOne({ _id: id, restaurantId: req.user.restaurantId });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

