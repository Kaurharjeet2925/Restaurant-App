
const Notification = require("../models/notification.model");
const logActivity = require("../utils/logActivity");

/* ================= CREATE NOTIFICATION ================= */
exports.createNotification = async ({
  io,
  message,
  title = null,
  activityType,
  targetUser = null,
  targetRole = null,
  data = {},
  createdBy = null, // 👈 pass req.user when available
}) => {
  try {
    console.log('[createNotification] called with:', { message, title, activityType, targetUser, targetRole, data, createdBy });
    const notification = await Notification.create({
      title,
      message,
      activityType,
      targetUser,
      targetRole,
      data,
    });
    console.log('[createNotification] Notification created:', notification);

    /* 🔔 SOCKET EMIT */
    if (io) {
      if (targetUser) {
        console.log(`[createNotification] Emitting to user:${targetUser}`);
        io.to(`user:${targetUser}`).emit("notification", notification);
      }
      if (targetRole) {
        console.log(`[createNotification] Emitting to role:${targetRole}`);
        io.to(`role:${targetRole}`).emit("notification", notification);
        // Always send to admin and superAdmin if kitchen
        if (targetRole === "kitchen") {
          io.to("role:admin").emit("notification", notification);
          io.to("role:superAdmin").emit("notification", notification);
        }
      }
    } else {
      console.log('[createNotification] No io instance provided');
    }

    /* 📜 ACTIVITY LOG */
    if (createdBy) {
      let userName = createdBy.name || createdBy.firstName || 'Unknown';
      let desc = `${message} (by ${userName})`;
      await logActivity({
        module: "notification",
        action: "CREATED",
        description: desc,
        user: createdBy,
        referenceId: notification._id,
        meta: { targetUser, targetRole, activityType },
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
    };

    // 🔥 Admin & SuperAdmin see EVERYTHING
    if (user.role === "admin" || user.role === "superAdmin") {
      filter.$or = [
        { targetUser: user._id },
        { targetRole: { $in: ["admin", "superAdmin", "kitchen", "waiter", "cashier"] } },
      ];
    } else {
      // Normal users see only their own role / personal notifications
      filter.$or = [
        { targetUser: user._id },
        { targetRole: user.role },
      ];
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

    /* 📜 ACTIVITY LOG */
    await logActivity({
      module: "notification",
      action: "READ",
      description: "Notification marked as read",
      user,
      referenceId: notif._id,
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
      $or: [
        { targetUser: user._id },
        { targetRole: user.role },
      ],
    };

    const result = await Notification.updateMany(filter, {
      $set: { read: true },
    });

    /* 📜 ACTIVITY LOG */
    if (result.modifiedCount > 0) {
      await logActivity({
        module: "notification",
        action: "READ_ALL",
        description: "All notifications marked as read",
        user,
        meta: { count: result.modifiedCount },
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

