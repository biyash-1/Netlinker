// server.js
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// ✅ Store multiple sockets per user
const onlineUsers = {}; // userId -> [socketId1, socketId2, ...]

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user
  socket.on("join", (userId) => {
    if (!userId) return;

    if (!onlineUsers[userId]) onlineUsers[userId] = [];
    onlineUsers[userId].push(socket.id);

    console.log("User joined:", userId, "Sockets:", onlineUsers[userId]);
  });

  // Receive message
  socket.on("message", (message) => {
    console.log("📩 Received:", message);

    const receiverSockets = onlineUsers[message.receiverId] || [];
    receiverSockets.forEach((sid) => io.to(sid).emit("message", message));

    // Optional: echo back to sender
    socket.emit("message", message);
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (const userId in onlineUsers) {
      onlineUsers[userId] = onlineUsers[userId].filter((id) => id !== socket.id);
      if (onlineUsers[userId].length === 0) delete onlineUsers[userId];
    }
    console.log("❌ Disconnected:", socket.id);
  });
});

httpServer.listen(4000, () => console.log("Socket server running on port 4000"));
