// server.js
const { createServer } = require("http");
const { Server } = require("socket.io");

// Create HTTP server
const httpServer = createServer();

// Initialize Socket.IO server
const io = new Server(httpServer, {
  cors: { origin: "*" }, // adjust your frontend URL in production
});

// Store online users: userId -> [socketId, ...]
const onlineUsers = {};


// Broadcast current online users to all clients
function broadcastOnlineUsers() {
  const ids = Object.keys(onlineUsers); // userIds
  console.log("👥 Broadcasting online users:", ids);
  io.emit("online-users", ids);
}

// Listen for socket connections
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // User joins with their userId
  socket.on("join", (userId) => {
    if (!userId) return;

    if (!onlineUsers[userId]) {
      onlineUsers[userId] = [];
    }
    if (!onlineUsers[userId].includes(socket.id)) {
      onlineUsers[userId].push(socket.id);
    }

    console.log(`📌 User joined: ${userId}, Sockets:`, onlineUsers[userId]);

    // 🔥 Immediately broadcast updated online users
    broadcastOnlineUsers();
  });

  // Handle sending messages
  socket.on("message", (message) => {
    const { receiverId } = message;
    const receiverSockets = onlineUsers[receiverId] || [];

    receiverSockets.forEach((sid) => io.to(sid).emit("message", message));

    // Optional: echo back to sender
    socket.emit("message", message);

    console.log("📩 Message sent:", message);
  });


socket.on("leave", (userId) => {
  if (!userId) return;
  if (!onlineUsers[userId]) return;

  onlineUsers[userId] = onlineUsers[userId].filter((id) => id !== socket.id);
  if (onlineUsers[userId].length === 0) {
    delete onlineUsers[userId];
  }

  console.log(`🚪 User left: ${userId}, remaining sockets:`, onlineUsers[userId] || []);
  broadcastOnlineUsers();
});

  // Handle disconnect
  socket.on("disconnect", () => {
    let removedUserId = null;

    for (const userId in onlineUsers) {
      onlineUsers[userId] = onlineUsers[userId].filter((id) => id !== socket.id);
      if (onlineUsers[userId].length === 0) {
        delete onlineUsers[userId];
        removedUserId = userId;
      }
    }

    console.log(
      `❌ Disconnected socket: ${socket.id} (User: ${removedUserId || "unknown"})`
    );

    // 🔥 Immediately broadcast updated online users
    broadcastOnlineUsers();
  });
});

// Start server
httpServer.listen(4000, () => {
  console.log("🚀 Socket server running on port 4000");
});


