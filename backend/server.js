require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const orderRoutes = require("./routes/order.routes")
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const menuRoutes = require("./routes/menuItem.routes");
const tableRoutes = require("./routes/table.routes");
const CustomerRoutes = require("./routes/customer.routes");
const AreaRoutes = require("./routes/area.routes")
const PortionTypeRoutes = require("./routes/portionType.routes");
const app = express();
const server = http.createServer(app);

// -------------------------------------
// ✅ CORS SETUP
// -------------------------------------
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// -------------------------------------
// ✅ SOCKET.IO SETUP
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


// ------------------------------------------------
// 🔥 CUSTOM EXPRESS LOGGER (YOUR FORMAT)
// ------------------------------------------------
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(
      `🔹 [${req.method}] ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`
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
app.use("/api",CustomerRoutes);
app.use("/api",AreaRoutes);
app.use("/api",tableRoutes);
app.use("/api", orderRoutes);
app.use("/api", PortionTypeRoutes);
// -------------------------------------
// ✅ SOCKET HANDLERS
// -------------------------------------
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
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
