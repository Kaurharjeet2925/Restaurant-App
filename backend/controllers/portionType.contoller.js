// controllers/portionType.controller.js
const PortionType = require("../models/portionType.model")

// GET all portion types
exports.getPortionTypes = async (req, res) => {
  const data = await PortionType.find();
  res.json(data);
};

// CREATE or UPDATE (Plate / Size / Quantity)
exports.savePortionType = async (req, res) => {
  const { type, pricingRule, units } = req.body;

  const portion = await PortionType.findOneAndUpdate(
    { type },
    { pricingRule, units },
    { upsert: true, new: true }
  );

  res.json(portion);
};

// controllers/portionType.controller.js

exports.updatePortionType = async (req, res) => {
  const { id } = req.params;
  const { units } = req.body;

  const updated = await PortionType.findByIdAndUpdate(
    id,
    { units },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: "Portion type not found" });
  }

  res.json(updated);
};
