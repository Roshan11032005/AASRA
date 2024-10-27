const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust this to your client’s origin for better security
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("emergency", (locationData) => {
    // Broadcast the emergency location to all other connected devices
    socket.broadcast.emit("emergencyNotification", locationData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5111, () => {
  console.log("Server listening on port 3000");
});
