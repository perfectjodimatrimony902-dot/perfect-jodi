import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth-helper";
import { Interest } from "@/models/Interest";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";
import { sendConnectNotificationEmail } from "@/lib/mailer";
import { emitToUser } from "@/server/socket.js";

export const dynamic = "force-dynamic";

/**
 * POST /api/interests
 * Sends a connection request (interest) to a specific user profile.
 * - Stores the interest in MongoDB Atlas.
 * - Creates a persistent notification for the recipient in MongoDB.
 * - Dispatches a real-time Socket.IO notification directly to the recipient's room.
 * - Sends an email notification to the recipient via Gmail SMTP.
 */
export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Please log in to send a connection request." }, { status: 401 });
    }

    const body = await req.json();
    const { toProfileId, toUserId } = body;

    if (!toProfileId && !toUserId) {
      return NextResponse.json(
        { ok: false, error: "Target profile or user ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const senderUserId = new mongoose.Types.ObjectId(auth.userId);

    // 1. Resolve Sender Profile & User
    const [senderUser, senderProfile] = await Promise.all([
      User.findById(senderUserId),
      Profile.findOne({ userId: senderUserId }),
    ]);

    if (!senderUser) {
      return NextResponse.json({ ok: false, error: "Sender account not found." }, { status: 404 });
    }

    // 2. Resolve Recipient Profile & User
    let receiverProfile = null;
    let receiverUser = null;

    if (toProfileId && mongoose.Types.ObjectId.isValid(toProfileId)) {
      receiverProfile = await Profile.findById(toProfileId);
      if (!receiverProfile) {
        receiverProfile = await Profile.findOne({ userId: new mongoose.Types.ObjectId(toProfileId) });
      }
    }

    if (!receiverProfile && toUserId && mongoose.Types.ObjectId.isValid(toUserId)) {
      receiverProfile = await Profile.findOne({ userId: new mongoose.Types.ObjectId(toUserId) });
    }

    if (receiverProfile) {
      receiverUser = await User.findById(receiverProfile.userId);
    } else if (toUserId && mongoose.Types.ObjectId.isValid(toUserId)) {
      receiverUser = await User.findById(toUserId);
    } else if (toProfileId && mongoose.Types.ObjectId.isValid(toProfileId)) {
      receiverUser = await User.findById(toProfileId);
    }

    if (!receiverUser) {
      return NextResponse.json({ ok: false, error: "Target user not found." }, { status: 404 });
    }

    const receiverUserId = receiverUser._id;
    const receiverProfileId = receiverProfile?._id || receiverUserId;
    const senderProfileId = senderProfile?._id || senderUserId;

    // Prevent connecting with oneself
    if (senderUserId.toString() === receiverUserId.toString()) {
      return NextResponse.json(
        { ok: false, error: "You cannot send a connection request to your own profile." },
        { status: 400 }
      );
    }

    // 3. Upsert Interest record in MongoDB
    const interest = await Interest.findOneAndUpdate(
      {
        senderProfileId,
        receiverProfileId,
      },
      {
        $set: {
          senderUserId,
          senderProfileId,
          receiverUserId,
          receiverProfileId,
          status: "pending",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    const senderDisplayName = senderProfile?.name || senderUser.name || "A member";

    // 4. Create persistent Notification in MongoDB for recipient
    const notification = await Notification.create({
      userId: receiverUserId,
      senderId: senderUserId,
      senderProfileId: senderProfileId,
      title: "New Connection Request",
      text: `${senderDisplayName} sent you a connection request.`,
      link: "/interests/received",
      kind: "interest",
      read: false,
    });

    const notificationPayload = {
      id: notification._id.toString(),
      title: notification.title,
      text: notification.text,
      link: notification.link,
      kind: notification.kind,
      read: false,
      senderName: senderDisplayName,
      senderProfileId: senderProfileId.toString(),
      createdAt: notification.createdAt.toISOString(),
    };

    // 5. Emit real-time notification to recipient via Socket.IO
    try {
      emitToUser(receiverUserId.toString(), "new-notification", notificationPayload);
    } catch (socketNotice) {
      console.error("Socket notification notice:", socketNotice);
    }

    // 6. Send connection request email notification to recipient
    if (receiverUser.email) {
      try {
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080");

        const profileUrl = senderProfile
          ? `${appUrl.replace(/\/+$/, "")}/profiles/${senderProfile._id.toString()}`
          : `${appUrl.replace(/\/+$/, "")}/interests/received`;

        sendConnectNotificationEmail({
          toEmail: receiverUser.email,
          recipientName: receiverUser.name,
          senderName: senderDisplayName,
          senderGender: senderProfile?.gender || senderUser.gender,
          senderCity: senderProfile?.city || "",
          senderOccupation: senderProfile?.occupation || "",
          senderProfileUrl: profileUrl,
        }).catch((emailErr) => {
          console.error("Connect notification email delivery notice:", emailErr);
        });
      } catch (emailNotice) {
        console.error("Email dispatch notice:", emailNotice);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Connection request sent to ${receiverProfile?.name || receiverUser.name}.`,
      interest: {
        id: interest._id.toString(),
        status: interest.status,
      },
      notification: notificationPayload,
    });
  } catch (error: unknown) {
    console.error("POST /api/interests error:", error);
    const msg = error instanceof Error ? error.message : "Failed to send connection request.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/**
 * GET /api/interests
 * Fetch incoming and outgoing interests for the authenticated user.
 */
export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    const [received, sent] = await Promise.all([
      Interest.find({ receiverUserId: userId }).sort({ createdAt: -1 }).lean(),
      Interest.find({ senderUserId: userId }).sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({
      ok: true,
      received,
      sent,
    });
  } catch (error: unknown) {
    console.error("GET /api/interests error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch interests.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/interests
 * Update status of an interest (accept, decline, withdraw) and notify sender.
 */
export async function PATCH(req: Request) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { interestId, status } = await req.json();
    if (!interestId || !status) {
      return NextResponse.json({ ok: false, error: "Interest ID and status required" }, { status: 400 });
    }

    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    const interest = await Interest.findById(interestId);
    if (!interest) {
      return NextResponse.json({ ok: false, error: "Interest record not found." }, { status: 404 });
    }

    // Authorization check
    if (status === "accepted" || status === "declined") {
      if (interest.receiverUserId.toString() !== userId.toString()) {
        return NextResponse.json(
          { ok: false, error: "Only the recipient can accept or decline this interest." },
          { status: 403 }
        );
      }
    } else if (status === "withdrawn") {
      if (interest.senderUserId.toString() !== userId.toString()) {
        return NextResponse.json(
          { ok: false, error: "Only the sender can withdraw this interest." },
          { status: 403 }
        );
      }
    }

    interest.status = status;
    interest.updatedAt = new Date();
    await interest.save();

    // If accepted or declined, notify original sender via Notification & Socket.IO
    if (status === "accepted" || status === "declined") {
      try {
        const [responderUser, responderProfile] = await Promise.all([
          User.findById(userId),
          Profile.findOne({ userId }),
        ]);

        const responderName = responderProfile?.name || responderUser?.name || "A member";
        const isAccepted = status === "accepted";

        const notif = await Notification.create({
          userId: interest.senderUserId,
          senderId: userId,
          senderProfileId: responderProfile?._id || userId,
          title: isAccepted ? "Connection Request Accepted! 🎉" : "Connection Request Update",
          text: `${responderName} has ${status} your connection request.`,
          link: isAccepted ? "/messages" : "/interests/sent",
          kind: isAccepted ? "accepted" : "declined",
          read: false,
        });

        emitToUser(interest.senderUserId.toString(), "new-notification", {
          id: notif._id.toString(),
          title: notif.title,
          text: notif.text,
          link: notif.link,
          kind: notif.kind,
          read: false,
          senderName: responderName,
          createdAt: notif.createdAt.toISOString(),
        });
      } catch (notifErr) {
        console.error("Interest status response notification error:", notifErr);
      }
    }

    return NextResponse.json({
      ok: true,
      interest: {
        id: interest._id.toString(),
        status: interest.status,
      },
    });
  } catch (error: unknown) {
    console.error("PATCH /api/interests error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update interest status.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
