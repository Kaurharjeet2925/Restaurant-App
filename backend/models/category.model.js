const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
  

restaurantId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Restaurant",
  required: true,
  index: true,
},
    name: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
