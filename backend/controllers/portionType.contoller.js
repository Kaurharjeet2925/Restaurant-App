// controllers/portionType.controller.js

const PortionType = require("../models/portionType.model");

/* ===============================
   GET ALL PORTION TYPES
================================ */
exports.getPortionTypes = async (req, res) => {
  try {
    const data = await PortionType.find({
      restaurantId: req.user.restaurantId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch portion types",
      error: error.message,
    });
  }
};


/* ===============================
   CREATE OR UPDATE PORTION TYPE
================================ */
exports.savePortionType = async (req, res) => {
  try {
    const { type, pricingRule, units } = req.body;

    /* VALIDATION */
    if (!type) {
      return res.status(400).json({
        message: "Type is required",
      });
    }

    if (!pricingRule) {
      return res.status(400).json({
        message: "Pricing rule is required",
      });
    }

    if (!Array.isArray(units) || units.length === 0) {
      return res.status(400).json({
        message: "At least one unit is required",
      });
    }

    const portion = await PortionType.findOneAndUpdate(
      {
        type,
        restaurantId: req.user.restaurantId,
      },
      {
        type,
        pricingRule,
        units,
        restaurantId: req.user.restaurantId,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.json(portion);
  } catch (error) {
    res.status(500).json({
      message: "Failed to save portion type",
      error: error.message,
    });
  }
};


/* ===============================
   UPDATE PORTION UNITS
================================ */
exports.updatePortionType = async (req, res) => {
  try {
    const { id } = req.params;
    const { units } = req.body;

    if (!Array.isArray(units) || units.length === 0) {
      return res.status(400).json({
        message: "Units must be provided",
      });
    }

    const updated = await PortionType.findOneAndUpdate(
      {
        _id: id,
        restaurantId: req.user.restaurantId,
      },
      {
        units,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Portion type not found",
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update portion type",
      error: error.message,
    });
  }
};