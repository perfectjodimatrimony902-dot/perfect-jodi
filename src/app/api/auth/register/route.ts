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
    const { name, email, mobile, password, gender, dob, createdBy } = body;

    // 1. Mandatory Fields Validation
    if (!name || !email || !mobile || !password || !gender) {
      return NextResponse.json(
        { ok: false, error: "Please fill in all required registration fields." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters long." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // 2. Prevent Multiple Registrations Using an Already Verified Email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        {
          ok: false,
          error: "An account with this email address is already registered and verified. Please log in.",
        },
        { status: 409 },
      );
    }

    // Check if mobile number is taken by an already verified user
    const existingMobileUser = await User.findOne({
      mobile: normalizedMobile,
      _id: { $ne: existingUser?._id },
    });
    if (existingMobileUser && existingMobileUser.isVerified) {
      return NextResponse.json(
        { ok: false, error: "An account with this mobile number already exists." },
        { status: 409 },
      );
    }

    // 3. Cooldown Check (60 seconds)
    const existingOtp = await Otp.findOne({ email: normalizedEmail });
    if (existingOtp && existingOtp.lastSentAt) {
      const elapsed = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsed < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsed) / 1000);
        return NextResponse.json(
          {
            ok: false,
            error: `Please wait ${remainingSec} second(s) before requesting another OTP.`,
            remainingCooldown: remainingSec,
          },
          { status: 429 },
        );
      }
    }

    // 4. Secure Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create or Update Unverified User Document
    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name.trim();
      existingUser.mobile = normalizedMobile;
      existingUser.password = hashedPassword;
      existingUser.gender = gender;
      existingUser.dob = dob || "";
      existingUser.createdBy = createdBy || "Self";
      await existingUser.save();
    } else {
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        mobile: normalizedMobile,
        password: hashedPassword,
        gender,
        dob: dob || "",
        createdBy: createdBy || "Self",
        role: "member",
        status: "active",
        isVerified: false,
        membership: { tier: "free" },
      });
    }

    // 6. Generate 6-Digit Random OTP using Node.js crypto
    const otp = crypto.randomInt(100000, 1000000).toString();

    // 7. Hash OTP before saving into MongoDB
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otp: hashedOtp,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      },
      { upsert: true, new: true },
    );

    // 8. Deliver OTP to User's Email via Nodemailer Gmail SMTP
    try {
      await sendOtpEmail(normalizedEmail, otp, name.trim());
    } catch (emailError: unknown) {
      console.error("Nodemailer error:", emailError);
      return NextResponse.json(
        {
          ok: false,
          error:
            "Failed to deliver verification email. Please verify your email address or check SMTP settings.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
      email: normalizedEmail,
    });
  } catch (error: unknown) {
    console.error("Register API error:", error);
    const msg = error instanceof Error ? error.message : "Registration failed.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
