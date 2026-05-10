const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ActivityLog = require("../models/activityLog.model");
const {
  getNotifications,
  markRead,
  markAllRead,
} = require("../controllers/notification.controller");

const paginate = require("../utils/pagination");
/* ==========================
   🔔 NOTIFICATIONS
========================== */

/**
 * GET /api/notifications
 * Query params:
 *  - unread=true
 *  - page
 *  - limit
 */
router.get("/", auth, getNotifications);

/**
 * PATCH /api/notifications/:id/read
 */
router.patch("/:id/read", auth, markRead);

/**
 * PATCH /api/notifications/read-all
 */
router.patch("/read-all", auth, markAllRead);

/* ==========================
   📜 ACTIVITY LOG
========================== */

/**
 * GET /api/notifications/activity
 * Query params:
 *  - page
 *  - limit
 */
router.get("/activity", auth, async (req, res) => {
  try {
    // Filter out logs with module 'notification' and ensure tenant safety
    const filter = { 
      module: { $ne: "notification" },
      restaurantId: req.user.restaurantId 
    };
    const result = await paginate(
      ActivityLog,
      filter,
      req,
      {
        path: "performedBy.userId",
        select: "name role",
      },
      { createdAt: -1 }
    );

    res.json(result);
  } catch (err) {
    console.error("Activity log error:", err);
    res.status(500).json({
      message: "Failed to load activity log",
    });
  }
});

module.exports = router;
