const Order = require("../models/order.model");
const Table = require("../models/table.model");

/* ================= HELPERS ================= */
const deriveOrderStatus = (order) => {
  if (order.kots.every(k => k.status === "ready")) return "ready";
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
    const { items } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let subTotal = order.subTotal;
    const formattedItems = items.map(i => {
      const total = i.price * i.qty;
      subTotal += total;
      return { ...i, total };
    });

    const nextKotNo = order.kots.length + 1;

    // 🔥 Keep full item history for billing
    order.items.push(...formattedItems);
    order.subTotal = subTotal;
    order.totalAmount = subTotal;

    order.kots.push({
      kotNo: nextKotNo,
      items: formattedItems,
      status: "pending",
      createdAt: new Date(),
    });

    order.status = deriveOrderStatus(order);
    await order.save();

    res.json({
      message: "New KOT added",
      order,
      kotNo: nextKotNo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
  try {
    const { orderId, kotNo } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "preparing", "ready"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid KOT status" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const kot = order.kots.find(k => k.kotNo === Number(kotNo));
    if (!kot) return res.status(404).json({ message: "KOT not found" });

    kot.status = status;
    order.status = deriveOrderStatus(order);
    await order.save();

    res.json({
      message: `KOT ${kotNo} marked as ${status}`,
      kot,
      orderStatus: order.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET ORDER ================= */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate({
      path: "tableId",
      select: "tableNumber capacity status",
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
    const orders = await Order.find({
      "kots.status": { $in: ["pending", "preparing", "ready"] }
    }).populate({
  path: "tableId",
  select: "tableNumber area",
  populate: {
    path: "area",
    select: "name"
  }
});


    // 🔥 Flatten KOTs
    const kitchenKots = [];

    orders.forEach(order => {
      order.kots.forEach(kot => {
        if (["pending", "preparing", "ready"].includes(kot.status)) {
          kitchenKots.push({
            orderId: order._id,
            tableNumber: order.tableId?.tableNumber,
            areaName: order.tableId?.area?.name || "Area",
            kotNo: kot.kotNo,
            status: kot.status,
            items: kot.items,
            createdAt: kot.createdAt,
          });
        }
      });
    });

    res.json(kitchenKots);
  } catch (error) {
    console.error(error);
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

// PUT /orders/:orderId/kot/:kotNo/ready
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

