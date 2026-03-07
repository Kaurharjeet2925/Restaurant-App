const ActivityLog = require("../models/activityLog.model");

async function logActivity({
  module,
  action,
  description,
  user,
  referenceId = null,
  meta = {},
  restaurantId = null
}) {
  try {
    let performedBy = {};

    if (user) {
      if (user._id) performedBy.userId = user._id;

      performedBy.name =
        user.name ||
        (user.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : "Unknown");

      performedBy.role = user.role || "Unknown";
    }

    const restId = restaurantId || user?.restaurantId;

    if (!restaurantId && !user?.restaurantId) {
      throw new Error("restaurantId is required to log activity.");
    }

    await ActivityLog.create({
      module,
      action,
      description,
      performedBy,
      referenceId,
      meta,
      restaurantId: restId, // FIX
    });

  } catch (err) {
    console.error("[logActivity] Failed to log activity:", err);
  }
}

module.exports = logActivity;