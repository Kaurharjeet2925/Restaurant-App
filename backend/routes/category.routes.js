const router = require("express").Router();
const { createCategory, getCategories, deleteCategory, updateCategory } =
  require("../controllers/category.controller");
  console.log("Category routes loaded");

// CRUD
router.post("/category", createCategory);
router.get("/category", getCategories);
router.delete("/category/:id", deleteCategory);
router.put("/category/:id", (req, res, next) => {
  console.log("🔥🔥 ROUTE HIT: PUT /category/:id");
  next();
}, updateCategory);

module.exports = router;
