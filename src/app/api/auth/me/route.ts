import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";
import { Payment } from "@/models/Payment";
import { getCurrentUserFromToken, verifyJwt } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const rawCookieToken = cookieStore.get("pj_token")?.value;
    const authHeader = req.headers.get("authorization");
    const rawHeaderToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const activeToken = rawCookieToken || rawHeaderToken || "";

    let payload = await getCurrentUserFromToken();

      if (!payload && rawHeaderToken) {
        payload = verifyJwt(rawHeaderToken);
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

      // Check if user has already paid the one-time connect fee
      const hasPaid =
        Boolean(user.hasPaidConnectPass) ||
        (user.membership?.tier && user.membership.tier !== "free") ||
        Boolean(await Payment.exists({ userId: user._id, status: "paid" }));

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
          hasPaidConnectPass: hasPaid,
          hasProfile,
          profileId: profile?._id?.toString(),
        },
        profile,
        hasProfile,
        hasPaidConnectPass: hasPaid,
        token: activeToken,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch session.";
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
  }
