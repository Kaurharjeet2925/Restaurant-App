const Order = require("../models/order.model");
const Table = require("../models/table.model");

/* ================= HELPERS ================= */
const deriveOrderStatus = (order) => {
  // Treat 'served' the same as 'ready' for order-level status calculation
  if (order.kots.every(k => k.status === "ready" || k.status === "served")) return "ready";
  if (order.kots.some(k => k.status === "preparing")) return "preparing";
  if (order.kots.some(k => k.status === "pending")) return "sent_to_kitchen";
  return "draft";
};


/* ================= CREATE ORDER (KOT-1) ================= */
exports.createOrder = async (req, res) => {
  try {
    const { tableId, items } = req.body;

    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({ message: "Table and items required" });
    }

    let subTotal = 0;
    const formattedItems = items.map(i => {
      const total = i.price * i.qty;
      subTotal += total;
      return { ...i, total };
    });

   const order = await Order.create({
  tableId,
  items: formattedItems,
  subTotal,
  totalAmount: subTotal,
  status: "sent_to_kitchen",
  kots: [
    {
      kotNo: 1,
      items: formattedItems,
      status: "pending",
      createdAt: new Date(),
    },
  ],
});


    await Table.findByIdAndUpdate(tableId, {
      status: "occupied",
      currentOrderId: order._id,
    });

    res.status(201).json({
      message: "Order created",
      order,
      kotNo: 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADD NEW KOT ================= */
exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body; // ONLY new items

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let addedTotal = 0;

    items.forEach(i => {
      if (!i.menuItemId || !i.variant) {
        throw new Error("menuItemId and variant are required");
      }

      const existing = order.items.find(item =>
        item.menuItemId.toString() === i.menuItemId.toString() &&
        item.variant === i.variant
      );

      const lineTotal = i.price * i.qty;

      if (existing) {
        existing.qty += i.qty;
        existing.total += lineTotal;
      } else {
        order.items.push({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          qty: i.qty,
          variant: i.variant,
          total: lineTotal,
          status: "pending",
        });
      }

      addedTotal += lineTotal;
    });

    order.subTotal = (order.subTotal || 0) + addedTotal;
    order.totalAmount = order.subTotal;

    const nextKotNo = order.kots.length + 1;

    // 🔥 KOT stores ONLY NEW ITEMS
    order.kots.push({
      kotNo: nextKotNo,
      items: items.map(i => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        variant: i.variant,
        total: i.price * i.qty,
        status: "pending",
      })),
      status: "pending",
    });

    await order.save();

    res.json({
      message: "KOT created",
      kotNo: nextKotNo,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};




/* ================= SEND KOT TO KITCHEN ================= */
exports.sendToKitchen = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { kotNo } = req.body;

    if (!orderId || !kotNo) {
      return res.status(400).json({
        message: "orderId and kotNo required",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const kot = order.kots.find(k => k.kotNo === Number(kotNo));
    if (!kot) {
      return res.status(404).json({ message: "KOT not found" });
    }

    if (kot.status !== "pending") {
      return res.status(400).json({
        message: `KOT ${kotNo} already sent`,
      });
    }

    kot.status = "preparing";
    order.status = deriveOrderStatus(order);

    await order.save();

    res.json({
      message: `KOT ${kotNo} sent to kitchen`,
      kot,
    });
  } catch (error) {
    console.error("sendToKitchen error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= UPDATE KOT STATUS (KITCHEN) ================= */
exports.updateKotStatus = async (req, res) => {
  const { orderId, kotNo } = req.params;
  const { status } = req.body;

  const order = await Order.findById(orderId).populate("tableId");
  if (!order) return res.status(404).json({ message: "Order not found" });

  const kot = order.kots.find(k => k.kotNo == kotNo);
  if (!kot) return res.status(404).json({ message: "KOT not found" });

  kot.status = status;

  // 🔥 CHECK IF ALL KOTs ARE SERVED
  const allServed = order.kots.every(
    k => k.status === "served"
  );

  if (allServed) {
    order.status = "completed";

    if (order.tableId) {
      order.tableId.status = "free";
      order.tableId.currentOrderId = null;
      await order.tableId.save();
    }
  } else {
    order.status = deriveOrderStatus(order);
  }

  await order.save();

  res.json({
    message: `KOT ${kotNo} marked ${status}`,
    orderStatus: order.status,
  });
};


/* ================= GET ORDER ================= */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate({
      path: "tableId",
      select: "tableNumber capacity status customerId area",
      populate: [
        { path: "customerId", select: "name phone" },
        { path: "area", select: "name" },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getKitchenKots = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: "tableId",
        select: "tableNumber status area customerId",
        populate: [
          { path: "customerId", select: "name phone" },
          { path: "area", select: "name" },
        ],
      })
      .lean();

    const kitchenKots = [];

    orders.forEach((order) => {
      const table = order.tableId;

      // ❌ REMOVE FROM KITCHEN IF ORDER COMPLETED OR TABLE FREE
      if (
        order.status === "completed" &&
        table?.status === "free"
      ) {
        return;
      }

      order.kots.forEach((kot) => {
        kitchenKots.push({
          _id: kot._id,
          orderId: order._id,

          kotNo: kot.kotNo,
          status: kot.status, // pending | preparing | ready | served
          items: kot.items,
          createdAt: kot.createdAt,

          orderStatus: order.status,
          tableNumber: table?.tableNumber,
          tableStatus: table?.status,
          areaName: table?.area?.name || "Area",
          customerName: table?.customerId?.name || "",
        });
      });
    });

    res.json(kitchenKots);
  } catch (error) {
    console.error("Kitchen KOT error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /orders/:orderId/kot/:kotNo/item/:index/prepared
exports.markItemPrepared = async (req, res) => {
  const { orderId, kotNo, index } = req.params;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const kot = order.kots.find(k => k.kotNo == kotNo);
  if (!kot) return res.status(404).json({ message: "KOT not found" });

  kot.items[index].status = "prepared";

  await order.save();

  res.json({
    message: "Item prepared",
    kot,
  });
};


exports.markKotReady = async (req, res) => {
  try {
    const { orderId, kotNo } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const kot = order.kots.find(k => k.kotNo == kotNo);
    if (!kot) return res.status(404).json({ message: "KOT not found" });

    const allPrepared = kot.items.every(i => i.status === "prepared");
    if (!allPrepared) {
      return res.status(400).json({ message: "All items must be prepared first" });
    }

    // persist item prepared status and change KOT to ready
    kot.items.forEach(i => { i.status = "prepared"; });
    kot.status = "ready";
    order.status = deriveOrderStatus(order);

    await order.save();

    res.json({
      message: "KOT marked ready",
      kot,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.generateBillAndPay = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { taxPercent = 0, servicePercent = 0, discount = 0, paymentMethod = "cash" } = req.body || {};

    const order = await Order.findById(orderId).populate({
      path: "tableId",
      select: "tableNumber status customerId area",
      populate: [
        { path: "customerId", select: "name phone" },
        { path: "area", select: "name" },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    // ❌ Prevent billing if no KOTs
    if (!order.kots || order.kots.length === 0) {
      return res.status(400).json({
        message: "Cannot generate bill: no KOTs created",
      });
    }

    /* ---------------- BILL CALCULATION ---------------- */
    const subTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const tax = Number(
      ((subTotal * Number(taxPercent || 0)) / 100).toFixed(2)
    );

    const service = Number(
      ((subTotal * Number(servicePercent || 0)) / 100).toFixed(2)
    );

    const disc = Number(Number(discount || 0).toFixed(2));

    const total = Number((subTotal + tax + service - disc).toFixed(2));

    /* ---------------- UPDATE ORDER ---------------- */
    order.subTotal = subTotal;
    order.tax = tax;
    order.taxPercent = Number(taxPercent || 0);
    order.servicePercent = Number(servicePercent || 0);
    order.serviceAmount = service;
    order.discount = disc;
    order.totalAmount = total;
    order.paymentMethod = paymentMethod;
    order.paymentStatus = "paid";
    order.status = "completed";

    await order.save();

    /* ---------------- FREE TABLE ---------------- */
    // if (order.tableId) {
    //   order.tableId.status = "free";
    //   order.tableId.currentOrderId = null;
    //   await order.tableId.save();
    // }

    return res.json({
      message: "Payment successful",
      order,
      billMeta: {
        tableNumber: order.tableId?.tableNumber,
        areaName: order.tableId?.area?.name,
        customerName: order.tableId?.customerId?.name,
        customerPhone: order.tableId?.customerId?.phone,
        tax: order.tax || 0,
        taxPercent: order.taxPercent || 0,
        servicePercent: order.servicePercent || 0,
        serviceAmount: order.serviceAmount || 0,
        discount: order.discount || 0,
        totalAmount: order.totalAmount || 0,
      },
    });
  } catch (error) {
    console.error("Billing error:", error);
    res.status(500).json({ message: "Billing failed" });
  }
};


exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate("tableId");
  if (!order) return res.status(404).json({ message: "Order not found" });

  // ❌ Block cancel if any KOT already started
  const blocked = order.kots.some(k =>
    ["preparing", "ready", "served"].includes(k.status)
  );

  if (blocked) {
    return res.status(400).json({
      message: "Cannot cancel. Kitchen already started."
    });
  }

  order.status = "cancelled";
  order.paymentStatus = "unpaid";

  await order.save();

  // Free table
  if (order.tableId) {
    order.tableId.status = "free";
    order.tableId.currentOrderId = null;
    await order.tableId.save();
  }

  res.json({ message: "Order cancelled", order });
};
exports.editKot = async (req, res) => {
  try {
    const { orderId, kotNo } = req.params;
    const { items } = req.body; // full updated items array

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    const kot = order.kots.find(k => k.kotNo === Number(kotNo));
    if (!kot) {
      return res.status(404).json({ message: "KOT not found" });
    }

    if (kot.status !== "pending") {
      return res.status(400).json({
        message: "Only pending KOT can be edited",
      });
    }

    /* ---------------- REMOVE OLD KOT ITEMS ---------------- */
    kot.items.forEach(oldItem => {
      const idx = order.items.findIndex(
        i => i.menuItemId.toString() === oldItem.menuItemId.toString()
      );

      if (idx !== -1) {
        order.items[idx].qty -= oldItem.qty;
        order.items[idx].total -= oldItem.total;

        if (order.items[idx].qty <= 0) {
          order.items.splice(idx, 1);
        }
      }
    });

    /* ---------------- ADD UPDATED ITEMS ---------------- */
    let addedTotal = 0;

    items.forEach(i => {
      const total = i.price * i.qty;
      addedTotal += total;

      const existing = order.items.find(
        it => it.menuItemId.toString() === i.menuItemId.toString()
      );

      if (existing) {
        existing.qty += i.qty;
        existing.total += total;
      } else {
        order.items.push({
          ...i,
          total,
          status: "pending",
        });
      }
    });

    kot.items = items.map(i => ({
      ...i,
      total: i.price * i.qty,
      status: "pending",
    }));

    order.subTotal = order.items.reduce(
      (s, i) => s + i.price * i.qty,
      0
    );
    order.totalAmount = order.subTotal;

    await order.save();

    res.json({
      message: `KOT ${kotNo} updated`,
      kot,
      order,
    });
  } catch (error) {
    console.error("Edit KOT error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
