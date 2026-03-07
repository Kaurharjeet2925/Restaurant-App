const Notification = require("../models/notification.model");
const logActivity = require("../utils/logActivity");

/* ================= CREATE NOTIFICATION ================= */
exports.createNotification = async ({
  io,
  restaurantId, // 🔥 REQUIRED
  message,
  title = null,
  activityType,
  targetUser = null,
  targetRole = null,
  data = {},
  createdBy = null,
}) => {
  try {
    if (!restaurantId) {
      throw new Error("restaurantId is required for notification");
    }

    const notification = await Notification.create({
      restaurantId,
      title,
      message,
      activityType,
      targetUser,
      targetRole,
      data,
    });

    /* 🔔 SOCKET EMIT (TENANT SAFE) */
    if (io) {
      if (targetUser) {
        io.to(`restaurant:${restaurantId}:user:${targetUser}`)
          .emit("notification", notification);
      }

      if (targetRole) {
        io.to(`restaurant:${restaurantId}:role:${targetRole}`)
          .emit("notification", notification);
      }
    }

    /* 📜 ACTIVITY LOG */
    if (createdBy) {
      await logActivity({
        module: "notification",
        action: "CREATED",
        description: message,
        user: createdBy,
        referenceId: notification._id,
        meta: { targetUser, targetRole, activityType },
        restaurantId,
      });
    }

    return notification;
  } catch (err) {
    console.error("createNotification error:", err);
    throw err;
  }
};

/* ================= GET NOTIFICATIONS ================= */
exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const unread = req.query.unread === "true";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.max(Number(req.query.limit || 20), 1);

    let filter = {
      isDeleted: false,
      restaurantId: user.restaurantId, // 🔥 TENANT FILTER
    };

   filter.$or = [
  { targetUser: user._id },
  { targetRole: user.role },
];

// owner can also see admin notifications
if (user.role === "owner") {
  filter.$or.push({ targetRole: "admin" });
}

    if (unread) {
      filter.read = false;
    }

    const totalItems = await Notification.countDocuments(filter);

    const data = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      data,
    });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ message: "Failed to load notifications" });
  }
};

/* ================= MARK ONE AS READ ================= */
exports.markRead = async (req, res) => {
  try {
    const user = req.user;

    const notif = await Notification.findOne({
      _id: req.params.id,
      restaurantId: user.restaurantId, // 🔥 TENANT SAFE
      isDeleted: false,
    });

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const allowed =
      (notif.targetUser &&
        notif.targetUser.toString() === user._id.toString()) ||
      notif.targetRole === user.role;

    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    notif.read = true;
    await notif.save();

   await logActivity({
  module: "notification",
  action: "READ",
  description: "Notification marked as read",
  user,
  referenceId: notif._id,
  restaurantId: user.restaurantId,
});
    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("markRead error:", err);
    res.status(500).json({ message: "Failed to mark read" });
  }
};

/* ================= MARK ALL AS READ ================= */
exports.markAllRead = async (req, res) => {
  try {
    const user = req.user;

    const filter = {
      isDeleted: false,
      read: false,
      restaurantId: user.restaurantId, // 🔥 TENANT SAFE
      $or: [
        { targetUser: user._id },
        { targetRole: user.role },
      ],
    };

    const result = await Notification.updateMany(filter, {
      $set: { read: true },
    });

    if (result.modifiedCount > 0) {
      await logActivity({
        module: "notification",
        action: "READ_ALL",
        description: "All notifications marked as read",
        user,
        meta: { count: result.modifiedCount },
        restaurantId: user.restaurantId,
      });
    }

    res.json({
      message: "Marked all as read",
      updated: result.modifiedCount || 0,
    });
  } catch (err) {
    console.error("markAllRead error:", err);
    res.status(500).json({ message: "Failed to mark all read" });
  }
};