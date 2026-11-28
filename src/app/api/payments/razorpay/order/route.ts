import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth-helper";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json(
        { ok: false, error: "Please log in to proceed with payment." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { targetProfileId, amount = 50 } = body;

    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env["Test API Key"] ||
      "rzp_test_U5A02XYovdkEqP";

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET ||
      process.env["Test Key Secret"] ||
      "o2tbdxnqybap23lHdpAeNQBi";

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { ok: false, error: "Razorpay credentials are not configured on server." },
        { status: 500 },
      );
    }

    await connectToDatabase();

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ ok: false, error: "User account not found." }, { status: 404 });
    }

    const myProfile = await Profile.findOne({ userId: auth.userId });

    // Amount in paise (e.g. 50 INR = 5000 paise)
    const amountInPaise = Math.round(Number(amount) * 100);
    const receiptId = `rcpt_${auth.userId.toString().slice(-6)}_${Date.now()}`;

    // Call Razorpay API to create order
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          userId: auth.userId,
          profileId: myProfile?._id?.toString() || "",
          targetProfileId: targetProfileId || "",
          purpose: "connect_request",
        },
      }),
    });

    if (!rzpRes.ok) {
      const errData = await rzpRes.json().catch(() => ({}));
      console.error("Razorpay order creation error:", errData);
      return NextResponse.json(
        { ok: false, error: errData?.error?.description || "Failed to create Razorpay payment order." },
        { status: rzpRes.status },
      );
    }

    const orderData = await rzpRes.json();

    // Persist pending payment in MongoDB
    await Payment.create({
      userId: user._id,
      profileId: myProfile?._id?.toString() || "",
      targetProfileId: targetProfileId || "",
      razorpayOrderId: orderData.id,
      amount: Number(amount),
      currency: "INR",
      status: "created",
      purpose: "connect_request",
      receipt: receiptId,
      notes: orderData.notes || {},
    });

    return NextResponse.json({
      ok: true,
      orderId: orderData.id,
      amount: orderData.amount, // in paise
      currency: orderData.currency,
      keyId,
      user: {
        name: user.name,
        email: user.email,
        phone: user.mobile || "",
      },
    });
  } catch (error: any) {
    console.error("Razorpay order route error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
