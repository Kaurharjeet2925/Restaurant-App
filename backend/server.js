require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// IMPORT USER ROUTER
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// Attach io to req for real-time communication
app.use((req, res, next) => {
  req.io = io;
  next();
});

// REGISTER ROUTES
// → THIS MAKES: /api/register AND /api/login WORK
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);

// SOCKET HANDLERS
io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`${socket.id} joined ${room}`);
  });

  socket.on("disconnect", () => console.log("Socket disconnected", socket.id));
});

// START SERVER AFTER DATABASE CONNECTS
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () =>
    console.log(`Server running on PORT ${PORT}`)
  );
});
