const router = require("express").Router();
const auth = require("../middleware/auth");
const { createCategory, getCategories, deleteCategory, updateCategory } =
  require("../controllers/category.controller");
const allowAdminAndOwner = require("../middleware/allowAdminAndOwner");
  console.log("Category routes loaded");

// CRUD
router.post("/category",auth, allowAdminAndOwner, createCategory);
router.get("/category",auth, getCategories);
router.delete("/category/:id",auth, allowAdminAndOwner, deleteCategory);
router.put("/category/:id",auth, allowAdminAndOwner, updateCategory);

module.exports = router;
