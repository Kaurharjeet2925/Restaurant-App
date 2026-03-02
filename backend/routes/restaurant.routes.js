const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createRestaurant, getRestaurantById, getRestaurants,createSuperAdmin } = require("../controllers/restaurant.controller");

// 🔐 Protected route
router.post("/restaurants", auth, createRestaurant);
router.post("/create-superadmin", createSuperAdmin); // For superAdmin to create superadmin
// Route to get a single restaurant by ID
router.get("/restaurants/:id", auth, getRestaurantById);
router.get("/restaurants", auth, getRestaurants);
module.exports = router;
