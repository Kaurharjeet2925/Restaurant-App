const Table = require("../models/table.model")
const Order = require("../models/order.model")
const mongoose = require("mongoose");
exports.createTable = async(req,res)=>{
    try{
        const {tableNumber, capacity, area} = req.body;
        if(!tableNumber || !capacity || !area){
            return res
            .status(400).json({message: "Table number, Capacity and area are required"});
        
        
      }
      const exists = await Table.findOne({ tableNumber, area, restaurantId: req.user.restaurantId });
    if (exists) {
      return res
        .status(409)
        .json({ message: "Table already exists" });
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      area,
      status: "free",
      restaurantId: req.user.restaurantId,
    });

    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTables = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const tables = await Table.find({ restaurantId: req.user.restaurantId })
      .populate("area", "name") // ✅ IMPORTANT
      .sort({ "area.name": 1, tableNumber: 1 });

    res.status(200).json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE TABLE ================= */
exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Table.findOneAndUpdate(
      { _id: id, restaurantId: req.user.restaurantId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["free", "occupied", "reserved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const table = await Table.findOneAndUpdate(
      { _id: id, restaurantId: req.user.restaurantId },
      { status },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.status(200).json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE TABLE ================= */
exports.deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Table.findOneAndDelete({ _id: id, restaurantId: req.user.restaurantId });
    if (!deleted) {
      return res.status(404).json({ message: "Table not found" });
    }
    res.status(200).json({ message: "Table deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.occupyTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId } = req.body;

    console.log(`[occupyTable] called with id=${id} body=${JSON.stringify(req.body)}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn(`[occupyTable] invalid id: ${id}`);
      return res.status(400).json({ message: "Invalid table id" });
    }

    const table = await Table.findOne({ _id: id, restaurantId: req.user.restaurantId });
    if (!table) {
      console.warn(`[occupyTable] table not found for id: ${id}`);
      return res.status(404).json({ message: "Table not found" });
    }

    // 🔥 CREATE EMPTY ORDER HERE
    const order = await Order.create({
      orderType: "dine_in",
      tableId: table._id,
      items: [],
      subTotal: 0,
      totalAmount: 0,
      status: "pending",
      restaurantId: req.user.restaurantId,
      createdBy: req.user._id, 
    });

    table.status = "occupied";
    table.customerId = customerId;
    table.currentOrderId = order._id;

    await table.save();

    console.log(`[occupyTable] success - table ${id} occupied, order ${order._id}`);

    res.json({
      message: "Table occupied & order created",
      orderId: order._id, // ✅ VERY IMPORTANT
    });
  } catch (err) {
    console.error("[occupyTable] error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🚨 Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid table id" });
    }

    const table = await Table.findOne({ _id: id, restaurantId: req.user.restaurantId })
      .populate("customerId");

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.json(table);
  } catch (err) {
    console.error("Get table by id error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

