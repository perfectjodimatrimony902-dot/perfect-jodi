import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth-helper";
import { Notification } from "@/models/Notification";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/notifications/[id]/read
 * Mark a single notification as read.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid notification ID." }, { status: 400 });
    }

    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      {
        $set: { read: true },
      },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ ok: false, error: "Notification not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      notification: {
        id: notification._id.toString(),
        read: notification.read,
      },
    });
  } catch (error: unknown) {
    console.error("PATCH /api/notifications/[id]/read error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update notification.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

