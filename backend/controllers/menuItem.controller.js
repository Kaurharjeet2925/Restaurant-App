const MenuItem = require("../models/menuItem.model");
const PortionType = require("../models/portionType.model");

// --------------------------------------
// CREATE MENU ITEM
// --------------------------------------
exports.createItem = async (req, res) => {
  try {
    let { name, category, price, foodType, portionType } = req.body;

    /* ------------------------------
       BASIC VALIDATION
    -------------------------------*/
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: "Item name must be at least 2 characters",
      });
    }

    if (!category) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!price || isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({
        message: "Price must be a valid number greater than 0",
      });
    }

    /* ------------------------------
       VARIANT VALIDATION
    -------------------------------*/
    if (portionType) {
      const variant = await PortionType.findById(portionType);

      if (!variant) {
        return res.status(400).json({
          message: "Invalid variant selected",
        });
      }
    }

    /* ------------------------------
       DUPLICATE ITEM CHECK
    -------------------------------*/
    const existing = await MenuItem.findOne({
      name: name.trim(),
      restaurantId: req.user.restaurantId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Item already exists",
      });
    }

    /* ------------------------------
       IMAGE
    -------------------------------*/
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const item = await MenuItem.create({
      name: name.trim(),
      category,
      price: Number(price),
      foodType: foodType || "veg",
      portionType: portionType || null,
      image,
      restaurantId: req.user.restaurantId,
    });

    res.status(201).json({
      message: "Item added successfully",
      item,
    });

  } catch (error) {
    console.error("CREATE MENU ERROR:", error);

    res.status(500).json({
      message: "Error adding item",
      error: error.message,
    });
  }
};


// --------------------------------------
// GET ALL MENU ITEMS
// --------------------------------------
exports.getItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.user.restaurantId })
      .populate("category", "name")
      .populate("portionType", "pricingRule units type")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error("GET MENU ERROR:", error); // 🔥 add this
    res.status(500).json({
      message: "Error fetching items",
      error: error.message,
    });
  }
};

// --------------------------------------
// UPDATE MENU ITEM
// --------------------------------------
exports.updateItem = async (req, res) => {
  try {
    let { name, category, price, available, foodType, portionType } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: "Item name must be at least 2 characters",
      });
    }

    if (!category) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!price || isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({
        message: "Price must be a valid number",
      });
    }

    if (portionType) {
      const variant = await PortionType.findById(portionType);

      if (!variant) {
        return res.status(400).json({
          message: "Invalid variant selected",
        });
      }
    }

    const updateData = {
      name: name.trim(),
      category,
      price: Number(price),
      available,
      foodType,
      portionType: portionType || null,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.user.restaurantId },
      updateData,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        message: "Menu item not found",
      });
    }

    res.json({
      message: "Item updated successfully",
      item,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating item",
      error: error.message,
    });
  }
};


// --------------------------------------
// DELETE MENU ITEM
// --------------------------------------
exports.deleteItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting item",
      error: error.message,
    });
  }
};
