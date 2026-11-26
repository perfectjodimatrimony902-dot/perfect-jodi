import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Otp } from "@/models/Otp";
import { signJwt } from "@/lib/jwt";
import { sendWelcomeEmail, sendAdminNewUserAlert } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { ok: false, error: "Email address and 6-digit OTP code are required." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (cleanOtp.length !== 6) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid 6-digit verification code." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // 1. Fetch OTP record for this email
    const otpDoc = await Otp.findOne({ email: normalizedEmail });
    if (!otpDoc) {
      return NextResponse.json(
        {
          ok: false,
          error: "No active verification code found for this email. Please request a new code.",
        },
        { status: 400 },
      );
    }

    // 2. Check Expiration (5 minutes)
    if (new Date() > new Date(otpDoc.expiresAt)) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return NextResponse.json(
        {
          ok: false,
          error: "Verification code has expired (valid for 5 minutes). Please request a new OTP.",
          expired: true,
        },
        { status: 400 },
      );
    }

    // 3. Check Maximum Verification Attempts (Max 5 attempts)
    if (otpDoc.attempts >= 5) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return NextResponse.json(
        {
          ok: false,
          error:
            "Maximum verification attempts exceeded (5/5). For your security, this code has been invalidated. Please request a new OTP.",
          maxAttemptsExceeded: true,
        },
        { status: 429 },
      );
    }

    // 4. Verify OTP against stored hash
    const isValid = await bcrypt.compare(cleanOtp, otpDoc.otp);

    if (!isValid) {
      otpDoc.attempts += 1;
      await otpDoc.save();

      const remaining = Math.max(0, 5 - otpDoc.attempts);
      if (remaining === 0) {
        await Otp.deleteOne({ _id: otpDoc._id });
        return NextResponse.json(
          {
            ok: false,
            error:
              "Maximum verification attempts exceeded. This code has been invalidated. Please request a new OTP.",
            maxAttemptsExceeded: true,
          },
          { status: 429 },
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: `Incorrect verification code. ${remaining} attempt(s) remaining.`,
          remainingAttempts: remaining,
        },
        { status: 400 },
      );
    }

    // 5. Success: Delete OTP after successful verification
    await Otp.deleteOne({ _id: otpDoc._id });

    // 6. Complete registration and mark user as verified
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User account not found. Please register again." },
        { status: 404 },
      );
    }

    user.isVerified = true;
    await user.save();

    // 7. Deliver greeting to user & registration alert to admin (perfectjodimatrimony902@gmail.com) via SMTP
    try {
      await Promise.allSettled([
        sendWelcomeEmail({
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          gender: user.gender,
          createdBy: user.createdBy,
          createdAt: user.createdAt,
        }),
        sendAdminNewUserAlert({
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          gender: user.gender,
          createdBy: user.createdBy,
          createdAt: user.createdAt,
          userId: user._id.toString(),
        }),
      ]);
    } catch (emailNotice: unknown) {
      console.error("Email notification notice:", emailNotice);
    }

    // 8. Issue JWT authentication token
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      hasProfile: Boolean(user.profileId),
      profileId: user.profileId?.toString(),
    };

    const token = signJwt(tokenPayload);

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      gender: user.gender,
      dob: user.dob,
      createdBy: user.createdBy,
      role: user.role,
      isVerified: true,
      hasProfile: Boolean(user.profileId),
      membership: user.membership,
    };

    const response = NextResponse.json({
      ok: true,
      message: "Email verified successfully! Registration is now complete.",
      user: safeUser,
      token,
      hasProfile: Boolean(user.profileId),
    });

    response.cookies.set("pj_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Verify OTP error:", error);
    const msg = error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
