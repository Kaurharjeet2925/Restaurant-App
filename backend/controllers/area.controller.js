const Area = require("../models/area.model");

// GET ALL AREAS
exports.getAreas = async (req, res) => {
  try {
    const areas = await Area.find(
    //  {
    //   tenantId: req.user.tenantId,
    // }

    ).sort({ createdAt: 1 });
    res.json(areas);
  } catch (err) {
    res.status(500).json({ message: "Failed to load areas" });
  }
};

// CREATE AREA
exports.createArea = async (req, res) => {
  try {
    const area = await Area.create({
      ...req.body,
     // tenantId: req.user.tenantId
    }); 
    res.status(201).json(area);
  } catch (err) {
    res.status(400).json({
      message:
        err.code === 11000
          ? "Area already exists"
          : err.message,
    });
  }
};

// UPDATE AREA
exports.updateArea = async (req, res) => {
  try {
    const area = await Area.findByIdAndUpdate({
      _id: req.params.id,
   //   tenantId: req.user.tenantId
    },
      req.body,

      { new: true }
    );
    res.json(area);
  } catch (err) {
    res.status(400).json({ message: "Failed to update area" });
  }
};

// DELETE AREA
exports.deleteArea = async (req, res) => {
  try {
    await Area.findByIdAndDelete({
      _id: req.params.id,
     // tenantId: req.user.tenantId
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete area" });
  }
};
