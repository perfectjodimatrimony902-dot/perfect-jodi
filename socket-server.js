import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { initSocketServer } from "./src/server/socket.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const port = parseInt(process.env.SOCKET_PORT || "5001", 10);
const expressApp = express();
const server = http.createServer(expressApp);

expressApp.get("/health", (req, res) => {
  res.json({ ok: true, status: "Socket.IO server active", port });
});

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

initSocketServer(io);

server.listen(port, () => {
  console.log(`> Standalone Socket.IO server running on http://localhost:${port}`);
});
