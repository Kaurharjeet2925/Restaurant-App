const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    tenantId: {
  type: mongoose.Schema.Types.ObjectId,
  required: true,
  index: true,
},

    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
