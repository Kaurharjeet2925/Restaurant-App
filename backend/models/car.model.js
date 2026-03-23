const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
{
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
    index: true,
  },

  carNo: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["free", "running"],
    default: "free",
  },

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    default: null,
  },

  currentOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null,
  },

  area: {
    type: String,
    default: "Parking",
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

},
{ timestamps: true }
);

/* UNIQUE CAR PER RESTAURANT */

carSchema.index(
  { restaurantId: 1, carNo: 1 },
  { unique: true }
);

module.exports = mongoose.model("Car", carSchema);