const Order = require("../models/order.model")
const Table = require("../models/table.model")

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
     kots: [
  {
    kotNo: 1,
    items: formattedItems,
    status: "pending", // ✅ ADD HERE
  },
],

    });

    await Table.findByIdAndUpdate(tableId, {
      status: "occupied",
      currentOrderId: order._id,
    });

    return res.status(201).json({
      message: "Order created",
      order,
      kotNo: 1, // ✅ FRONTEND USES THIS
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let subTotal = 0;
    const formattedItems = items.map(i => {
      const total = i.price * i.qty;
      subTotal += total;
      return { ...i, total };
    });

    // 🔥 NEXT KOT NUMBER (BACKEND CONTROL)
    const nextKotNo = (order.kots?.length || 0) + 1;

    order.items = formattedItems;
    order.subTotal = subTotal;
    order.totalAmount = subTotal;

    order.kots.push({
      kotNo: nextKotNo,
      items: formattedItems,
      status: "pending"
    });

    await order.save();

    return res.json({
      message: "KOT added",
      order,
      kotNo: nextKotNo, // ✅ FRONTEND USES THIS
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.sendToKitchen = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId || orderId === "null") {
      return res.status(400).json({ message: "Order ID required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔥 FIND FIRST PENDING KOT
    const kot = order.kots.find(k => k.status === "pending");

    if (!kot) {
      return res.status(400).json({
        message: "No pending KOT to send",
      });
    }

    // ✅ SEND ONLY THIS KOT
    kot.status = "preparing";

    // ✅ KEEP ORDER STATUS IN SYNC
    order.status = "sent_to_kitchen";

    await order.save();

    res.json({
      message: `KOT ${kot.kotNo} sent to kitchen`,
      kotNo: kot.kotNo,
      order,
    });
  } catch (error) {
    console.error("SEND TO KITCHEN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateKitchenStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // allowed kitchen statuses
    const allowedStatuses = ["preparing", "ready"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid kitchen status",
      });
    }

    // 1️⃣ Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Validate transitions
    if (
      (order.status === "sent_to_kitchen" && status === "preparing") ||
      (order.status === "preparing" && status === "ready")
    ) {
      order.status = status;
      await order.save();

      return res.json({
        message: "Kitchen status updated",
        order,
      });
    }

    // ❌ Invalid transition
    return res.status(400).json({
      message: `Cannot change status from ${order.status} to ${status}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateKitchenStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // allowed kitchen statuses
    const allowedStatuses = ["preparing", "ready"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid kitchen status",
      });
    }

    // 1️⃣ Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Validate transitions
    if (
      (order.status === "sent_to_kitchen" && status === "preparing") ||
      (order.status === "preparing" && status === "ready")
    ) {
      order.status = status;
      await order.save();

      return res.json({
        message: "Kitchen status updated",
        order,
      });
    }

    // ❌ Invalid transition
    return res.status(400).json({
      message: `Cannot change status from ${order.status} to ${status}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId)
      .populate({
        path: "tableId",
        select: "tableNumber capacity status",
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};