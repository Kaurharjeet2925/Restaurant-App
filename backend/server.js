require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const User = require("./models/user.model");

// Routes
const orderRoutes = require("./routes/order.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const menuRoutes = require("./routes/menuItem.routes");
const tableRoutes = require("./routes/table.routes");
const customerRoutes = require("./routes/customer.routes");
const areaRoutes = require("./routes/area.routes");
const reportRoutes = require("./routes/report.routes");
const portionTypeRoutes = require("./routes/portionType.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();
const server = http.createServer(app);

// -------------------------------------
// ✅ CORS
// -------------------------------------
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// -------------------------------------
// ✅ SOCKET.IO
// -------------------------------------
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// -------------------------------------
// ✅ MIDDLEWARES
// -------------------------------------
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// -------------------------------------
// 🔥 LOGGER
// -------------------------------------
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(
      `🔹 [${req.method}] ${req.originalUrl} - ${res.statusCode} (${Date.now() - start}ms)`
    );
  });
  next();
});

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// -------------------------------------
// ✅ ROUTES
// -------------------------------------
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", menuRoutes);
app.use("/api", customerRoutes);
app.use("/api", areaRoutes);
app.use("/api", tableRoutes);
app.use("/api", orderRoutes);
app.use("/api", reportRoutes);
app.use("/api", portionTypeRoutes);
app.use("/api/notifications", notificationRoutes); // ✅ FIXED

// -------------------------------------
// ✅ SOCKET AUTH
// -------------------------------------
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return next(new Error("Invalid user"));

    socket.user = user;
    next();
  } catch (err) {
    console.log("❌ Socket auth error:", err.message);
    next(new Error("Unauthorized socket"));
  }
});

// -------------------------------------
// ✅ SOCKET CONNECTION
// -------------------------------------
io.on("connection", (socket) => {
  const user = socket.user;

  console.log(
    "⚡ Socket connected:",
    socket.id,
    "| User:",
    user.name,
    "| Role:",
    user.role
  );

  // optional auto-join based on user role
  socket.join(`role:${user.role}`);

  socket.on("joinUserRoom", (userId) => {
  if (!userId) return;
  socket.join(`user:${userId}`);
  console.log(`✅ Joined user:${userId}`);
});

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});


// -------------------------------------
// ✅ START SERVER
// -------------------------------------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () =>
    console.log(`🚀 Server running on PORT ${PORT}`)
  );
});
