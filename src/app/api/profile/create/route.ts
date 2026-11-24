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
      photoUrl,
      photos,
      heightCm,
      weightKg,
      maritalStatus,
      religion,
      community,
      subCaste,
      gotra,
      manglik,
      birthTime,
      birthPlace,
      rashi,
      nakshatra,
      motherTongue,
      languages,
      disability,
      country,
      state,
      city,
      nativePlace,
      willingToRelocate,
      qualification,
      educationLevel,
      educationField,
      college,
      employmentType,
      occupation,
      designation,
      company,
      income,
      familyType,
      familyStatus,
      familyValues,
      fatherOccupation,
      motherOccupation,
      brothersCount,
      sistersCount,
      siblings,
      aboutFamily,
      diet,
      smoking,
      drinking,
      hobbies,
      about,
      marriageTimeline,
      livingArrangement,
      childrenPreference,
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
        photoUrl: photoUrl ?? existingProfile.photoUrl ?? "",
        photos: photos ?? existingProfile.photos ?? [],
        heightCm: Number(heightCm) || existingProfile.heightCm,
        weightKg: weightKg ? Number(weightKg) : existingProfile.weightKg,
        maritalStatus: maritalStatus || existingProfile.maritalStatus,
        religion: religion || existingProfile.religion,
        community: community || existingProfile.community,
        subCaste: subCaste ?? existingProfile.subCaste,
        gotra: gotra ?? existingProfile.gotra,
        manglik: manglik ?? existingProfile.manglik,
        birthTime: birthTime ?? existingProfile.birthTime,
        birthPlace: birthPlace ?? existingProfile.birthPlace,
        rashi: rashi ?? existingProfile.rashi,
        nakshatra: nakshatra ?? existingProfile.nakshatra,
        motherTongue: motherTongue || existingProfile.motherTongue,
        languages: languages ?? existingProfile.languages,
        disability: disability ?? existingProfile.disability,
        country: country || existingProfile.country || "India",
        state: state ?? existingProfile.state,
        city: city || existingProfile.city,
        nativePlace: nativePlace ?? existingProfile.nativePlace,
        willingToRelocate: willingToRelocate ?? existingProfile.willingToRelocate,
        qualification: qualification || existingProfile.qualification,
        educationLevel: educationLevel ?? existingProfile.educationLevel,
        educationField: educationField ?? existingProfile.educationField,
        college: college ?? existingProfile.college,
        employmentType: employmentType ?? existingProfile.employmentType,
        occupation: occupation || existingProfile.occupation,
        designation: designation ?? existingProfile.designation,
        company: company ?? existingProfile.company,
        income: income || existingProfile.income,
        familyType: familyType || existingProfile.familyType,
        familyStatus: familyStatus ?? existingProfile.familyStatus,
        familyValues: familyValues || existingProfile.familyValues,
        fatherOccupation: fatherOccupation ?? existingProfile.fatherOccupation,
        motherOccupation: motherOccupation ?? existingProfile.motherOccupation,
        brothersCount:
          brothersCount !== undefined ? Number(brothersCount) : existingProfile.brothersCount,
        sistersCount:
          sistersCount !== undefined ? Number(sistersCount) : existingProfile.sistersCount,
        siblings: siblings ?? existingProfile.siblings,
        aboutFamily: aboutFamily ?? existingProfile.aboutFamily,
        diet: diet || existingProfile.diet,
        smoking: smoking || existingProfile.smoking,
        drinking: drinking || existingProfile.drinking,
        hobbies: hobbies || existingProfile.hobbies,
        about: about ?? existingProfile.about,
        marriageTimeline: marriageTimeline ?? existingProfile.marriageTimeline,
        livingArrangement: livingArrangement ?? existingProfile.livingArrangement,
        childrenPreference: childrenPreference ?? existingProfile.childrenPreference,
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
        photoUrl: photoUrl || "",
        photos: photos || [],
        heightCm: Number(heightCm) || 165,
        weightKg: weightKg ? Number(weightKg) : undefined,
        maritalStatus: maritalStatus || "Never Married",
        religion: religion || "Hindu",
        community: community || "",
        subCaste: subCaste || "",
        gotra: gotra || "",
        manglik: manglik || "",
        birthTime: birthTime || "",
        birthPlace: birthPlace || "",
        rashi: rashi || "",
        nakshatra: nakshatra || "",
        motherTongue: motherTongue || "Hindi",
        languages: languages || [],
        disability: disability || "None",
        country: country || "India",
        state: state || "",
        city: city || "Mumbai",
        nativePlace: nativePlace || "",
        willingToRelocate: willingToRelocate || "",
        qualification: qualification || "B.Tech",
        educationLevel: educationLevel || "",
        educationField: educationField || "",
        college: college || "",
        employmentType: employmentType || "",
        occupation: occupation || "Software Professional",
        designation: designation || "",
        company: company || "",
        income: income || "15-20 Lakhs",
        familyType: familyType || "Nuclear",
        familyStatus: familyStatus || "",
        familyValues: familyValues || "Moderate",
        fatherOccupation: fatherOccupation || "",
        motherOccupation: motherOccupation || "",
        brothersCount: brothersCount !== undefined ? Number(brothersCount) : 0,
        sistersCount: sistersCount !== undefined ? Number(sistersCount) : 0,
        siblings: siblings || "",
        aboutFamily: aboutFamily || "",
        diet: diet || "Vegetarian",
        smoking: smoking || "No",
        drinking: drinking || "No",
        hobbies: hobbies || [],
        about: about || "",
        marriageTimeline: marriageTimeline || "",
        livingArrangement: livingArrangement || "",
        childrenPreference: childrenPreference || "",
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
