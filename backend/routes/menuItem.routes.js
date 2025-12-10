const router = require("express").Router();
const upload = require("../middleware/multer");
const {
  createItem,
  getItems,
  updateItem,
  deleteItem
} = require("../controllers/menuItem.controller");

router.post("/menu", upload.single("image"), createItem);
router.put("/menu/:id", upload.single("image"), updateItem);
router.get("/menu", getItems);
router.delete("/menu/:id", deleteItem);

module.exports = router;
