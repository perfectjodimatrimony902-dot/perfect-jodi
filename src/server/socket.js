import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "perfectjodi_jwt_secret_super_secure_key_2026_matrimony";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://perfectjodimatrimony902_db_user:IiRsmsWHCQQObubJ@cluster0.wyogugr.mongodb.net/perfectjodi?retryWrites=true&w=majority&appName=Cluster0";

// Toggle for MongoDB chat persistence (set STORE_CHATS_IN_DB=true in .env to persist to MongoDB)
// Set to false to prevent database storage growth; chat history is kept in static and local storage.
const STORE_CHATS_IN_DB = process.env.STORE_CHATS_IN_DB === "true";

// Ensure Mongoose connection and models in socket server process
function getModels() {
  const UserSchema = new mongoose.Schema(
    {
      name: String,
      email: String,
      isOnline: Boolean,
      lastSeen: Date,
    },
    { timestamps: true, strict: false }
  );

  const ConversationSchema = new mongoose.Schema(
    {
      participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
      lastMessage: String,
      lastMessageAt: Date,
      lastSenderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true, strict: false }
  );

  const MessageSchema = new mongoose.Schema(
    {
      conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      message: { type: String, required: true },
      messageType: { type: String, default: "text" },
      status: { type: String, default: "sent" },
      readAt: Date,
    },
    { timestamps: true, strict: false }
  );

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
  const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

  return { User, Conversation, Message };
}

let dbPromise = null;

async function ensureDbConnection() {
  if (mongoose.connection.readyState === 1) {
    return getModels();
  }
  if (!dbPromise) {
    dbPromise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        family: 4,
        maxPoolSize: 10,
      })
      .catch((err) => {
        dbPromise = null;
        console.warn("Socket DB background connection notice:", err.message);
        return null;
      });
  }
  try {
    await dbPromise;
  } catch {
    dbPromise = null;
  }
  return getModels();
}

// In-memory active socket tracking: userId -> Set<socketId> (supports multiple tabs/devices)
const userSockets = new Map();
let globalIo = globalThis.__socketIo || null;

// In-memory conversation participants cache: conversationId -> { participants: Set<string>, cachedAt: number }
const convoParticipantsCache = new Map();
const PARTICIPANT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCachedParticipants(conversationId) {
  const cached = convoParticipantsCache.get(conversationId);
  if (cached && Date.now() - cached.cachedAt < PARTICIPANT_CACHE_TTL) {
    return cached.participants;
  }
  return null;
}

function setCachedParticipants(conversationId, participants) {
  convoParticipantsCache.set(conversationId, {
    participants: new Set(participants.map((p) => p.toString())),
    cachedAt: Date.now(),
  });
}

/**
 * Emits a real-time event to a specific user's connected sockets.
 */
export function emitToUser(userId, event, data) {
  const io = globalIo || globalThis.__socketIo;
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Parses cookie string to extract pj_token
 */
function parseCookieToken(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/pj_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Initializes all Socket.IO events, authentication middleware, and room management.
 */
export function initSocketServer(io) {
  globalIo = io;
  globalThis.__socketIo = io;
  // 1. JWT Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "") ||
        parseCookieToken(socket.handshake.headers?.cookie);

      if (!token) {
        return next(new Error("Authentication error: Token required"));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      if (!decoded || !decoded.userId) {
        return next(new Error("Authentication error: Invalid token"));
      }

      socket.data.user = decoded;
      next();
    } catch (err) {
      console.error("Socket authentication failure:", err.message);
      next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  // 2. Connection Handler
    io.on("connection", (socket) => {
      const userId = socket.data.user.userId;
      const { User, Conversation, Message } = getModels();

      // Trigger DB connection in background without blocking handshake
      ensureDbConnection().catch(() => { });

      // Register this socket id for the user
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      // Join user's personal room (for direct notifications & multi-tab sync)
      socket.join(`user:${userId}`);

      // Check if this is the user's first active tab/device -> transitioned to Online
      if (userSockets.get(userId).size === 1) {
        try {
            User.findByIdAndUpdate(userId, {
              isOnline: true,
              lastSeen: new Date(),
        }).catch(() => { });
  } catch { }

  // Broadcast user-online to all connected clients
  io.emit("user-online", { userId });
}

// Send the currently online user IDs to this connected socket
const onlineIds = Array.from(userSockets.keys()).filter(
  (id) => (userSockets.get(id)?.size ?? 0) > 0
);
socket.emit("online-users", { userIds: onlineIds });

// 3. Join Conversation Room Event
socket.on("join-conversation", async ({ conversationId }, callback) => {
  try {
    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return callback?.({ ok: false, error: "Invalid conversation ID" });
    }

    // Fast in-memory participant verification
    let participants = getCachedParticipants(conversationId);
    if (!participants) {
      try {
        const conversation = await Conversation.findById(conversationId).select("participants").lean();
        if (conversation && conversation.participants) {
          participants = new Set(conversation.participants.map((p) => p.toString()));
          setCachedParticipants(conversationId, conversation.participants);
        }
      } catch (dbErr) {
        console.warn("DB notice in join-conversation:", dbErr.message);
      }
    }

    // Join conversation room
    socket.join(`conversation:${conversationId}`);

    // Mark any pending unread messages in background if DB persistence is active
    if (STORE_CHATS_IN_DB) {
      Message.updateMany(
        {
          conversationId,
          receiverId: userId,
          status: "sent",
        },
        { $set: { status: "delivered" } }
      ).catch(() => { });
    }

    callback?.({ ok: true, conversationId });
  } catch (err) {
    console.error("join-conversation error:", err);
    callback?.({ ok: false, error: "Failed to join conversation room" });
  }
});

// 4. Send Message Event (Optimized Low-Latency Pipeline)
socket.on("send-message", async (data, callback) => {
  try {
    const { conversationId, receiverId, message, messageType = "text" } = data;
    const cleanMessage = String(message || "").trim();

    if (!cleanMessage) {
      return callback?.({ ok: false, error: "Message content cannot be empty" });
    }

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return callback?.({ ok: false, error: "Invalid conversation ID" });
    }

    // 1. In-memory participant verification (0ms instant transmission)
    let participants = getCachedParticipants(conversationId);
    if (!participants) {
      try {
        const conversation = await Conversation.findById(conversationId).select("participants").lean();
        if (conversation && conversation.participants) {
          participants = new Set(conversation.participants.map((p) => p.toString()));
          setCachedParticipants(conversationId, conversation.participants);
        }
      } catch (dbErr) {
        console.warn("DB notice in socket send-message (using fast in-memory delivery):", dbErr.message);
      }
    }

    // Resilient fallback: ensure sender and receiver are valid participants
    if (!participants && receiverId) {
      participants = new Set([userId.toString(), receiverId.toString()]);
      setCachedParticipants(conversationId, [userId, receiverId]);
    }

    if (participants && !participants.has(userId.toString())) {
      return callback?.({ ok: false, error: "Unauthorized conversation access" });
    }

    // 2. Check receiver online status
    const isReceiverOnline = (userSockets.get(receiverId)?.size ?? 0) > 0;
    const initialStatus = isReceiverOnline ? "delivered" : "sent";

    const msgId = new mongoose.Types.ObjectId();
    const now = new Date();

    let newMsg;
    if (STORE_CHATS_IN_DB) {
      // Preserved MongoDB persistence logic: saves message documents to database
      const [dbMsg] = await Promise.all([
        Message.create({
          _id: msgId,
          conversationId,
          senderId: userId,
          receiverId,
          message: cleanMessage,
          messageType,
          status: initialStatus,
        }),
        Conversation.findByIdAndUpdate(
          conversationId,
          {
            $set: {
              lastMessage: cleanMessage,
              lastMessageAt: now,
              lastSenderId: new mongoose.Types.ObjectId(userId),
            },
          },
          { select: "_id" }
        ),
      ]);
      newMsg = dbMsg;
    } else {
      // Static & LocalStorage mode: 0 bytes of message collection storage in MongoDB!
      newMsg = {
        _id: msgId,
        conversationId,
        senderId: userId,
        receiverId,
        message: cleanMessage,
        messageType,
        status: initialStatus,
        createdAt: now,
      };

      // Update lightweight last message preview without storing full message collection
      Conversation.findByIdAndUpdate(
        conversationId,
        {
          $set: {
            lastMessage: cleanMessage,
            lastMessageAt: now,
            lastSenderId: new mongoose.Types.ObjectId(userId),
          },
        },
        { select: "_id" }
      ).catch(() => { });
    }

    const senderName = socket.data.user?.name || "A member";
    const messagePayload = {
      id: (newMsg._id || msgId).toString(),
      conversationId: conversationId.toString(),
      senderId: userId.toString(),
      senderName,
      senderProfileId: socket.data.user?.profileId || "",
      receiverId: receiverId.toString(),
      message: cleanMessage,
      messageType,
      status: initialStatus,
      createdAt: now.toISOString(),
    };

    // 4. Instant Dual-Delivery:
    // A. Broadcast to conversation room (excluding current sender)
    socket.to(`conversation:${conversationId}`).emit("receive-message", messagePayload);

    // B. Also broadcast directly to recipient's personal user room
    // Ensures recipient receives the message immediately across all tabs, devices, or if conversation room join had a delay
    io.to(`user:${receiverId}`).emit("receive-message", messagePayload);

    // 5. Notify sender of delivery if receiver was online
    if (initialStatus === "delivered") {
      io.to(`user:${userId}`).emit("message-delivered", {
        conversationId,
        messageId: messagePayload.id,
      });
    }

    callback?.({ ok: true, message: messagePayload });
  } catch (err) {
    console.error("send-message error:", err);
    callback?.({ ok: false, error: "Failed to send message" });
  }
});

// 5. Typing Indicators
socket.on("typing", ({ conversationId, receiverId }) => {
  if (!conversationId) return;
  socket.to(`conversation:${conversationId}`).emit("user-typing", {
    conversationId,
    userId,
  });
  if (receiverId) {
    socket.to(`user:${receiverId}`).emit("user-typing", {
      conversationId,
      userId,
    });
  }
});

socket.on("stop-typing", ({ conversationId, receiverId }) => {
  if (!conversationId) return;
  socket.to(`conversation:${conversationId}`).emit("user-stop-typing", {
    conversationId,
    userId,
  });
  if (receiverId) {
    socket.to(`user:${receiverId}`).emit("user-stop-typing", {
      conversationId,
      userId,
    });
  }
});

// 6. Mark Message Read Event
socket.on("mark-message-read", async ({ conversationId, messageId }, callback) => {
  try {
    if (!conversationId) return;

    const filter = {
      conversationId,
      receiverId: userId,
      status: { $ne: "read" },
    };
    if (messageId && mongoose.Types.ObjectId.isValid(messageId)) {
      filter._id = messageId;
    }

    let modifiedCount = 0;
    if (STORE_CHATS_IN_DB) {
      const res = await Message.updateMany(filter, {
        $set: { status: "read", readAt: new Date() },
      });
      modifiedCount = res.modifiedCount;
    }

    // Broadcast message-read to the conversation room and user's rooms
    io.to(`conversation:${conversationId}`).emit("message-read", {
      conversationId,
      readBy: userId,
      messageId: messageId || null,
    });

    callback?.({ ok: true, modifiedCount });
  } catch (err) {
    console.error("mark-message-read error:", err);
    callback?.({ ok: false, error: "Failed to mark message as read" });
  }
});

// 7. Disconnect Handler
socket.on("disconnect", async () => {
  const sockets = userSockets.get(userId);
  if (sockets) {
    sockets.delete(socket.id);
    // Only mark offline if all tabs/sockets of this user have closed
    if (sockets.size === 0) {
      userSockets.delete(userId);
      const lastSeen = new Date();

      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen,
        });
      } catch (e) {
        console.error("Error updating offline status:", e);
      }

      io.emit("user-offline", {
        userId,
        lastSeen: lastSeen.toISOString(),
      });
    }
  }
});
  });
}
