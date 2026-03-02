const router = require("express").Router();
const auth = require("../middleware/auth");
const allowAdminAndOwner = require("../middleware/allowAdminAndOwner");
const upload = require("../middleware/multer");
const {
  createItem,
  getItems,
  updateItem,
  deleteItem
} = require("../controllers/menuItem.controller");

router.post("/menu", auth, allowAdminAndOwner, upload.single("image"), createItem);
router.put("/menu/:id", auth, allowAdminAndOwner, upload.single("image"), updateItem);
router.get("/menu", auth, getItems);
router.delete("/menu/:id", auth, allowAdminAndOwner, deleteItem);

module.exports = router;
