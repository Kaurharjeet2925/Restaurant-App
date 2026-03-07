const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
{
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
    index: true
  },

  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  email: {
    type: String,
    default: ""
  },

  address: {
    type: String,
    default: ""
  },

  notes: {
    type: String,
    default: ""
  }
},
{ timestamps: true }
);

/* MULTI TENANT UNIQUE INDEX */
CustomerSchema.index(
  { restaurantId: 1, phone: 1 },
  { unique: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);