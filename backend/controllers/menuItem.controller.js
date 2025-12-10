const MenuItem = require("../models/menuItem.model");

// --------------------------------------
// CREATE MENU ITEM
// --------------------------------------
exports.createItem = async (req, res) => {
  try {
    const { name, category, price } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Image path from multer
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const item = await MenuItem.create({ name, category, price, image });

    res.status(201).json({
      message: "Item added successfully",
      item,
    });
  } catch (error) {
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
    const items = await MenuItem.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
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
    const { name, category, price, available } = req.body;

    const updateData = { name, category, price, available };

    // If new image uploaded, replace old image
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
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
    const item = await MenuItem.findByIdAndDelete(req.params.id);

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
