const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

/* ===============================
   JWT TOKEN
================================ */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      restaurantId: user.restaurantId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

/* ===============================
   LOGIN (ALL USERS)
================================ */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        phone: user.phone,
        gender: user.gender,
        address: user.address,
        dateofbirth: user.dateofbirth,
        uploadImage: user.uploadImage,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};

/* ===============================
   CREATE USER (OWNER / ADMIN)
================================ */
exports.createStaffUser = async (req, res) => {
  try {
    if (!["owner", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only owner or admin can create users",
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      address,
      dateofbirth,
      role,
    } = req.body;

    let allowedRoles = ["waiter", "kitchen", "billing"];

    // Owner can create admin also
    if (req.user.role === "owner") {
      allowedRoles.push("admin");
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password,
      phone,
      gender,
      address,
      dateofbirth,
      role,
      restaurantId: req.user.restaurantId,
      uploadImage: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

/* ===============================
   GET USERS (MULTI-TENANT SAFE)
================================ */
exports.getAllUsers = async (req, res) => {
  try {
    // SuperAdmin sees everything
    if (req.user.role === "superAdmin") {
      const users = await User.find().select("-password");
      return res.json({users});
    }

    // Restaurant isolation
    const users = await User.find({
      restaurantId: req.user.restaurantId,
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

/* ===============================
   GET MY PROFILE
================================ */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

/* ===============================
   UPDATE USER (HIERARCHY SAFE)
================================ */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // SuperAdmin can update anyone
    if (req.user.role !== "superAdmin") {
      if (
        user.restaurantId?.toString() !==
        req.user.restaurantId?.toString()
      ) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      address,
      dateofbirth,
      role,
    } = req.body;

    if (firstName || lastName) {
      user.name = `${firstName || ""} ${lastName || ""}`.trim();
    }

    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (address) user.address = address;
    if (dateofbirth) user.dateofbirth = dateofbirth;

    // Role change logic
    if (role) {
      if (req.user.role === "owner") {
        const allowedRoles = ["admin", "waiter", "kitchen", "billing"];
        if (!allowedRoles.includes(role)) {
          return res.status(400).json({ message: "Invalid role update" });
        }
        user.role = role;
      }

      if (req.user.role === "admin") {
        const allowedRoles = ["waiter", "kitchen", "billing"];
        if (!allowedRoles.includes(role)) {
          return res.status(400).json({
            message: "Admin cannot assign this role",
          });
        }
        user.role = role;
      }
    }

    if (req.file) {
      user.uploadImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

/* ===============================
   DELETE USER (STRICT SAFE)
================================ */
exports.deleteUser = async (req, res) => {
  try {
    if (!["owner", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent deleting owner
    if (user.role === "owner") {
      return res.status(403).json({ message: "Cannot delete owner" });
    }

    // Admin cannot delete another admin
    if (req.user.role === "admin" && user.role === "admin") {
      return res.status(403).json({
        message: "Admin cannot delete another admin",
      });
    }

    if (
      user.restaurantId?.toString() !==
      req.user.restaurantId?.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete error" });
  }
};