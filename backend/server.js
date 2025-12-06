require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');  // <-- ADD THIS

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Attach io to req for real-time notifications
app.use((req, res, next) => { req.io = io; next(); });

// Socket handlers
io.on('connection', socket => {
  console.log('Socket connected', socket.id);

  socket.on('join', (room) => {
    socket.join(room);
    console.log(`${socket.id} joined ${room}`);
  });

  socket.on('disconnect', () => console.log('Socket disconnected', socket.id));
});

// Start server AFTER DB connects
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on ${PORT}`));
});
