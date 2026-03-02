const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    restaurantId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Restaurant",
  required: true,
  index: true,
},
    title: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

   activityType: {
      type: String,
      enum: [
  "order",          
  "payment",        
  "ledger",        
  "customer",      
  "menu",          
  "category",      
  "portion",      
  "area",          
  "user",           
  "kitchen",       
  "report",        
  "system",        
  "credit_order",  // Added for credit order notifications
],
      required: true,
      index: true,
    },
    // Store reference info (orderId, tableNo, amount, etc.)
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // For single-user notifications (ex: waiter)
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // For role-based notifications (kitchen/admin)
    targetRole: {
      type: String,
      enum: ["admin", "owner", "kitchen", "waiter", "cashier"],
      default: null,
      index: true,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Soft delete (recommended for audit safety)
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Auto-expire notifications after 30 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
