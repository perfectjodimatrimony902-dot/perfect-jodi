import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";
import { getCurrentUserFromToken, verifyJwt } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    let payload = await getCurrentUserFromToken();

    if (!payload) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        payload = verifyJwt(authHeader.substring(7));
      }
    }

    if (!payload) {
      return NextResponse.json({ ok: false, user: null, profile: null }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return NextResponse.json({ ok: false, user: null, profile: null }, { status: 404 });
    }

    let profile = null;
    if (user.profileId) {
      profile = await Profile.findById(user.profileId);
    }
    if (!profile) {
      profile = await Profile.findOne({ userId: user._id });
    }

    const hasProfile = Boolean(profile);

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        dob: user.dob,
        role: user.role,
        membership: user.membership,
        hasProfile,
        profileId: profile?._id?.toString(),
      },
      profile,
      hasProfile,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch session.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
