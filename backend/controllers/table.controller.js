const Table = require("../models/table.model")

exports.createTable = async(req,res)=>{
    try{
        const {tableNumber, capacity, area} = req.body;
        if(!tableNumber || !capacity || !area){
            return res
            .status(400).json({message: "Table number, Capacity and area are required"});
        
        
      }
      const exists = await Table.findOne({ tableNumber, area });
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
    });

    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find()
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

    const updated = await Table.findByIdAndUpdate(
      id,
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

/* ================= UPDATE TABLE STATUS ================= */
exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["free", "occupied", "reserved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const table = await Table.findByIdAndUpdate(
      id,
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

    await Table.findByIdAndDelete(id);
    res.status(200).json({ message: "Table deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};