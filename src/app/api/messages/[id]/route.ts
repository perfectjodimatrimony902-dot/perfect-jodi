import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth-helper";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";

export const dynamic = "force-dynamic";

// Toggle for MongoDB chat persistence (set STORE_CHATS_IN_DB=true in .env to persist to MongoDB)
// Set to false to prevent database storage growth; chat history is kept in static and local storage.
const STORE_CHATS_IN_DB = process.env.STORE_CHATS_IN_DB === "true";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/messages/:id
 * Fetch messages for a specific conversation (id = conversationId) with pagination.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json({ ok: false, error: "Invalid conversation ID." }, { status: 400 });
    }

    await connectToDatabase();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ ok: false, error: "Conversation not found." }, { status: 404 });
    }

    // Verify authorized access
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === auth.userId
    );
    if (!isParticipant) {
      return NextResponse.json({ ok: false, error: "Access denied." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const skip = (page - 1) * limit;

    // Fetch messages in descending order then reverse for chronological display
    const rawMessages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Message.countDocuments({ conversationId });

    // Reverse to chronological order (oldest -> newest)
    const messages = rawMessages.reverse().map((m) => ({
      id: m._id.toString(),
      conversationId: m.conversationId.toString(),
      senderId: m.senderId.toString(),
      receiverId: m.receiverId.toString(),
      message: m.message,
      messageType: m.messageType,
      status: m.status,
      readAt: m.readAt,
      createdAt: m.createdAt,
    }));

    // Find other participant for header details
    const otherParticipantId = conversation.participants
      .map((p) => p.toString())
      .find((id) => id !== auth.userId);

    let otherUser = null;
    let otherProfile = null;

    if (otherParticipantId) {
      [otherUser, otherProfile] = await Promise.all([
        User.findById(otherParticipantId).select("name email gender isOnline lastSeen").lean(),
        Profile.findOne({ userId: otherParticipantId }).select("name photoUrl photos city occupation").lean(),
      ]);
    }

    const recipient = otherUser
      ? {
        id: otherUser._id.toString(),
        name: otherProfile?.name || otherUser.name,
        gender: otherUser.gender,
        isOnline: Boolean(otherUser.isOnline),
        lastSeen: otherUser.lastSeen,
        photoUrl: otherProfile?.photoUrl || otherProfile?.photos?.[0] || "",
        city: otherProfile?.city || "",
        occupation: otherProfile?.occupation || "",
        profileId: otherProfile?._id?.toString(),
      }
      : null;

    return NextResponse.json({
      ok: true,
      messages,
      recipient,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore: skip + rawMessages.length < totalCount,
      },
    });
  } catch (error: unknown) {
    const isNetworkError =
      error instanceof Error &&
      (error.name === "MongoServerSelectionError" ||
        error.name === "MongoNetworkError" ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("timed out"));

    if (isNetworkError) {
      console.warn("MongoDB connection warning in GET /api/messages/:id (using local cache):", error.message);
      return NextResponse.json({
        ok: true,
        messages: [],
        recipient: null,
        fromCache: true,
      });
    }

    console.error("GET /api/messages/:id error:", error);
    const msg = error instanceof Error ? error.message : "Failed to load messages.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/**
 * POST /api/messages/:id
 * Send a message via REST endpoint (id = conversationId).
 * Acts as high-reliability fallback when WebSocket is connecting or offline.
 */
export async function POST(req: Request, { params }: RouteParams) {
  let activeUserId = "";
  let targetConvoId = "";

  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    activeUserId = auth.userId;

    const { id: conversationId } = await params;
    targetConvoId = conversationId;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json({ ok: false, error: "Invalid conversation ID." }, { status: 400 });
    }

    const body = await req.json();
    const { message, messageType = "text", receiverId } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { ok: false, error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ ok: false, error: "Conversation not found." }, { status: 404 });
    }

    // Verify authorized access
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === auth.userId
    );
    if (!isParticipant) {
      return NextResponse.json({ ok: false, error: "Access denied." }, { status: 403 });
    }

    // Resolve recipient user ID
    const resolvedReceiverId =
      receiverId ||
      conversation.participants.map((p) => p.toString()).find((id) => id !== auth.userId);

    if (!resolvedReceiverId) {
      return NextResponse.json(
        { ok: false, error: "Recipient could not be resolved." },
        { status: 400 }
      );
    }

    const senderUser = await User.findById(auth.userId).select("name").lean();
    const now = new Date();
    let formattedMsg;

    if (STORE_CHATS_IN_DB) {
      // Preserved MongoDB persistence logic
      const newMsg = await Message.create({
        conversationId: new mongoose.Types.ObjectId(conversationId),
        senderId: new mongoose.Types.ObjectId(auth.userId),
        receiverId: new mongoose.Types.ObjectId(resolvedReceiverId),
        message: message.trim(),
        messageType,
        status: "sent",
      });

      formattedMsg = {
        id: newMsg._id.toString(),
        conversationId: newMsg.conversationId.toString(),
        senderId: newMsg.senderId.toString(),
        senderName: senderUser?.name || "A member",
        receiverId: newMsg.receiverId.toString(),
        message: newMsg.message,
        messageType: newMsg.messageType,
        status: newMsg.status,
        createdAt: newMsg.createdAt.toISOString(),
      };
    } else {
      // Static / In-memory mode: zero database space consumed
      formattedMsg = {
        id: new mongoose.Types.ObjectId().toString(),
        conversationId: conversationId.toString(),
        senderId: auth.userId.toString(),
        senderName: senderUser?.name || "A member",
        receiverId: resolvedReceiverId.toString(),
        message: message.trim(),
        messageType,
        status: "sent",
        createdAt: now.toISOString(),
      };
    }

    // Update conversation metadata
    conversation.lastMessage = message.trim();
    conversation.lastMessageAt = now;
    conversation.lastSenderId = new mongoose.Types.ObjectId(auth.userId);
    await conversation.save().catch(() => { });

    // Emit in real time to recipient via Socket.IO if available
    try {
      const { emitToUser } = await import("@/server/socket.js");
      emitToUser(resolvedReceiverId.toString(), "receive-message", formattedMsg);
    } catch (socketNotice) {
      console.warn("Socket notification notice:", socketNotice);
    }

    return NextResponse.json({
      ok: true,
      message: formattedMsg,
    });
  } catch (error: unknown) {
    const isNetworkError =
      error instanceof Error &&
      (error.name === "MongoServerSelectionError" ||
        error.name === "MongoNetworkError" ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("timed out"));

    if (isNetworkError) {
      console.warn("MongoDB connection warning in POST /api/messages/:id:", error.message);
      if (!STORE_CHATS_IN_DB) {
        const now = new Date();
        const fallbackMsg = {
          id: new mongoose.Types.ObjectId().toString(),
          conversationId: targetConvoId,
          senderId: activeUserId || "user",
          senderName: "A member",
          receiverId: "",
          message: "",
          messageType: "text",
          status: "sent",
          createdAt: now.toISOString(),
        };
        return NextResponse.json({
          ok: true,
          message: fallbackMsg,
          fromStaticCache: true,
        });
      }
      return NextResponse.json(
        { ok: false, error: "Database is temporarily reconnecting. Please retry in a moment." },
        { status: 503 }
      );
    }

    console.error("POST /api/messages/:id error:", error);
    const msg = error instanceof Error ? error.message : "Failed to send message.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
