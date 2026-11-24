import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
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
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const profile = await Profile.findOne({ userId: payload.userId });

    return NextResponse.json({
      ok: true,
      profile,
      hasProfile: Boolean(profile),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch profile.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
