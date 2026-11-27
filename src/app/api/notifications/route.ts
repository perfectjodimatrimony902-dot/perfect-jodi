import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth-helper";
import { Notification } from "@/models/Notification";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Fetch persistent notifications for the authenticated user from MongoDB.
 */
export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    const formatted = notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title || "Notification",
      text: n.text,
      link: n.link || "/interests/received",
      kind: n.kind || "system",
      read: Boolean(n.read),
      createdAt: n.createdAt,
    }));

    return NextResponse.json({
      ok: true,
      notifications: formatted,
      unreadCount,
    });
  } catch (error: unknown) {
    console.error("GET /api/notifications error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch notifications.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications
 * Mark all notifications as read for the authenticated user.
 */
export async function PATCH(req: Request) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    const result = await Notification.updateMany(
      {
        userId,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    return NextResponse.json({
      ok: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: unknown) {
    console.error("PATCH /api/notifications error:", error);
    const msg = error instanceof Error ? error.message : "Failed to mark notifications as read.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

