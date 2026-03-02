const router = require("express").Router();

const {
  loginUser,
  createStaffUser,
  getAllUsers,
  getMyProfile,
  updateUser,
  deleteUser,
} = require("../controllers/user.controllers");

const upload = require("../middleware/multer");
const auth = require("../middleware/auth");

/* ===============================
   AUTH
================================ */
router.post("/login", loginUser);

// Get all users (multi-tenant safe inside controller)
router.get("/all", auth, getAllUsers);

// Get my profile
router.get("/user/me", auth, getMyProfile);

// Create staff (Admin only)
router.post(
  "/staff",
  auth,
  upload.single("image"),
  createStaffUser
);

// Update user
router.put(
  "/user/:id",
  auth,
  upload.single("image"),
  updateUser
);

// Delete user
router.delete("/user/:id", auth, deleteUser);

module.exports = router;