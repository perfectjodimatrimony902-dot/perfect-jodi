import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth-helper";
import { Message } from "@/models/Message";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/messages/:id/read
 * Mark a single message as read (id = messageId).
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: messageId } = await params;
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ ok: false, error: "Invalid message ID." }, { status: 400 });
    }

    await connectToDatabase();

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiverId: auth.userId,
        status: { $ne: "read" },
      },
      {
        $set: {
          status: "read",
          readAt: new Date(),
        },
      },
      { new: true }
    );

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "Message not found or already read." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: {
        id: message._id.toString(),
        conversationId: message.conversationId.toString(),
        status: message.status,
        readAt: message.readAt,
      },
    });
  } catch (error: unknown) {
    console.error("PATCH /api/messages/:id/read error:", error);
    const msg = error instanceof Error ? error.message : "Failed to mark message as read.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
