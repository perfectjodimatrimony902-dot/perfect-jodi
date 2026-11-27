import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Check localStorage
  try {
    const lsToken = localStorage.getItem("pj_token") || localStorage.getItem("pj_jwt_token");
    if (lsToken) return lsToken;
  } catch {
    // ignore storage access issues
  }

  // 2. Check document.cookie for pj_token
  try {
    const match = document.cookie.match(/pj_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  } catch {
    // ignore cookie access issues
  }

  return null;
}

/**
 * Returns or initializes the singleton Socket.IO connection.
 */
export function getSocket(customToken?: string): Socket | null {
  if (typeof window === "undefined") return null;

  const token = customToken || getToken();

  // If socket already exists, reuse it and update auth token if provided
  if (socketInstance) {
    if (token && socketInstance.auth) {
      (socketInstance.auth as Record<string, unknown>).token = token;
      if (!socketInstance.connected && !socketInstance.active) {
        socketInstance.connect();
      }
    }
    return socketInstance;
  }

  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:8080");

  socketInstance = io(socketUrl, {
    auth: token ? { token } : undefined,
    withCredentials: true,
    transports: ["websocket", "polling"],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 2000,
    timeout: 4000,
  });

  socketInstance.on("connect", () => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Socket.IO] Connected successfully with ID:", socketInstance?.id);
    }
  });

  let triedFallbackPort = false;
  socketInstance.on("connect_error", (err) => {
    // If primary port 8080 timed out or was unreachable on localhost, try standalone port 5001
    if (
      !triedFallbackPort &&
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
      socketUrl.includes(":8080") &&
      (err.message.includes("timeout") || err.message.includes("xhr poll error") || err.message.includes("websocket error"))
    ) {
      triedFallbackPort = true;
      try {
        socketInstance?.disconnect();
        socketInstance = io("http://localhost:5001", {
          auth: token ? { token } : undefined,
          withCredentials: true,
          transports: ["websocket", "polling"],
          upgrade: true,
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 500,
          reconnectionDelayMax: 2000,
          timeout: 4000,
        });
        return;
      } catch { }
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn("[Socket.IO] Connection notice:", err.message);
    }
  });

  return socketInstance;
}

/**
 * Explicitly disconnects the current socket instance (e.g. on logout).
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
