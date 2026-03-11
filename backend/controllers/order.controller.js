const Order = require("../models/order.model");
const Table = require("../models/table.model");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const CustomerLedger = require("../models/customerLedger.model");
const { createNotification } = require("./notification.controller");
const logActivity = require("../utils/logActivity");
const autoAdjustOrders = require("../utils/autoAdjustOrders");
//const CustomerLedger = require("../models/customerLedger.model");
/* ================= HELPERS ================= */
const deriveOrderStatus = (order) => {
  const allItems = order.kots.flatMap(k => k.items);

  if (!allItems.length) return "pending";

  if (order.paymentStatus === "paid") return "completed";

  // If all items served
  if (allItems.every(i => i.status === "served")) {
    return "served";
  }

  // If kitchen started anything
  if (
    allItems.some(i =>
      ["preparing", "prepared"].includes(i.status)
    )
  ) {
    return "processing";
  }

  return "pending";
};
exports.createOrder = async (req, res) => {
  // Only allow superadmin, admin, or waiter roles to create orders
  const allowedRoles = ["owner", "admin", "waiter"];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to create orders." });
  }
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
  orderType: "dine_in",
  restaurantId: req.user.restaurantId,
  createdBy: req.user._id,
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
  await logActivity({
  module: "order",
  action: "CREATE_ORDER",
  description: "Order created",
  user: req.user,
  referenceId: order._id,
  restaurantId: req.user.restaurantId,
});

    // Format orderId as #ORDxxxx
    // Always pad orderId to 4 digits for #ORDxxxx
    const hex = String(order._id).slice(-4).toUpperCase();
    const padded = hex.padStart(4, '0');
    const orderDisplayId = `#ORD${padded}`;
    // 🔔 Create notification for new order (kitchen, admin, superAdmin)
 const performerId = req.user._id;
const performerRole = req.user.role;

const message = `New order ${order.orderNumber} created for Table ${tableId}`;

const data = {
  orderId: order._id,
  orderNumber: order.orderNumber,
  tableId
};

/* ===== Kitchen always receives ===== */

await createNotification({
  io: req.io,
  message,
  activityType: "order",
  data,
  createdBy: performerId,
  targetRole: "kitchen",
  restaurantId: req.user.restaurantId
});
await createNotification({
  io: req.io,
  message: `You created Order ${order.orderNumber}`,
  activityType: "order",
  data,
  createdBy: performerId,
  targetUser: performerId,
  restaurantId: req.user.restaurantId
});
if (performerRole !== "admin") {
  await createNotification({
    io: req.io,
    message,
    activityType: "order",
    data,
    createdBy: performerId,
    targetRole: "admin",
    restaurantId: req.user.restaurantId
  });
}

/* ===== Owner ===== */

await createNotification({
  io: req.io,
  message,
  activityType: "order",
  data,
  createdBy: performerId,
  targetRole: "owner",
  restaurantId: req.user.restaurantId
});
    // 📜 ACTIVITY LOG
    await require("../utils/logActivity")({
      module: "order",
      action: "CREATE",
      description: `Order ${order.orderNumber} created for Table ${tableId}`,
      user: req.user,
      referenceId: order._id,
      restaurantId: req.user.restaurantId,
      meta: { items: formattedItems, orderNumber: order.orderNumber }
    });

    await Table.findOneAndUpdate(
      { _id: tableId, restaurantId: req.user.restaurantId },
      {
        status: "occupied",
        currentOrderId: order._id,
      }
    );

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
  // Only allow owner, admin, or waiter roles to update orders
  const allowedRoles = ["owner", "admin", "waiter"];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to update orders." });
  }
  try {
    const { orderId } = req.params;
    const { items } = req.body; // ONLY new items

    const order = await Order.findOne({ _id: orderId, restaurantId: req.user.restaurantId } );
if (!order.orderType) {
  order.orderType = "dine_in"; // 🔒 safety fallback
}
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
await logActivity({
  module: "kitchen",
  action: "ADD_KOT",
  description: `KOT ${nextKotNo} added`,
  user: req.user,
  referenceId: order._id,
  restaurantId: req.user.restaurantId,
  meta: { kotNo: nextKotNo },
});

    // 🔔 Create notification for new KOT (kitchen, admin, superAdmin)
    const tableInfo = order.tableId?.tableNumber ? `Table ${order.tableId.tableNumber}` : order.orderNumber;
    const userName = req.user?.name || req.user?.firstName || 'Unknown';
    const kotMsg = `New KOT ${nextKotNo} created for ${tableInfo} (${order.orderNumber})`;
    await createNotification({
      io: req.io,
      message: kotMsg,
      activityType: "kitchen",
      data: { orderId, orderNumber: order.orderNumber, kotNo: nextKotNo },
      createdBy: req.user?._id,
      targetRole: "kitchen",
      restaurantId: req.user.restaurantId,
    });
    await createNotification({
      io: req.io,
      message: kotMsg,
      activityType: "kitchen",
      data: { orderId, orderNumber: order.orderNumber, kotNo: nextKotNo },
      createdBy: req.user?._id,
      targetRole: "admin",
      restaurantId: req.user.restaurantId,
    });
    await createNotification({
      io: req.io,
      message: kotMsg,
      activityType: "kitchen",
      data: { orderId, orderNumber: order.orderNumber, kotNo: nextKotNo },
      createdBy: req.user?._id,
      targetRole: "owner",
      restaurantId: req.user.restaurantId,
    });

    // 📜 ACTIVITY LOG (only one entry)
    await require("../utils/logActivity")({
      module: "order",
      action: "ADD_KOT",
      description: `KOT ${nextKotNo} created for ${tableInfo} (${order.orderNumber}) by ${userName}`,
      user: req.user,
      referenceId: order._id,
      restaurantId: req.user.restaurantId,
      meta: { items, orderNumber: order.orderNumber }
    });

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
      // Only allow owner, admin, or waiter roles to send to kitchen
      const allowedRoles = ["owner", "admin", "waiter"];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "You do not have permission to send orders to kitchen." });
      }
  try {
    const { orderId } = req.params;
    const { kotNo } = req.body;

    if (!orderId || !kotNo) {
      return res.status(400).json({
        message: "orderId and kotNo required",
      });
    }

    const order = await Order.findOne({ _id: orderId, restaurantId: req.user.restaurantId });
if (!order.orderType) {
  order.orderType = "dine_in"; // 🔒 safety fallback
}
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

    // 🔔 Send notification to admin and superAdmin when KOT moves to preparing
    const io = req.io;
    const userId = req.user?._id;
    const orderIdStr = order._id.toString();
    const OrderNumber = order.orderNumber ? `(${order.orderNumber})` : "";
    const message = `KOT ${kotNo} for Order  ${OrderNumber} is now preparing`;
    const activityType = "kitchen";
    const data = { orderId: orderIdStr, kotNo, status: "preparing" };

    if (io) {
      await require("./notification.controller").createNotification({
        io,
        message,
        activityType,
        data,
        createdBy: userId,
        targetRole: "admin",
        restaurantId: req.user.restaurantId
      });
      await require("./notification.controller").createNotification({
        io,
        message,
        activityType,
        data,
        createdBy: userId,
        targetRole: "owner" ,
        restaurantId: req.user.restaurantId
      });
    }

    // 📜 ACTIVITY LOG
    await require("../utils/logActivity")({
      module: "order",
      action: "SEND_TO_KITCHEN",
      description: `KOT ${kotNo} for Order ${order.orderNumber} moved to preparing`,
      user: req.user,
      referenceId: order._id,
      restaurantId: req.user.restaurantId,
      meta: { kotNo }
    });

    res.json({
      message: `KOT ${kotNo} sent to kitchen`,
      kot,
    });
  } catch (error) {
    console.error("sendToKitchen error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateKotStatus = async (req, res) => {
  const allowedRoles = ["owner", "admin", "kitchen"];

  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Permission denied" });
  }

  const { orderId, kotNo } = req.params;
  let { status } = req.body;
  status = status?.toLowerCase();

  const validStatus = ["pending", "preparing", "ready", "served"];

  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid KOT status" });
  }

  try {

    const order = await Order.findOne({
      _id: orderId,
      restaurantId: req.user.restaurantId
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const kot = order.kots.find(k => k.kotNo == kotNo);

    if (!kot) return res.status(404).json({ message: "KOT not found" });

    if (kot.status === status) {
      return res.status(400).json({
        message: `KOT ${kotNo} is already ${status}`
      });
    }

    /* ---------- UPDATE STATUS ---------- */

    kot.status = status;
    order.status = deriveOrderStatus(order);

    await order.save();

    /* ---------- VARIABLES ---------- */

    const io = req.io;
    const performerId = req.user._id;
    const performerRole = req.user.role;
    const creatorId = order.createdBy; // waiter who created order

    const message = `KOT ${kotNo} for Order ${order.orderNumber} is ${status}`;

    const data = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      kotNo,
      status
    };

    /* ---------- PERFORMER CONFIRMATION ---------- */

    await createNotification({
      io,
      message: `You updated KOT ${kotNo} to ${status}`,
      activityType: "kitchen",
      data,
      createdBy: performerId,
      targetUser: performerId,
      restaurantId: req.user.restaurantId
    });

    /* ---------- ORDER CREATOR (WAITER) ---------- */

    if (
      creatorId &&
      creatorId.toString() !== performerId.toString()
    ) {
      await createNotification({
        io,
        message,
        activityType: "kitchen",
        data,
        createdBy: performerId,
        targetUser: creatorId,
        restaurantId: req.user.restaurantId
      });
    }

    /* ---------- ADMIN ---------- */

    if (performerRole !== "admin") {
      await createNotification({
        io,
        message,
        activityType: "kitchen",
        data,
        createdBy: performerId,
        targetRole: "admin",
        restaurantId: req.user.restaurantId
      });
    }

    /* ---------- OWNER ---------- */

   await createNotification({
  io: req.io,
  title: "Restaurant Update",
  message,
  activityType: "order",
  data,
  createdBy: performerId,
  targetRole: "owner",
  restaurantId: req.user.restaurantId
});

    /* ---------- ACTIVITY LOG ---------- */

    await logActivity({
      module: "order",
      action: "UPDATE_KOT_STATUS",
      description: `KOT ${kotNo} for Order ${order.orderNumber} marked ${status}`,
      user: req.user,
      referenceId: order._id,
      restaurantId: req.user.restaurantId,
      meta: { kotNo, status }
    });

    /* ---------- REALTIME TOAST ---------- */

    if (io) {
      io.to(`restaurant:${req.user.restaurantId}:user:${performerId}`)
        .emit("toast", {
          type: "success",
          message: `KOT ${kotNo} updated to ${status}`
        });
    }

    res.json({
      message: `KOT ${kotNo} marked ${status}`,
      orderStatus: order.status
    });

  } catch (err) {
    console.error("Update KOT status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= GET ORDER ================= */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, restaurantId: req.user.restaurantId }).populate({
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
    const orders = await Order.find({restaurantId: req.user.restaurantId,
       "kots.status": { $in: ["pending", "preparing", "ready"] },
       orderType: "dine_in" })
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
  if (order.orderType !== "dine_in") return; 
  if (order.status === "completed") return;
      const table = order.tableId;

      order.kots.forEach((kot) => {
        kitchenKots.push({
          _id: kot._id,
          orderId: order._id,
         orderNumber: order.orderNumber,
         
          kotNo: kot.kotNo,
          status: kot.status,
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



exports.markItemPrepared = async (req, res) => {

  const { orderId, kotNo, index } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    restaurantId: req.user.restaurantId
  });

  if (!order) return res.status(404).json({ message: "Order not found" });

  const kot = order.kots.find(k => k.kotNo == kotNo);
  if (!kot) return res.status(404).json({ message: "KOT not found" });

  if (!kot.items[index]) {
    return res.status(404).json({ message: "Item not found" });
  }

  /* UPDATE ITEM STATUS */

  kot.items[index].status = "prepared";

  if (kot.items.some(i => i.status === "prepared")) {
    kot.status = "preparing";
  }

  order.status = deriveOrderStatus(order);

  await order.save();

  const performerId = req.user._id;
  const performerRole = req.user.role;
  const creatorId = order.createdBy;

  const message = `Item ${kot.items[index].name} prepared in KOT ${kotNo} for Order ${order.orderNumber}`;

  const data = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    kotNo,
    status: "prepared"
  };

await createNotification({
  io: req.io,
  title: "Item Prepared",
  message: `You marked item prepared in KOT ${kotNo}`,
  activityType: "kitchen",
  data,
  createdBy: performerId,
  targetUser: performerId,
  restaurantId: req.user.restaurantId
});

  // Ensure performerId and creatorId are not the same before sending notifications
  if (creatorId && creatorId.toString() !== performerId.toString()) {
    await createNotification({
      io: req.io,
      title: "Item Prepared",
      message,
      activityType: "kitchen",
      data,
      createdBy: performerId,
      targetUser: creatorId,
      restaurantId: req.user.restaurantId
    });
  }

  // Consolidate admin and owner notifications to avoid redundancy
  const rolesToNotify = ["admin", "owner"];
  for (const role of rolesToNotify) {
    await createNotification({
      io: req.io,
      title: "Item Prepared",
      message,
      activityType: "kitchen",
      data,
      createdBy: performerId,
      targetRole: role,
      restaurantId: req.user.restaurantId
    });
  }

  res.json({
    message: "Item marked prepared",
    kot
  });

};

exports.markKotReady = async (req, res) => {

  const { orderId, kotNo } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    restaurantId: req.user.restaurantId
  });

  if (!order) return res.status(404).json({ message: "Order not found" });

  const kot = order.kots.find(k => k.kotNo == kotNo);
  if (!kot) return res.status(404).json({ message: "KOT not found" });

  const allPrepared = kot.items.every(i => i.status === "prepared");

  if (!allPrepared) {
    return res.status(400).json({
      message: "All items must be prepared first",
    });
  }

  /* UPDATE STATUS */

  kot.status = "ready";
  order.status = deriveOrderStatus(order);

  await order.save();

  const performerId = req.user._id;
  const performerRole = req.user.role;
  const creatorId = order.createdBy;

  const message = `KOT ${kotNo} for Order ${order.orderNumber} is ready`;

  const data = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    kotNo,
    status: "ready"
  };

  /* PERFORMER CONFIRMATION */

  await createNotification({
    io: req.io,
    title: "KOT Ready",
    message: `You marked KOT ${kotNo} ready`,
    activityType: "kitchen",
    data,
    createdBy: performerId,
    targetUser: performerId,
    restaurantId: req.user.restaurantId
  });

  /* WAITER (ORDER CREATOR) */

  if (creatorId && creatorId.toString() !== performerId.toString()) {
    await createNotification({
      io: req.io,
      title: "KOT Ready",
      message,
      activityType: "kitchen",
      data,
      createdBy: performerId,
      targetUser: creatorId,
      restaurantId: req.user.restaurantId
    });
  }

  /* ADMIN */

  if (performerRole !== "admin") {
    await createNotification({
      io: req.io,
      title: "KOT Ready",
      message,
      activityType: "kitchen",
      data,
      createdBy: performerId,
      targetRole: "admin",
      restaurantId: req.user.restaurantId
    });
  }

  /* OWNER (ALWAYS) */

  await createNotification({
    io: req.io,
    title: "KOT Ready",
    message,
    activityType: "kitchen",
    data,
    createdBy: performerId,
    targetRole: "owner",
    restaurantId: req.user.restaurantId
  });

  res.json({
    message: "KOT marked as ready",
    data
  });

};

exports.generateBillAndPay = async (req, res) => {
    // Only allow owner and admin roles to generate bill and payment
    const allowedRoles = ["owner", "admin"];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform payment." });
    }
  try {
    const { orderId } = req.params;
    const { taxPercent = 0, servicePercent = 0, discount = 0, paymentMethod = "cash" } = req.body || {};

    const order = await Order.findOne({ _id: orderId, restaurantId: req.user.restaurantId }).populate({
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
    await createNotification({
  io: req.io,
  message: `Payment completed for Order ${order.orderNumber}`,
  activityType: "payment",
  data: { orderId: order._id, totalAmount: order.totalAmount, orderNumber: order.orderNumber },
  createdBy: req.user?._id,
  targetRole: "admin",
  restaurantId: req.user.restaurantId
});

await createNotification({
  io: req.io,
  message: `Payment completed for Order ${order.orderNumber}`,
  activityType: "payment",
  data: { orderId: order._id, totalAmount: order.totalAmount, orderNumber: order.orderNumber },
  createdBy: req.user?._id,
  targetRole: "owner",
  restaurantId: req.user.restaurantId
});

    /* ---------------- FREE TABLE ---------------- */
    if (order.tableId) {
      order.tableId.status = "free";
      order.tableId.currentOrderId = null;
      await order.tableId.save();
    }

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

  const order = await Order.findOne({ _id: orderId, restaurantId: req.user.restaurantId } ).populate("tableId");
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
await createNotification({
  io: req.io,
  message: `Order ${orderId} cancelled`,
  activityType: "order",
  data: { orderId },
  createdBy: req.user?._id,
  targetRole: "admin",
  restaurantId: req.user.restaurantId
});
await createNotification({
  io: req.io,
  message: `Order ${orderId} cancelled`,
  activityType: "order",
  data: { orderId },
  createdBy: req.user?._id,
  targetRole: "owner",
  restaurantId: req.user.restaurantId
});
await createNotification({
  io: req.io,
  message: `Order ${orderId} cancelled`,
  activityType: "order",
  data: { orderId },
  createdBy: req.user?._id,
  targetRole: "kitchen",
  restaurantId: req.user.restaurantId
});

  res.json({ message: "Order cancelled", order });
};
exports.editKot = async (req, res) => {
  try {
    const { orderId, kotNo } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Items required to update KOT"
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      restaurantId: req.user.restaurantId
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Order already paid"
      });
    }

    const kot = order.kots.find(
      k => k.kotNo === Number(kotNo)
    );

    if (!kot) {
      return res.status(404).json({
        message: "KOT not found"
      });
    }

    if (kot.status !== "pending") {
      return res.status(400).json({
        message: "Only pending KOT can be edited"
      });
    }

    /* ================= REMOVE OLD ITEMS ================= */

    kot.items.forEach(oldItem => {

      const idx = order.items.findIndex(i =>
        i.menuItemId.toString() === oldItem.menuItemId.toString() &&
        (i.variant || "") === (oldItem.variant || "")
      );

      if (idx !== -1) {

        order.items[idx].qty -= oldItem.qty;
        order.items[idx].total -= oldItem.total;

        if (order.items[idx].qty <= 0) {
          order.items.splice(idx, 1);
        }

      }

    });

    /* ================= ADD NEW ITEMS ================= */

    const updatedKotItems = items.map(i => {

      const total = i.price * i.qty;

      const existing = order.items.find(it =>
        it.menuItemId.toString() === i.menuItemId.toString() &&
        (it.variant || "") === (i.variant || "")
      );

      if (existing) {
        existing.qty += i.qty;
        existing.total += total;
      } else {
        order.items.push({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          qty: i.qty,
          variant: i.variant || null,
          total,
          status: "pending"
        });
      }

      return {
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        variant: i.variant || null,
        total,
        status: "pending"
      };

    });

    kot.items = updatedKotItems;

    /* ================= RECALCULATE ORDER ================= */

    order.subTotal = order.items.reduce(
      (sum, i) => sum + i.total,
      0
    );

    order.totalAmount = order.subTotal;

    await order.save();

    res.json({
      message: `KOT ${kotNo} updated successfully`,
      kot,
      order
    });

  } catch (error) {
    console.error("Edit KOT error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

/* ================= COUNTER ORDER + PAY ================= */
exports.createCounterOrderAndPay = async (req, res) => {
    // Only allow owner and admin roles to perform counter payment
    const allowedRoles = ["owner", "admin", "waiter"];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform payment." });
    }
  try {
    const { items, paymentMethod = "cash" } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    let subTotal = 0;

    const formattedItems = items.map(i => {
      const total = i.price * i.qty;
      subTotal += total;
      return {
        ...i,
        total,
        status: "prepared",
      };
    });

    const order = await Order.create({
      orderType: "counter",     
      createdBy: req.user._id,
      tableId: null,            // ✅ FIX 2

      items: formattedItems,
      subTotal,
      totalAmount: subTotal,

      paymentMethod,
      paymentStatus: "paid",
      status: "completed",
      restaurantId: req.user.restaurantId,
      kots: [
        {
          kotNo: 1,
          items: formattedItems,
          status: "ready",
        },
      ],
    });

    // Use the generated orderNumber for notifications
    const orderMsg = `New counter order ${order.orderNumber} created.`;
    await createNotification({
      io: req.io,
      message: orderMsg,
      activityType: "order",
      data: { orderId: order._id, orderNumber: order.orderNumber },
      createdBy: req.user?._id,
      targetRole: "kitchen",
      restaurantId: req.user.restaurantId
    });
    // Only send to admin if not superAdmin
    if (req.user?.role !== "owner") {
      await createNotification({
        io: req.io,
        message: orderMsg,
        activityType: "order",
        data: { orderId: order._id, orderNumber: order.orderNumber },
        createdBy: req.user?._id,
        targetRole: "admin",
        restaurantId: req.user.restaurantId
      });
    }
    await createNotification({
      io: req.io,
      message: orderMsg,
      activityType: "order",
      data: { orderId: order._id, orderNumber: order.orderNumber },
      createdBy: req.user?._id,
      targetRole: "owner",
      restaurantId: req.user.restaurantId
    });

    // 📜 ACTIVITY LOG
    await logActivity({
      module: "order",
      action: "COUNTER_ORDER_PAID",
      description: `Counter order ${order.orderNumber} paid`,
      user: req.user,
      referenceId: order._id,
      restaurantId: req.user.restaurantId,
      meta: { orderDisplayId: order.orderNumber, totalAmount: order.totalAmount }
    });
    return res.status(201).json({
      message: "Counter order paid",
      order,
    });
  } catch (error) {
    console.error("Counter order error:", error);
    res.status(500).json({ message: "Counter order failed" });
  }
};


exports.markDineInAsCredit = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, restaurantId: req.user.restaurantId }).populate("tableId");
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentType = "credit";
    order.paymentStatus = "unpaid";
    order.dueAmount = order.totalAmount;
    order.status = "completed";

    await order.save();

    // ✅ FREE TABLE
    if (order.tableId) {
      order.tableId.status = "free";
      order.tableId.currentOrderId = null;
      await order.tableId.save();
    }

    // 🔔 Create notification for marking order as credit
    await createNotification({
      io: req.io,
      message: `Order ${order.orderNumber} has been marked as credit.`,
      activityType: "order",
      data: { orderId: order._id, orderNumber: order.orderNumber },
      createdBy: req.user?._id,
      targetRole: "admin",
      restaurantId: req.user.restaurantId
    });

    await createNotification({
      io: req.io,
      message: `Order ${order.orderNumber} has been marked as credit.`,
      activityType: "order",
      data: { orderId: order._id, orderNumber: order.orderNumber },
      createdBy: req.user?._id,
      targetRole: "owner",
      restaurantId: req.user.restaurantId
    });

    // 📜 Log activity for marking order as credit
    await logActivity({
      module: "order",
      action: "MARK_AS_CREDIT",
      description: `Order ${order.orderNumber} marked as credit by ${req.user?.name || "Unknown"}`,
      user: req.user,
      referenceId: order._id,
      restaurantId: req.user.restaurantId,
      meta: { orderNumber: order.orderNumber },
    });

    res.json({
      message: "Order marked as credit",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Credit failed" });
  }
};

exports.collectCreditPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod = "cash" } = req.body;

    if (!orderId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount required" });
    }

    const order = await Order.findOne({ _id: orderId, restaurantId: req.user.restaurantId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already fully paid" });
    }

    if (amount > order.dueAmount) {
      return res.status(400).json({
        message: `Amount exceeds due ₹${order.dueAmount}`,
      });
    }

    order.dueAmount -= amount;

    order.paymentStatus =
      order.dueAmount === 0 ? "paid" : "partial";

    order.paymentMethod = paymentMethod;

    await order.save();
    await logActivity({
  module: "payment",
  action: "COLLECT_CREDIT",
  description: `Credit payment collected for order ${order.orderNumber}`,
  user: req.user,
  referenceId: order._id,
  restaurantId: req.user.restaurantId,
  meta: { amount }
});
    res.json({
      message: "Payment collected successfully",
      order,
    });
  } catch (err) {
    console.error("Collect credit error:", err);
    res.status(500).json({ message: "Payment collection failed" });
  }
};


exports.createCounterCreditOrder = async (req, res) => {
  try {
    const { items, customerId, taxPercent = 0, discount = 0 } = req.body;

    if (!items?.length) {
      return res.status(400).json({ message: "Items required" });
    }

    const customer = await Customer.findOne({ _id: customerId, restaurantId: req.user.restaurantId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    /* ================= BILL ================= */
    let subTotal = 0;
    const formattedItems = items.map(i => {
      const total = i.price * i.qty;
      subTotal += total;
      return { ...i, total, status: "prepared" };
    });

    const tax = Number(((subTotal * taxPercent) / 100).toFixed(2));
    const totalAmount = Number((subTotal + tax - discount).toFixed(2));

    /* ================= LEDGER BALANCE ================= */
    const lastLedger = await CustomerLedger.findOne({ customerId })
      .sort({ createdAt: -1 });

    let runningBalance = lastLedger ? lastLedger.balanceAfter : 0;

    /* ================= ADVANCE AUTO-ADJUST ================= */
    let advanceUsed = 0;
    let dueAmount = totalAmount;
    let paymentStatus = "unpaid";

    if (runningBalance < 0) {
      advanceUsed = Math.min(Math.abs(runningBalance), totalAmount);
      dueAmount -= advanceUsed;
      runningBalance += advanceUsed;
      paymentStatus = dueAmount === 0 ? "paid" : "partial";
    }

    /* ================= CREATE ORDER ================= */
    const order = await Order.create({
      orderType: "counter",
      createdBy: req.user._id,
      customer: {
        customerId: customer._id,
        name: customer.name,
        phone: customer.phone,
      },
      items: formattedItems,
      restaurantId: req.user.restaurantId,
      subTotal,
      tax,
      taxPercent,
      discount,
      totalAmount,
      paymentType: "credit",
      paymentStatus,
      dueAmount,
      status: "completed",
      kots: [
        {
          kotNo: 1,
          items: formattedItems,
          status: "ready",
        },
      ],
    });

    /* ================= LEDGER ENTRY : BILL ================= */
    runningBalance += totalAmount;

    await CustomerLedger.create({
      customerId,
      orderId: order._id,
      type: "bill",
      debit: totalAmount,
      credit: 0,
      balanceAfter: runningBalance,
      restaurantId: req.user.restaurantId,
    });

    /* ================= LEDGER ENTRY : ADVANCE USED ================= */
    if (advanceUsed > 0) {
      runningBalance -= advanceUsed;

      // await CustomerLedger.create({
      //   customerId,
      //   orderId: order._id,
      //   type: "payment",
      //   debit: 0,
      //   credit: advanceUsed,
      //   balanceAfter: runningBalance,
      //   note: "Advance auto-adjusted to order",
      // });
    }

    // 🔔 Create notification for counter credit order
    await createNotification({
      io: req.io,
      message: `Counter credit order ${order.orderNumber} created .`,
      activityType: "order",
      data: { orderId: order._id, orderNumber: order.orderNumber },
      createdBy: req.user?._id,
      targetRole: "admin",
      restaurantId: req.user.restaurantId
    });

    await createNotification({
      io: req.io,
      message: `Counter credit order ${order.orderNumber} created .`,
      activityType: "order",
      data: { orderId: order._id, orderNumber: order.orderNumber },
      createdBy: req.user?._id,
      targetRole: "owner",
      restaurantId: req.user.restaurantId
    });

    // 📜 Log activity for counter credit order
    await logActivity({
      module: "order",
      action: "CREATE_COUNTER_CREDIT_ORDER",
      description: `Order ${order.orderNumber} created  by ${req.user?.name || "Unknown"}`,
      user: req.user,
      referenceId: order._id,
      restaurantId: req.user.restaurantId,
      meta: { orderNumber: order.orderNumber, totalAmount: order.totalAmount },
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
      billMeta: {
        totalAmount,
        advanceUsed,
        dueAmount,
        finalBalance: runningBalance,
      },
    });

  } catch (err) {
    console.error("Counter credit error:", err);
    res.status(500).json({
      message: "Counter credit order failed",
      error: err.message,
    });
  }
};


/* ================= GET ORDERS (FOR TABS) ================= */
exports.getOrders = async (req, res) => {
  try {
    const { status, orderType } = req.query;

    const filter = {
      restaurantId: req.user.restaurantId,
    };

    if (status) {
      filter.status = status;
    }

    if (orderType) {
      filter.orderType = orderType; // dine_in | counter
    }

    const orders = await Order.find(filter)
      .populate({
        path: "tableId",
        select: "tableNumber area customerId",
        populate: [
          { path: "area", select: "name" },
          { path: "customerId", select: "name phone" },
        ],
      })
      .sort({ createdAt: -1 });

    res.json({
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


exports.getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    /* ================= TODAY STATS ================= */

    const todayOrders = await Order.find({
      restaurantId: req.user.restaurantId,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const totalOrders = todayOrders.length;

    const totalSales = todayOrders
      .filter(o => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const pendingOrders = todayOrders.filter(
      o => o.status !== "completed" && o.status !== "cancelled"
    ).length;

    const cancelledOrders = todayOrders.filter(
      o => o.status === "cancelled"
    ).length;

    const itemsSold = todayOrders.reduce((sum, order) => {
      return (
        sum +
        order.items.reduce((iSum, item) => iSum + item.qty, 0)
      );
    }, 0);

    /* ================= SALES TREND (7 DAYS) ================= */

    const last7Days = await Order.aggregate([
      {
        $match: {
          restaurantId: req.user.restaurantId,
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.day": 1 },
      },
    ]);

    /* ================= TOP SELLING ITEMS ================= */

    const topItems = await Order.aggregate([
      {
        $match: {
          restaurantId: req.user.restaurantId,
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQty: { $sum: "$items.qty" },
          revenue: {
            $sum: {
              $multiply: ["$items.price", "$items.qty"],
            },
          },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    /* ================= PAYMENT STATUS ================= */

   /* ================= PAYMENT STATUS ================= */

const paymentStatsRaw = await Order.aggregate([
  {
    $match: {
      restaurantId: req.user.restaurantId,
    },
  },
  {
    $group: {
      _id: "$paymentStatus",
      count: { $sum: 1 },
    },
  },
]);

// Ensure all statuses exist
const paymentSummary = {
  paid: 0,
  partial: 0,
  unpaid: 0,
};

paymentStatsRaw.forEach((p) => {
  if (paymentSummary[p._id] !== undefined) {
    paymentSummary[p._id] = p.count;
  }
});

// Convert to chart format
const paymentStats = [
  { _id: "paid", count: paymentSummary.paid },
  { _id: "partial", count: paymentSummary.partial },
  { _id: "unpaid", count: paymentSummary.unpaid },
];
    res.json({
      stats: {
        totalOrders,
        totalSales,
        pendingOrders,
        cancelledOrders,
        itemsSold,
      },
      salesTrend: last7Days,
      topItems,
      paymentStats,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Dashboard failed" });
  }
};

exports.getKitchenMonitor = async (req, res) => {
  try {

    const orders = await Order.find({
      restaurantId: req.user.restaurantId,
      orderType: "dine_in",
      status: { $nin: ["completed", "cancelled"] }
    })
    .populate({
      path: "tableId",
      select: "tableNumber area",
      populate: { path: "area", select: "name" }
    })
    .lean();

    const now = new Date();

    const formattedOrders = [];

    for (const order of orders) {

      // 🔹 Only running KOTs
      const runningKots = order.kots.filter(k =>
        ["pending", "preparing", "ready"].includes(k.status)
      );

      // ❌ Skip order if no active KOT
      if (!runningKots.length) continue;

      const firstKotTime = runningKots?.[0]?.createdAt;

      const minutes = firstKotTime
        ? Math.floor((now - new Date(firstKotTime)) / 60000)
        : 0;

      formattedOrders.push({
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableId: order.tableId?._id,
        table: order.tableId?.tableNumber || "-",
        area: order.tableId?.area?.name || "",

        minutes,

        runningKots: runningKots.map(k => ({
          kotNo: k.kotNo,
          status: k.status,
          createdAt: k.createdAt,

          items: k.items.map(i => ({
            name: i.name,
            qty: i.qty
          }))
        }))
      });

    }

    /* ================= SUMMARY ================= */

    const delayedCount = formattedOrders.filter(o => o.minutes > 15).length;

    const readyCount = formattedOrders.filter(o =>
      o.runningKots.every(k => k.status === "ready")
    ).length;

    const totalPrepMinutes = formattedOrders.reduce(
      (sum, o) => sum + o.minutes,
      0
    );

    res.json({
      summary: {
        kitchenCount: formattedOrders.length,
        readyCount,
        avgPrep: formattedOrders.length
          ? Math.round(totalPrepMinutes / formattedOrders.length)
          : 0,
        delayedCount
      },

      orders: formattedOrders
    });

  } catch (err) {
    console.error("Kitchen monitor error:", err);
    res.status(500).json({ message: "Kitchen monitor error" });
  }
};