import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";
import { getCurrentUserFromToken, signJwt, verifyJwt } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    let payload = await getCurrentUserFromToken();

    if (!payload) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        payload = verifyJwt(authHeader.substring(7));
      }
    }

    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Please log in to create your profile." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      name,
      gender,
      dob,
      heightCm,
      maritalStatus,
      religion,
      community,
      motherTongue,
      city,
      qualification,
      college,
      occupation,
      company,
      income,
      familyType,
      familyValues,
      fatherOccupation,
      motherOccupation,
      siblings,
      diet,
      smoking,
      drinking,
      hobbies,
      about,
      prefs,
      tone,
      createdBy,
    } = body;

    if (!name || !gender || !dob || !city || !religion) {
      return NextResponse.json(
        { ok: false, error: "Please fill in all mandatory profile fields." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ ok: false, error: "User account not found." }, { status: 404 });
    }

    // Check if profile already exists for this user
    let existingProfile = await Profile.findOne({ userId: user._id });

    if (existingProfile) {
      // Update existing
      Object.assign(existingProfile, {
        name,
        gender,
        dob,
        heightCm: Number(heightCm) || existingProfile.heightCm,
        maritalStatus: maritalStatus || existingProfile.maritalStatus,
        religion: religion || existingProfile.religion,
        community: community || existingProfile.community,
        motherTongue: motherTongue || existingProfile.motherTongue,
        city: city || existingProfile.city,
        qualification: qualification || existingProfile.qualification,
        college: college ?? existingProfile.college,
        occupation: occupation || existingProfile.occupation,
        company: company ?? existingProfile.company,
        income: income || existingProfile.income,
        familyType: familyType || existingProfile.familyType,
        familyValues: familyValues || existingProfile.familyValues,
        fatherOccupation: fatherOccupation ?? existingProfile.fatherOccupation,
        motherOccupation: motherOccupation ?? existingProfile.motherOccupation,
        siblings: siblings ?? existingProfile.siblings,
        diet: diet || existingProfile.diet,
        smoking: smoking || existingProfile.smoking,
        drinking: drinking || existingProfile.drinking,
        hobbies: hobbies || existingProfile.hobbies,
        about: about ?? existingProfile.about,
        prefs: prefs || existingProfile.prefs,
        tone: typeof tone === "number" ? tone : existingProfile.tone,
        createdBy: createdBy || existingProfile.createdBy,
        status: "approved",
      });
      await existingProfile.save();
    } else {
      // Create new profile
      existingProfile = await Profile.create({
        userId: user._id,
        name: name.trim(),
        gender,
        dob,
        heightCm: Number(heightCm) || 165,
        maritalStatus: maritalStatus || "Never Married",
        religion: religion || "Hindu",
        community: community || "",
        motherTongue: motherTongue || "Hindi",
        city: city || "Mumbai",
        qualification: qualification || "B.Tech",
        college: college || "",
        occupation: occupation || "Software Professional",
        company: company || "",
        income: income || "15-20 Lakhs",
        familyType: familyType || "Nuclear",
        familyValues: familyValues || "Moderate",
        fatherOccupation: fatherOccupation || "",
        motherOccupation: motherOccupation || "",
        siblings: siblings || "",
        diet: diet || "Vegetarian",
        smoking: smoking || "No",
        drinking: drinking || "No",
        hobbies: hobbies || [],
        about: about || "",
        prefs: prefs || {
          ageMin: 21,
          ageMax: 35,
          heightMin: 150,
          heightMax: 190,
          religions: [],
          locations: [],
          education: "",
          occupation: "",
          maritalStatus: ["Never Married"],
        },
        tone: typeof tone === "number" ? tone : 1,
        status: "approved",
        verified: true,
        createdBy: createdBy || user.createdBy || "Self",
      });
    }

    user.profileId = existingProfile._id;
    await user.save();

    // Re-issue JWT with updated profile
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      hasProfile: true,
      profileId: existingProfile._id.toString(),
    };

    const token = signJwt(tokenPayload);

    const response = NextResponse.json({
      ok: true,
      profile: existingProfile,
      hasProfile: true,
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
    const msg = error instanceof Error ? error.message : "Failed to create profile.";
    console.error("Create profile error:", error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
