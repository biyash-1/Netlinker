// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let onlineUserIds = new Set<string>();
const joinedUsers = new Set<string>();

const SOCKET_URL = "https://socket-back-1-m6ib.onrender.com/";

// Connect socket and join current user
export const getSocket = (currentUserId: string): Socket => {
  if (!currentUserId) throw new Error("currentUserId is required");


  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to server:", socket?.id);
      socket?.emit("join", currentUserId);
      joinedUsers.add(currentUserId);
      console.log("📌 Emitted join for user:", currentUserId);
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket connect error:", err.message);
    });

    socket.on("reconnect", () => {
      console.log("🔄 Socket reconnected:", socket?.id);
      socket?.emit("join", currentUserId);
      joinedUsers.add(currentUserId);
    });

    // Keep online users in memory
    socket.on("online-users", (ids: string[]) => {
      onlineUserIds = new Set(ids);
      console.log("🔥 [GLOBAL] Updated online users:", ids);
    });
  } else {
    // Rejoin if already connected
    if (!joinedUsers.has(currentUserId)) {
      socket.emit("join", currentUserId);
      joinedUsers.add(currentUserId);
      console.log("🔁 Re-joined socket with user:", currentUserId);
    }
  }

  return socket;
};

// Subscribe to online users with cleanup support
export const subscribeOnlineUsers = (callback: (ids: string[]) => void) => {
  if (!socket) return;

  const handler = (ids: string[]) => {
    onlineUserIds = new Set(ids);
    callback(ids);
  };

  socket.off("online-users", handler); // remove old listener
  socket.on("online-users", handler);  // add new listener

  // Fire immediately with current known state
  callback(Array.from(onlineUserIds));

  return () => socket?.off("online-users", handler);
};

// New helper: subscribe to messages (centralized)
export const subscribeMessages = (callback: (message: any) => void) => {
  if (!socket) return () => {}; // return empty function instead of undefined

  const handler = (message: any) => callback(message);
  socket.on("message", handler);

  return () => socket?.off("message", handler);
};


// Check if a user is online
export const isUserOnline = (userId: string) => onlineUserIds.has(userId);

// Send message via socket
export const sendMessage = (message: any) => {
  if (!socket) return;
  console.log("📤 Sending message via socket:", message);
  socket.emit("message", message);
};





