const Area = require("../models/area.model");

/* ===============================
   GET AREAS (TENANT SAFE)
================================ */
exports.getAreas = async (req, res) => {
  try {
    console.log("User:", req.user);

    const areas = await Area.find({
      restaurantId: req.user.restaurantId,
    });

    res.json(areas);
  } catch (err) {
    console.error("AREA ERROR:", err); // 👈 add this
    res.status(500).json({ message: "Failed to load areas" });
  }
};
/* ===============================
   CREATE AREA (TENANT SAFE)
================================ */
exports.createArea = async (req, res) => {
  try {
    if (!req.user.restaurantId) {
      return res.status(400).json({ message: "Restaurant not found" });
    }

    const area = await Area.create({
      name: req.body.name,
      restaurantId: req.user.restaurantId,
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

/* ===============================
   UPDATE AREA (TENANT SAFE)
================================ */
exports.updateArea = async (req, res) => {
  try {
    const area = await Area.findOneAndUpdate(
      {
        _id: req.params.id,
        restaurantId: req.user.restaurantId,
      },
      req.body,
      { new: true }
    );

    if (!area) {
      return res.status(404).json({ message: "Area not found" });
    }

    res.json(area);
  } catch (err) {
    res.status(400).json({
      message:
        err.code === 11000
          ? "Area name already exists"
          : err.message || "Failed to update area",
    });
  }
};

/* ===============================
   DELETE AREA (TENANT SAFE)
================================ */
exports.deleteArea = async (req, res) => {
  try {
    const area = await Area.findOneAndDelete({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });

    if (!area) {
      return res.status(404).json({ message: "Area not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete area" });
  }
};