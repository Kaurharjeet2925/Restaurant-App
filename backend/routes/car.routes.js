const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const carController = require("../controllers/car.controller");

/* CAR CRUD */

router.post("/cars", auth, carController.createCar);
router.get("/cars", auth, carController.getCars);
router.get("/cars/:id", auth, carController.getCar);
router.delete("/cars/:id", auth, carController.deleteCar);

/* CAR ORDER */

router.get("/orders/car/:carId", auth, carController.getOrderByCar);
router.post("/cars/:carId/start-order", auth, carController.assignOrderToCar);
router.patch("/cars/:id/free", auth, carController.freeCar);

module.exports = router;