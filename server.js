import express from "express";
import http from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { initSocketServer } from "./src/server/socket.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "8080", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function main() {
  await app.prepare();
  const expressApp = express();
  const server = http.createServer(expressApp);

  const io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        // Dynamically allow requesting origin so credentials/cookies are accepted without CORS wildcard errors
        callback(null, true);
      },
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    },
  });

  // Attach all Socket.IO chat events & presence handlers
  initSocketServer(io);

    // Route all HTTP requests to Next.js (App Router, API routes, assets)
    expressApp.use((req, res) => {
      return handle(req, res);
    });

    server.listen(port, () => {
      console.log(`> Perfect Jodi Matrimony running on http://${hostname}:${port}`);
      console.log(`> Socket.IO active on http://${hostname}:${port}`);
    });
  }

main().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
