import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signJwt } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, mobile, password, gender, dob, createdBy } = body;

    if (!name || !email || !mobile || !password || !gender) {
      return NextResponse.json(
        { ok: false, error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json(
          { ok: false, error: "An account with this email address already exists." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { ok: false, error: "An account with this mobile number already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      password: hashedPassword,
      gender,
      dob: dob || "",
      createdBy: createdBy || "Self",
      role: "member",
      status: "active",
      membership: { tier: "free" },
    });

    const tokenPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      hasProfile: false,
    };

    const token = signJwt(tokenPayload);

    const safeUser = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      gender: newUser.gender,
      dob: newUser.dob,
      createdBy: newUser.createdBy,
      role: newUser.role,
      hasProfile: false,
      membership: newUser.membership,
    };

    const response = NextResponse.json({
      ok: true,
      user: safeUser,
      token,
      hasProfile: false,
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
    const msg = error instanceof Error ? error.message : "Registration failed.";
    console.error("Register API error:", error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
