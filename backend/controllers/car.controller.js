const Car = require("../models/car.model");
const Order = require("../models/order.model");
/* ================= CREATE CAR ================= */
exports.createCar = async (req, res) => {
  try {

    const { carNo, area } = req.body;

    const car = await Car.create({
      restaurantId: req.user.restaurantId,
      carNo: carNo.toUpperCase(),
      area: area || "Parking",
      createdBy: req.user._id
    });

    res.status(201).json(car);

  } catch (err) {

    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Car already exists"
      });
    }

    res.status(500).json({
      message: "Failed to create car"
    });

  }
};

/* ================= GET ALL CARS ================= */
exports.getCars = async (req, res) => {
  try {

    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        message: "Restaurant not found in request"
      });
    }

    const cars = await Car.find({
      restaurantId
    }).populate("currentOrderId");

    res.json(cars);

  } catch (err) {

    console.error("Car fetch error:", err);

    res.status(500).json({
      message: "Failed to fetch cars"
    });

  }
};


/* ================= GET SINGLE CAR ================= */
exports.getCar = async (req, res) => {
  try {

    const car = await Car.findById(req.params.id)
      .populate("currentOrderId");

    if (!car) {
      return res.status(404).json({
        message: "Car not found"
      });
    }

    res.json(car);

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch car"
    });

  }
};


/* ================= DELETE CAR ================= */
exports.deleteCar = async (req, res) => {
  try {

    const car = await Car.findById(req.params.id).populate("currentOrderId");

    if (!car) {
      return res.status(404).json({
        message: "Car not found"
      });
    }

    // 🚫 Prevent deletion if order still running
    if (car.currentOrderId && car.currentOrderId.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Cannot delete car with running order"
      });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({
      message: "Car deleted"
    });

  } catch (err) {

    console.error("Delete car error:", err);

    res.status(500).json({
      message: "Failed to delete car"
    });

  }
};


/* ================= ASSIGN ORDER TO CAR ================= */
exports.assignOrderToCar = async (req, res) => {
  try {

    const { carId } = req.params;
    const { customerId } = req.body;

    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        message: "Car not found"
      });
    }

    if (car.currentOrderId) {
      return res.status(400).json({
        message: "Order already running on this car"
      });
    }

    const order = await Order.create({
      restaurantId: req.user.restaurantId,
      orderType: "carobar",
      carId: car._id,
      carNo: car.carNo,
      createdBy: req.user._id,
      customer: {
        customerId
      }
    });

    // 🔴 Save customer to car
    car.customerId = customerId;

    car.currentOrderId = order._id;
    car.status = "running";

    await car.save();

    res.json({ car, order });

  } catch (err) {

    console.error("CAR ORDER ERROR:", err);

    res.status(500).json({
      message: err.message
    });

  }
};
/* ================= FREE CAR ================= */
exports.freeCar = async (req, res) => {
  try {

    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        message: "Car not found"
      });
    }

    car.status = "free";
    car.currentOrderId = null;

    await car.save();

    res.json({
      message: "Car is now free"
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to update car"
    });

  }
};

exports.getOrderByCar = async (req, res) => {
  try {

    const { carId } = req.params;

    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        message: "Car not found"
      });
    }

    if (!car.currentOrderId) {
      return res.json(null);
    }

   const order = await Order.findOne({
  _id: car.currentOrderId,
  restaurantId: req.user.restaurantId
})
.populate("customer.customerId");

    res.json(order);

  } catch (err) {

    console.error("Car order fetch error:", err);

    res.status(500).json({
      message: "Failed to fetch car order"
    });

  }
};