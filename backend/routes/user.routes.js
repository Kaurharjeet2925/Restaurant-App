const router = require("express").Router();
const { 
  registerUser,
  loginUser,
  createUserBySuperAdmin,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMyProfile,
} = require("../controllers/user.controllers")

const upload = require("../middleware/multer");
const { registerValidation, loginValidation } = require("../middleware/authValidation");
const auth = require("../middleware/auth");
const onlySuperAdmin = require("../middleware/onlySuperAdmin");
const allowAdminAndSuperAdmin = require("../middleware/allowAdminAndSuperAdmin");

// AUTH
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);

// USERS
router.get("/all", auth, onlySuperAdmin, getAllUsers);
router.get("/user/me", auth, getMyProfile);

router.post(
  "/superadmin/create-user",
  auth,
  allowAdminAndSuperAdmin,
  upload.single("image"),
  createUserBySuperAdmin
);

router.get("/user/:id", auth, getUserById);

router.put(
  "/user/:id",
  auth,
  upload.single("image"),
  updateUser
);

router.delete("/user/:id", auth, onlySuperAdmin, deleteUser);

module.exports = router;
