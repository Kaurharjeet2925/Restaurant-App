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

    const customer = await Customer.create({ name, phone, address });

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= READ ================= */
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Customer.findByIdAndUpdate(
      id,
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

    await Customer.findByIdAndDelete(id);
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

    const customer = await Customer.findOne({ phone }).lean();

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
    // Step 1: Get all unique credit customers from orders
    const customers = await Order.aggregate([
      {
        $match: {
          paymentType: "credit",
          paymentStatus: { $ne: "paid" },
          "customer.customerId": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$customer.customerId",
          name: { $first: "$customer.name" },
          phone: { $first: "$customer.phone" },
        },
      },
    ]);

    // Step 2: For each customer, get their latest ledger balance
    const results = await Promise.all(
      customers.map(async (c) => {
        const lastLedger = await CustomerLedger.findOne({ customerId: c._id }).sort({ createdAt: -1 });
        return {
          customerId: c._id,
          name: c.name,
          phone: c.phone,
          currentBalance: lastLedger ? lastLedger.balanceAfter : 0,
        };
      })
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch credit customers" });
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

    const ledger = await CustomerLedger.find({ customerId })
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
    const { customerId, amount, paymentMethod = "cash", isAdvance = false } = req.body;

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

    // 🔥 FETCH UNPAID CREDIT ORDERS (FIFO)
    const orders = await Order.find({
      paymentType: "credit",
      paymentStatus: { $ne: "paid" },
      "customer._id": customerId,
    }).sort({ createdAt: 1 });

    let paidAmount = 0;
    for (const order of orders) {
      if (remaining <= 0) break;

      if (order.dueAmount <= remaining) {
        remaining -= order.dueAmount;
        paidAmount += order.dueAmount;
        order.dueAmount = 0;
        order.paymentStatus = "paid";
      } else {
        paidAmount += remaining;
        order.dueAmount -= remaining;
        order.paymentStatus = "partial";
        remaining = 0;
      }

      order.paymentMethod = paymentMethod;
      await order.save();
    }

    // Get last balance
    const lastLedger = await CustomerLedger.findOne({ customerId }).sort({ createdAt: -1 });
    let lastBalance = lastLedger ? lastLedger.balanceAfter : 0;


    // Ledger entry for payment against due
    if (paidAmount > 0) {
      await CustomerLedger.create({
        customerId,
        type: "payment",
        credit: paidAmount,
        balanceAfter: lastBalance - paidAmount,
        note: `Credit payment (${paymentMethod})`,
      });
      lastBalance -= paidAmount;
    }

    // Ledger entry for advance
    if (isAdvance && remaining > 0) {
      await CustomerLedger.create({
        customerId,
        type: "payment",
        credit: remaining,
        balanceAfter: lastBalance - remaining,
        note: `Advance payment (${paymentMethod})`,
      });
      lastBalance -= remaining;
    }

    // Always record payment, even if no dues or advance
    if (paidAmount === 0 && (!isAdvance || remaining === 0)) {
      await CustomerLedger.create({
        customerId,
        type: "payment",
        credit: amount,
        balanceAfter: lastBalance - amount,
        note: `Payment received (${paymentMethod})`,
      });
      lastBalance -= amount;
    }

    return res.json({
      message: isAdvance && remaining > 0 ? "Advance received" : "Payment collected successfully",
      paidAmount,
      advance: isAdvance && remaining > 0 ? remaining : 0,
      remainingUnadjusted: 0,
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

    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

