const express = require("express");
const router = express.Router();
const { createOrder, getOrderById, updateOrder, sendToKitchen,updateKitchenStatus } = require("../controllers/order.controller");

router.post("/orders", createOrder);
router.get("/orders/:orderId", getOrderById);

router.put("/orders/:orderId", updateOrder);
router.patch("/orders/:orderId/send-to-kitchen",sendToKitchen);
router.patch( "/orders/:orderId/kitchen-status",updateKitchenStatus);
module.exports = router;
