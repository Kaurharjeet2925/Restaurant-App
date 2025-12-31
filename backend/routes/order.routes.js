const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createOrder,
  updateOrder,
  sendToKitchen,
  updateKotStatus,
  getOrderById,
  getKitchenKots,
  markItemPrepared,
  markKotReady,
  generateBillAndPay,
  cancelOrder
} = require("../controllers/order.controller");

/* ================= ORDER (WAITER / POS) ================= */
router.post("/orders", auth, createOrder);
router.get("/orders/:orderId", auth, getOrderById);
router.put("/orders/:orderId", auth, updateOrder);

router.patch("/orders/:orderId/send-to-kitchen", auth, sendToKitchen);

router.get("/kitchen/kots", auth, getKitchenKots);

router.put("/orders/:orderId/kot/:kotNo/item/:index/prepared", auth, markItemPrepared);
router.put("/orders/:orderId/kot/:kotNo/ready", auth, markKotReady);
router.patch("/orders/:orderId/kot/:kotNo/status", auth, updateKotStatus);
router.post("/orders/:orderId/bill", auth, generateBillAndPay);
router.patch("/orders/:orderId/cancel", auth, cancelOrder);


module.exports = router;
