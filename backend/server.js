require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();
const server = http.createServer(app);

// ✅ FIXED CORS — MUST MATCH FRONTEND URL
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// ✅ SOCKET.IO CORS FIX
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use(express.json());

// Attach io to req for real-time communication
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ROUTES
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);

// SOCKET HANDLERS
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

// START SERVER
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
});
