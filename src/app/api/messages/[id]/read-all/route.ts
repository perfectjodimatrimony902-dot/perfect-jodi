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
 * PATCH /api/messages/:id/read-all
 * Mark all unread messages in conversation (id = conversationId) as read by current user.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
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

    const result = await Message.updateMany(
      {
        conversationId,
        receiverId: auth.userId,
        status: { $ne: "read" },
      },
      {
        $set: {
          status: "read",
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      ok: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: unknown) {
    console.error("PATCH /api/messages/:id/read-all error:", error);
    const msg = error instanceof Error ? error.message : "Failed to mark messages as read.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
