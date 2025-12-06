const router = require("express").Router();
const auth = require("../middleware/auth");
const { registerUser, loginUser } = require("../controllers/user.controllers");

router.post("/register", registerUser);
router.post("/login", loginUser);


module.exports = router;
