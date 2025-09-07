// app/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
const joinedUsers = new Set<string>();

export const getSocket = (currentUserId: string): Socket => {
  if (!currentUserId) {
    throw new Error("currentUserId is required");
  }

  if (!socket) {
    socket = io("http://localhost:4000", { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("✅ Connected to server:", socket?.id);

      if (!joinedUsers.has(currentUserId)) {
        socket?.emit("join", currentUserId);
        joinedUsers.add(currentUserId);
        console.log("📌 Emitted join for user:", currentUserId);
      }
    });

    socket.on("connect_error", (err) =>
      console.error("⚠️ Socket connect error:", err.message)
    );
  } else {
    // Socket exists: join only if not joined before
    if (!joinedUsers.has(currentUserId)) {
      socket.emit("join", currentUserId);
      joinedUsers.add(currentUserId);
      console.log("🔁 Re-joined socket with user:", currentUserId);
    }
  }

  return socket;
};
