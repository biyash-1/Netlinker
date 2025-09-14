// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let onlineUserIds = new Set<string>();
const joinedUsers = new Set<string>();

const SOCKET_URL = "http://localhost:4000";

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
  if (!socket) return;
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





// import { io, Socket } from "socket.io-client";

// let socket: Socket | null = null;
// let onlineUserIds = new Set<string>();
// const joinedUsers = new Set<string>();

// const SOCKET_URL = "http://localhost:4000";

// // -------------------- Types --------------------
// export interface ChatMessage {
//   id: string;
//   senderId: string;
//   receiverId: string;
//   content: string;
//   createdAt: string;
//   image?: string | null;
// }


// const unreadCounts: Record<string, number> = {};

// const incrementUnread = (senderId: string) => {
//   unreadCounts[senderId] = (unreadCounts[senderId] || 0) + 1;
//   console.log("🛎️ Updated unread counts:", unreadCounts);
// };

// export const getUnreadCount = (userId: string) => unreadCounts[userId] || 0;

// export const getAllUnreadCounts = () => ({ ...unreadCounts });

// export const resetUnread = (userId: string) => {
//   unreadCounts[userId] = 0;
//   console.log(`✅ Reset unread count for ${userId}`);
// };

// // -------------------- Socket Init --------------------
// export const getSocket = (currentUserId: string): Socket => {
//   if (!currentUserId) throw new Error("currentUserId is required");

//   if (!socket) {
//     socket = io(SOCKET_URL, {
//       transports: ["websocket"],
//       autoConnect: true,
//     });

//     socket.on("connect", () => {
//       console.log("✅ Connected to server:", socket?.id);
//       socket?.emit("join", currentUserId);
//       joinedUsers.add(currentUserId);
//       console.log("📌 Emitted join for user:", currentUserId);
//     });

//     socket.on("connect_error", (err) => {
//       console.error("⚠️ Socket connect error:", err.message);
//     });

//     socket.on("reconnect", () => {
//       console.log("🔄 Socket reconnected:", socket?.id);
//       joinedUsers.forEach((userId) => {
//         socket?.emit("join", userId);
//         console.log("📌 Re-joined user after reconnect:", userId);
//       });
//     });

//     socket.on("online-users", (ids: string[]) => {
//       onlineUserIds = new Set(ids);
//       console.log("🔥 Online users updated:", ids);
//     });

//     // Global message listener - increments unread
//     socket.on("receiveMessage", (message: ChatMessage) => {
//       console.log("🔍 Global listener received:", message);

//       const { senderId, receiverId } = message;

//       // Only count unread if the message is for me and not from me
//       if (receiverId === currentUserId && senderId !== currentUserId) {
//         incrementUnread(senderId);
//            console.log("🛎️ Updated unread counts:", getAllUnreadCounts());
//       }
//     });
//   } else if (!joinedUsers.has(currentUserId)) {
//     socket.emit("join", currentUserId);
//     joinedUsers.add(currentUserId);
//     console.log("📌 Re-emitted join for existing socket:", currentUserId);
//   }

//   return socket;
// };

// // -------------------- Subscriptions --------------------
// export const subscribeOnlineUsers = (callback: (ids: string[]) => void) => {
//   if (!socket) {
//     console.warn("⚠️ No socket available for online users subscription");
//     return () => {};
//   }

//   const handler = (ids: string[]) => {
//     onlineUserIds = new Set(ids);
//     callback(ids);
//   };

//   socket.on("online-users", handler);
//   callback(Array.from(onlineUserIds));

//   return () => {
//     socket?.off("online-users", handler);
//     console.log("🗑️ Removed online-users listener");
//   };
// };

// export const subscribeMessages = (callback: (message: ChatMessage) => void) => {
//   if (!socket) {
//     console.warn("⚠️ No socket available for messages subscription");
//     return () => {};
//   }

//   const handler = (message: ChatMessage) => {
//     console.log("📨 Message handler triggered:", message);
//     callback(message);
//   };

//   socket.on("receiveMessage", handler);
//   console.log("✅ Message listener added");

//   return () => {
//     socket?.off("receiveMessage", handler);
//     console.log("🗑️ Removed message listener");
//   };
// };

// // -------------------- Utils --------------------
// export const sendMessage = (message: ChatMessage) => {
//   if (!socket) {
//     console.error("❌ No socket available for sending message");
//     return;
//   }
//  if (!message.receiverId) {
//     console.error("❌ Cannot send message without receiverId", message);
//     return;
//   }

//   console.log("📤 Sending message:", message);
//   socket.emit("message", message);
// };

// export const leaveSocket = (currentUserId: string) => {
//   if (!socket || !currentUserId) return;
//   console.log(`🚪 Emitting leave for user: ${currentUserId}`);
//   socket.emit("leave", currentUserId);
//   joinedUsers.delete(currentUserId);
//   onlineUserIds.delete(currentUserId);
// };

// export const isUserOnline = (userId: string) => onlineUserIds.has(userId);
