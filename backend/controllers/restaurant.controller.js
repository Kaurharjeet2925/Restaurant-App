const Restaurant = require("../models/restaurant.model");
const User = require("../models/user.model");

/* ===============================
   CREATE RESTAURANT (SUPERADMIN)
================================ */
exports.createRestaurant = async (req, res) => {
  try {
    // 🔐 Only superAdmin allowed
    if (req.user.role !== "superAdmin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const {
      restaurantName,
      phone,
      ownerName,
      ownerEmail,
      ownerPassword,
    } = req.body;

    if (
      !restaurantName ||
      !ownerName ||
      !ownerEmail ||
      !ownerPassword ||
      !phone
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check restaurant duplicate
    const existingRestaurant = await Restaurant.findOne({
      name: restaurantName,
    });

    if (existingRestaurant) {
      return res.status(400).json({
        message: "Restaurant already exists",
      });
    }

    // Check owner email duplicate
    const existingUser = await User.findOne({
      email: ownerEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Owner email already exists",
      });
    }

    /* 1️⃣ Create Restaurant */
    const restaurant = await Restaurant.create({
      name: restaurantName,
      phone,
    });

    /* 2️⃣ Create OWNER (not admin) */
    const ownerUser = await User.create({
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
      role: "owner",
      restaurantId: restaurant._id,
    });

    res.status(201).json({
      message: "Restaurant and Owner created successfully",
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        phone: restaurant.phone,
      },
      owner: {
        id: ownerUser._id,
        name: ownerUser.name,
        email: ownerUser.email,
        role: ownerUser.role,
      },
    });
  } catch (error) {
    console.error("Create Restaurant Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   GET ALL RESTAURANTS (SUPERADMIN)
================================ */
exports.getRestaurants = async (req, res) => {
  try {
    if (req.user.role !== "superAdmin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const restaurants = await Restaurant.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Restaurants fetched successfully",
      restaurants,
    });
  } catch (error) {
    console.error("Get Restaurants Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   GET RESTAURANT BY ID
================================ */
exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Restaurant ID is required",
      });
    }

    // Only superAdmin OR owner of that restaurant
    if (req.user.role !== "superAdmin") {
      if (req.user.restaurantId?.toString() !== id) {
        return res.status(403).json({
          message: "Access denied",
        });
      }
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    res.status(200).json({
      message: "Restaurant fetched successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Get Restaurant Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
exports.createSuperAdmin = async (req, res) => {
  try {
    const existing = await User.findOne({ role: "superAdmin" });

    if (existing) {
      return res.status(400).json({
        message: "SuperAdmin already exists",
      });
    }

    const { name, email, password } = req.body;

    const superAdmin = await User.create({
      name,
      email,
      password,
      role: "superAdmin",
    });

    res.status(201).json({
      message: "SuperAdmin created successfully",
      user: superAdmin,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating SuperAdmin",
      error: error.message,
    });
  }
};

