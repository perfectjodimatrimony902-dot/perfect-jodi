import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";
import { signJwt } from "@/lib/jwt";
import { DEMO_ADMIN, DEMO_MEMBER } from "@/config/brand";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Please enter both email and password." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    // Handle seamless fallback for demo credentials if not yet in MongoDB
    if (!user) {
      if (normalizedEmail === DEMO_ADMIN.email.toLowerCase() && password === DEMO_ADMIN.password) {
        const hashedPassword = await bcrypt.hash(DEMO_ADMIN.password, 10);
        user = await User.create({
          name: "Administrator",
          email: DEMO_ADMIN.email.toLowerCase(),
          mobile: "9820098200",
          password: hashedPassword,
          gender: "male",
          role: "admin",
          status: "active",
        });
      } else if (
        normalizedEmail === DEMO_MEMBER.email.toLowerCase() &&
        password === DEMO_MEMBER.password
      ) {
        const hashedPassword = await bcrypt.hash(DEMO_MEMBER.password, 10);
        user = await User.create({
          name: "Rohit Sharma",
          email: DEMO_MEMBER.email.toLowerCase(),
          mobile: "9876543210",
          password: hashedPassword,
          gender: "male",
          role: "member",
          status: "active",
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No account found with this email." },
        { status: 401 },
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { ok: false, error: "This account has been suspended. Please contact support." },
        { status: 403 },
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { ok: false, error: "Account has no password set. Please reset your password." },
        { status: 400 },
      );
    }

    // Check password
    let passwordMatches = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      passwordMatches = user.password === password;
    }

    if (!passwordMatches) {
      return NextResponse.json(
        { ok: false, error: "Incorrect password. Please try again." },
        { status: 401 },
      );
    }

    // Require email verification before allowing login
    if (user.isVerified === false && user.role !== "admin") {
      return NextResponse.json(
        {
          ok: false,
          error: "Your email address is not verified yet. Please verify your email to log in.",
          needsVerification: true,
          email: user.email,
        },
        { status: 403 },
      );
    }

    // Check associated profile
    let profile = null;
    if (user.profileId) {
      profile = await Profile.findById(user.profileId);
    }
    if (!profile) {
      profile = await Profile.findOne({ userId: user._id });
      if (profile && !user.profileId) {
        user.profileId = profile._id;
        await user.save();
      }
    }

    const hasProfile = Boolean(profile);

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      hasProfile,
      profileId: profile?._id?.toString(),
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
      isVerified: user.isVerified ?? true,
      membership: user.membership,
      hasProfile,
      profileId: profile?._id?.toString(),
    };

    const response = NextResponse.json({
      ok: true,
      user: safeUser,
      profile,
      hasProfile,
      token,
    });

    response.cookies.set("pj_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Login failed.";
    console.error("Login API error:", error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
