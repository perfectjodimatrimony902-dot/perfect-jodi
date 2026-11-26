import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Otp } from "@/models/Otp";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email address is required to resend verification code." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectToDatabase();

    // 1. Check if user exists and is already verified
    const user = await User.findOne({ email: normalizedEmail });
    if (user && user.isVerified) {
      return NextResponse.json(
        {
          ok: false,
          error: "This email address is already verified. Please log in directly.",
        },
        { status: 400 },
      );
    }

    // 2. Check 60-second Cooldown
    const existingOtp = await Otp.findOne({ email: normalizedEmail });
    const cooldownMs = 60 * 1000;

    if (existingOtp && existingOtp.lastSentAt) {
      const elapsed = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      if (elapsed < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsed) / 1000);
        return NextResponse.json(
          {
            ok: false,
            error: `Please wait ${remainingSec} second(s) before requesting another code.`,
            remainingCooldown: remainingSec,
          },
          { status: 429 },
        );
      }
    }

    // 3. Generate new 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // 4. Update OTP record in MongoDB (preserve tempPassword if present)
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          email: normalizedEmail,
          otp: hashedOtp,
          expiresAt,
          attempts: 0,
          lastSentAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    // 5. Send OTP to user's email via Nodemailer
    try {
      await sendOtpEmail(normalizedEmail, otp, user?.name);
    } catch (emailError: unknown) {
      console.error("Nodemailer resend error:", emailError);
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to deliver verification email. Please check your email address or SMTP configuration.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: `A new 6-digit verification code has been sent to ${normalizedEmail}.`,
      cooldownSeconds: 60,
    });
  } catch (error: unknown) {
    console.error("Resend OTP error:", error);
    const msg = error instanceof Error ? error.message : "Failed to resend verification code.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
