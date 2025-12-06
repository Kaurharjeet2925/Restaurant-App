const router = require("express").Router();
const { createCategory, getCategories, deleteCategory } =
  require("../controllers/category.controller");

// CRUD
router.post("/category", createCategory);
router.get("/category", getCategories);
router.delete("/category/:id", deleteCategory);

module.exports = router;
