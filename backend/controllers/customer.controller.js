const Customer = require("../models/customer.model")
const Order = require("../models/order.model");
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
    const data = await Order.aggregate([
      {
        $match: {
          paymentType: "credit",
          paymentStatus: { $ne: "paid" },
          "customer.phone": { $exists: true }
        }
      },
      {
        $group: {
          _id: "$customer.phone",
          name: { $first: "$customer.name" },
          phone: { $first: "$customer.phone" },
          totalDue: { $sum: "$dueAmount" }
        }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          phone: 1,
          totalDue: 1
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    console.error("Credit customers error:", err);
    res.status(500).json({ message: "Failed to fetch credit customers" });
  }
};
exports.getCreditLedger = async (req, res) => {
  try {
    const { phone } = req.params;

    const orders = await Order.find({
      paymentType: "credit",
      "customer.phone": phone
    }).sort({ createdAt: 1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No credit history found" });
    }

    const transactions = orders.map(o => ({
      orderId: o._id,
      date: o.createdAt,
      amount: o.totalAmount,
      dueAmount: o.dueAmount
    }));

    const totalDue = orders.reduce((s, o) => s + o.dueAmount, 0);

    res.json({
      customer: {
        name: orders[0].customer.name,
        phone
      },
      transactions,
      totalDue
    });
  } catch (err) {
    console.error("Ledger error:", err);
    res.status(500).json({ message: "Failed to fetch ledger" });
  }
};
exports.payCreditAmount = async (req, res) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount || amount <= 0) {
      return res.status(400).json({ message: "Phone & amount required" });
    }

    let remaining = amount;

    const orders = await Order.find({
      paymentType: "credit",
      paymentStatus: { $ne: "paid" },
      "customer.phone": phone
    }).sort({ createdAt: 1 });

    for (const order of orders) {
      if (remaining <= 0) break;

      if (order.dueAmount <= remaining) {
        remaining -= order.dueAmount;
        order.dueAmount = 0;
        order.paymentStatus = "paid";
      } else {
        order.dueAmount -= remaining;
        order.paymentStatus = "partial";
        remaining = 0;
      }

      await order.save();
    }

    res.json({ message: "Payment collected successfully" });
  } catch (err) {
    console.error("Credit payment error:", err);
    res.status(500).json({ message: "Payment failed" });
  }
};
