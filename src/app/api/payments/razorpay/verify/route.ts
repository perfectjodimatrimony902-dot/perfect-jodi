import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth-helper";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";
import { Interest } from "@/models/Interest";
import { Notification } from "@/models/Notification";
import { sendConnectNotificationEmail } from "@/lib/mailer";
import { emitToUser } from "@/server/socket.js";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to verify payment." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      targetProfileId,
      targetUserId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { ok: false, error: "Missing required Razorpay payment verification fields." },
        { status: 400 },
      );
    }

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET ||
      process.env["Test Key Secret"] ||
      "o2tbdxnqybap23lHdpAeNQBi";

    if (!keySecret) {
      return NextResponse.json(
        { ok: false, error: "Razorpay Secret Key not configured on server." },
        { status: 500 },
      );
    }

    // 1. Verify Cryptographic HMAC SHA256 Signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch:", { expected: expectedSignature, received: razorpay_signature });
      return NextResponse.json(
        { ok: false, error: "Payment verification failed. Invalid cryptographic signature." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // 2. Update Payment Record to "paid"
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { returnDocument: "after" },
    );

    const senderUserId = new mongoose.Types.ObjectId(auth.userId);

    // 3. Resolve Sender Profile & User
    const [senderUser, senderProfile] = await Promise.all([
      User.findById(senderUserId),
      Profile.findOne({ userId: senderUserId }),
    ]);

    if (!senderUser || !senderProfile) {
      return NextResponse.json(
        { ok: false, error: "Sender profile not found. Please complete your profile." },
        { status: 404 },
      );
    }

    // Permanently unlock one-time connect pass on user account
    senderUser.hasPaidConnectPass = true;
    if (senderUser.membership && senderUser.membership.tier === "free") {
      senderUser.membership.tier = "gold";
    }
    await senderUser.save();

    // 4. Resolve Recipient Profile & User
    let receiverProfile = null;
    let receiverUser = null;

    if (targetProfileId && mongoose.Types.ObjectId.isValid(targetProfileId)) {
      receiverProfile = await Profile.findById(targetProfileId);
      if (!receiverProfile) {
        receiverProfile = await Profile.findOne({ userId: new mongoose.Types.ObjectId(targetProfileId) });
      }
    }

    if (!receiverProfile && targetUserId && mongoose.Types.ObjectId.isValid(targetUserId)) {
      receiverProfile = await Profile.findOne({ userId: new mongoose.Types.ObjectId(targetUserId) });
    }

    if (!receiverProfile && targetProfileId) {
      receiverProfile = await Profile.findOne({
        $or: [
          { id: targetProfileId },
          { name: new RegExp(`^${targetProfileId.replace(/[-_]/g, " ")}$`, "i") },
        ],
      });
    }

    if (receiverProfile) {
      receiverUser = await User.findById(receiverProfile.userId);
    }

    const resolvedReceiverUserId = receiverUser?._id || receiverProfile?.userId;

    // 5. Create or Update Connection Request (Interest) in MongoDB
    let interestDoc = null;
    if (receiverProfile && resolvedReceiverUserId) {
      const existingInterest = await Interest.findOne({
        senderUserId,
        receiverUserId: resolvedReceiverUserId,
      });

      if (!existingInterest) {
        interestDoc = await Interest.create({
          senderUserId,
          senderProfileId: senderProfile._id,
          receiverUserId: resolvedReceiverUserId,
          receiverProfileId: receiverProfile._id,
          status: "pending",
        });

        // 6. Create Notification in MongoDB for recipient
        const notifText = `${senderProfile.name} sent you a connection request (Connect Pass Verified).`;
        const notifDoc = await Notification.create({
          userId: resolvedReceiverUserId,
          senderId: senderUserId,
          senderProfileId: senderProfile._id,
          title: "New Connect Request Received",
          text: notifText,
          link: "/interests/received",
          kind: "interest",
          read: false,
        });

        // 7. Real-Time Socket.IO Notification to recipient
        try {
          emitToUser(resolvedReceiverUserId.toString(), "new-notification", {
            id: notifDoc._id.toString(),
            recipientUserId: resolvedReceiverUserId.toString(),
            title: "New Connect Request Received",
            text: notifText,
            link: "/interests/received",
            kind: "interest",
            senderName: senderProfile.name,
            createdAt: notifDoc.createdAt,
          });
        } catch (socketErr) {
          console.warn("Socket notification emit notice:", socketErr);
        }

        // 8. Send Email notification via SMTP
        if (receiverUser?.email) {
          try {
            await sendConnectNotificationEmail({
              toEmail: receiverUser.email,
              recipientName: receiverUser.name || receiverProfile.name,
              senderName: senderProfile.name,
              senderGender: senderProfile.gender,
              senderCity: senderProfile.city,
              senderOccupation: senderProfile.occupation,
              senderProfileUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080"}/profiles/${senderProfile._id.toString()}`,
            });
          } catch (mailErr) {
            console.warn("Email dispatch notice:", mailErr);
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Payment of ₹50 successfully verified and connect request sent!",
      payment: {
        id: payment?._id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: payment?.amount || 50,
        currency: "INR",
        status: "paid",
      },
      interestId: interestDoc?._id?.toString(),
    });
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
