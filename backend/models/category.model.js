const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
  tenantId: {
  type: mongoose.Schema.Types.ObjectId,
  required: true,
  index: true,
},


    name: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
