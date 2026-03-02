const Category = require("../models/category.model");

// Add Category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exists = await Category.findOne({ name: name.trim(), restaurantId: req.user.restaurantId });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name: name.trim(), restaurantId: req.user.restaurantId  });

    res.status(201).json({ message: "Category added", category });
  } catch (error) {
    res.status(500).json({ message: "Error adding category", error: error.message });
  }
};


// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ restaurantId: req.user.restaurantId }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await Category.findOneAndUpdate(
      {
        _id: req.params.id,
        restaurantId: req.user.restaurantId,
      },
      { name },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category updated", category });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error: error.message });
    console.error("Update category error:", error); // 👈 add this for better debugging
  }
};
