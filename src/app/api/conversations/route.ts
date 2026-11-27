import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth-helper";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";

export const dynamic = "force-dynamic";

/**
 * GET /api/conversations
 * Fetch all conversations for the authenticated user, populated with recipient's profile details and unread count.
 */
export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const currentUserId = new mongoose.Types.ObjectId(auth.userId);

    // Find conversations where current user is one of the participants
    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Collect all other participant IDs to fetch in bulk
    const otherParticipantIds = new Set<string>();
    conversations.forEach((conv) => {
      conv.participants.forEach((pId) => {
        const idStr = pId.toString();
        if (idStr !== auth.userId) {
          otherParticipantIds.add(idStr);
        }
      });
    });

    const otherIdsArray = Array.from(otherParticipantIds).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Bulk fetch users and their profiles
    const [users, profiles] = await Promise.all([
      User.find({ _id: { $in: otherIdsArray } })
        .select("name email gender isOnline lastSeen profileId")
        .lean(),
      Profile.find({ userId: { $in: otherIdsArray } })
        .select("userId photoUrl photos city occupation maritalStatus name")
        .lean(),
    ]);

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const profileMap = new Map(profiles.map((p) => [p.userId?.toString(), p]));

    // Bulk fetch unread message counts for this user in each conversation
    const conversationIds = conversations.map((c) => c._id);
    const unreadAgg = await Message.aggregate([
      {
        $match: {
          conversationId: { $in: conversationIds },
          receiverId: currentUserId,
          status: { $ne: "read" },
        },
      },
      {
        $group: {
          _id: "$conversationId",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = new Map(unreadAgg.map((u) => [u._id.toString(), u.count]));

    // Format final conversations list
    const results = conversations.map((conv) => {
      const otherIdStr =
        conv.participants
          .map((p) => p.toString())
          .find((id) => id !== auth.userId) || "";

      const otherUser = userMap.get(otherIdStr);
      const otherProfile = profileMap.get(otherIdStr);

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
        : {
            id: otherIdStr,
            name: "Member",
            isOnline: false,
            photoUrl: "",
            city: "",
            occupation: "",
          };

      return {
        id: conv._id.toString(),
        recipient,
        lastMessage: conv.lastMessage || "",
        lastMessageAt: conv.lastMessageAt || conv.updatedAt || conv.createdAt,
        lastSenderId: conv.lastSenderId ? conv.lastSenderId.toString() : null,
        unreadCount: unreadMap.get(conv._id.toString()) || 0,
        createdAt: conv.createdAt,
      };
    });

    return NextResponse.json({ ok: true, conversations: results });
  } catch (error: unknown) {
    console.error("GET /api/conversations error:", error);
    const msg = error instanceof Error ? error.message : "Failed to load conversations.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/**
 * POST /api/conversations
 * Create or retrieve an existing conversation between authenticated user and another member.
 */
export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const recipientId = body.recipientId || body.participantId;

    if (!recipientId || typeof recipientId !== "string") {
      return NextResponse.json(
        { ok: false, error: "Recipient user ID is required." },
        { status: 400 }
      );
    }

    if (recipientId === auth.userId) {
      return NextResponse.json(
        { ok: false, error: "Cannot start a conversation with yourself." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if recipient exists (either as User ID or Profile ID)
    let recipientUser = await User.findById(recipientId);
    let resolvedUserId = recipientId;

    if (!recipientUser) {
      // Check if recipientId was a Profile ID
      const targetProfile = await Profile.findById(recipientId);
      if (targetProfile && targetProfile.userId) {
        resolvedUserId = targetProfile.userId.toString();
        recipientUser = await User.findById(resolvedUserId);
      }
    }

    if (!recipientUser) {
      return NextResponse.json(
        { ok: false, error: "Recipient user not found." },
        { status: 404 }
      );
    }

    const userA = new mongoose.Types.ObjectId(auth.userId);
    const userB = new mongoose.Types.ObjectId(resolvedUserId);

    // Find existing conversation with both participants (prevent duplicates)
    let conversation = await Conversation.findOne({
      participants: { $all: [userA, userB], $size: 2 },
    });

    let isNew = false;
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userA, userB],
        lastMessage: "",
        lastMessageAt: new Date(),
      });
      isNew = true;
    }

    // Fetch recipient's profile details
    const recipientProfile = await Profile.findOne({ userId: userB });

    return NextResponse.json({
      ok: true,
      isNew,
      conversation: {
        id: conversation._id.toString(),
        recipient: {
          id: recipientUser._id.toString(),
          name: recipientProfile?.name || recipientUser.name,
          gender: recipientUser.gender,
          isOnline: Boolean(recipientUser.isOnline),
          lastSeen: recipientUser.lastSeen,
          photoUrl: recipientProfile?.photoUrl || recipientProfile?.photos?.[0] || "",
          city: recipientProfile?.city || "",
          occupation: recipientProfile?.occupation || "",
          profileId: recipientProfile?._id?.toString(),
        },
        lastMessage: conversation.lastMessage || "",
        lastMessageAt: conversation.lastMessageAt || conversation.createdAt,
        createdAt: conversation.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("POST /api/conversations error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create or fetch conversation.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
