const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      enum: [
        "order",
        "notification",
        "kitchen",
        "payment",
        "menu",
        "customer",
        "system",
        "ledger", 
      ],
    },

    action: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    performedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      role: String,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);
