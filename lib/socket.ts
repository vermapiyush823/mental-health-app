import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as IOServer } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
}

// This will store our IO server instance
let io: IOServer;

export function getIO() {
  return io;
}

export function initIOServer(server: any) {
  if (!io) {
    io = new IOServer(server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      }
    });
    
    // Setup socket event handlers
    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      
      // Handle joining community chat room
      socket.on("joinCommunityChat", () => {
        socket.join("community-chat");
        console.log(`${socket.id} joined community chat`);
      });
      
      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }
  
  return io;
}