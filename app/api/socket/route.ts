// import { NextRequest } from "next/server";
// import { Server as IOServer } from "socket.io";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// // Force Node.js runtime (not edge!)
// export const runtime = "nodejs";

// // We'll keep io in a global variable so Next.js HMR doesn't recreate it
// let io: IOServer | undefined;

// export async function GET(req: NextRequest) {
//   if (!io) {
//     console.log("🚀 Initializing Socket.IO server...");

//     // @ts-ignore - Next.js doesn't type socket server well
//     const server: any = (global as any).httpServer || req.nextUrl;

//     io = new IOServer(server, {
//       path: "/socket.io",
//       cors: {
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"],
//       },
//     });

//     io.on("connection", (socket) => {
//       console.log("✅ User connected:", socket.id);

//       socket.on("message", (msg) => {
//         console.log("📩 Received:", msg);
//         socket.broadcast.emit("message", msg);
//       });

//       socket.on("disconnect", (reason) => {
//         console.log("❌ Disconnected:", reason);
//       });
//     });

//     (global as any).io = io;
//   } else {
//     console.log("♻️ Reusing existing Socket.IO server.");
//   }

//   return new Response("Socket server is running", { status: 200 });
// }
