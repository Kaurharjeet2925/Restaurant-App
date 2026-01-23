const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema(
  {
   tenantId: {
  type: mongoose.Schema.Types.ObjectId,
  required: true,
  index: true,
},

    name: {
      type: String,
      required: true,
      unique: true, // "Main Area", "Ground Floor"
      trim: true
    },

    description: String
  },
  { timestamps: true }
);
areaSchema.index({ name: 1, tenantId: 1 }, { unique: true });
module.exports = mongoose.model("Area", areaSchema);
