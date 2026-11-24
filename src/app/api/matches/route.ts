import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Profile as ProfileModel } from "@/models/Profile";
import { getCurrentUserFromToken, verifyJwt } from "@/lib/jwt";
import { compatibility } from "@/lib/matching";
import type { Profile } from "@/lib/types";

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
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Please log in to view matches." },
        { status: 401 },
      );
    }

    await connectToDatabase();

    // Fetch logged in user's profile
    const myProfileDoc = await ProfileModel.findOne({ userId: payload.userId });
    if (!myProfileDoc) {
      return NextResponse.json(
        { ok: false, error: "Please complete your profile first to view matches." },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "daily"; // daily | mutual | near_me | kundali | reverse
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

    // Convert Mongoose doc to plain Profile format
    const myProfile: Profile = {
      id: myProfileDoc._id.toString(),
      ownerId: myProfileDoc.userId.toString(),
      name: myProfileDoc.name,
      gender: myProfileDoc.gender,
      dob: myProfileDoc.dob,
      heightCm: myProfileDoc.heightCm,
      weightKg: myProfileDoc.weightKg,
      maritalStatus: myProfileDoc.maritalStatus,
      religion: myProfileDoc.religion,
      community: myProfileDoc.community,
      subCaste: myProfileDoc.subCaste,
      gotra: myProfileDoc.gotra,
      manglik: myProfileDoc.manglik,
      birthTime: myProfileDoc.birthTime,
      birthPlace: myProfileDoc.birthPlace,
      rashi: myProfileDoc.rashi,
      nakshatra: myProfileDoc.nakshatra,
      motherTongue: myProfileDoc.motherTongue,
      languages: myProfileDoc.languages,
      disability: myProfileDoc.disability,
      country: myProfileDoc.country,
      state: myProfileDoc.state,
      city: myProfileDoc.city,
      nativePlace: myProfileDoc.nativePlace,
      willingToRelocate: myProfileDoc.willingToRelocate,
      qualification: myProfileDoc.qualification,
      educationLevel: myProfileDoc.educationLevel,
      educationField: myProfileDoc.educationField,
      college: myProfileDoc.college || "",
      employmentType: myProfileDoc.employmentType,
      occupation: myProfileDoc.occupation,
      designation: myProfileDoc.designation,
      company: myProfileDoc.company || "",
      income: myProfileDoc.income,
      familyType: myProfileDoc.familyType,
      familyStatus: myProfileDoc.familyStatus,
      familyValues: myProfileDoc.familyValues,
      fatherOccupation: myProfileDoc.fatherOccupation || "",
      motherOccupation: myProfileDoc.motherOccupation || "",
      brothersCount: myProfileDoc.brothersCount,
      sistersCount: myProfileDoc.sistersCount,
      siblings: myProfileDoc.siblings || "",
      aboutFamily: myProfileDoc.aboutFamily,
      diet: myProfileDoc.diet,
      smoking: myProfileDoc.smoking,
      drinking: myProfileDoc.drinking,
      hobbies: myProfileDoc.hobbies || [],
      about: myProfileDoc.about,
      marriageTimeline: myProfileDoc.marriageTimeline,
      livingArrangement: myProfileDoc.livingArrangement,
      childrenPreference: myProfileDoc.childrenPreference,
      prefs: myProfileDoc.prefs || {
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
      tone: myProfileDoc.tone,
      status: myProfileDoc.status,
      verified: myProfileDoc.verified,
      createdBy: myProfileDoc.createdBy as any,
      createdAt: myProfileDoc.createdAt ? myProfileDoc.createdAt.toISOString() : new Date().toISOString(),
    };

    // Query candidates from MongoDB
    const oppositeGender = myProfile.gender === "male" ? "female" : "male";
    const candidateDocs = await ProfileModel.find({
      gender: oppositeGender,
      status: "approved",
      _id: { $ne: myProfileDoc._id },
    }).limit(100);

    const scoredMatches = candidateDocs.map((doc) => {
      const p: Profile = {
        id: doc._id.toString(),
        ownerId: doc.userId.toString(),
        name: doc.name,
        gender: doc.gender,
        dob: doc.dob,
        photoUrl: doc.photoUrl || "",
        photos: doc.photos || [],
        heightCm: doc.heightCm,
        weightKg: doc.weightKg,
        maritalStatus: doc.maritalStatus,
        religion: doc.religion,
        community: doc.community,
        subCaste: doc.subCaste,
        gotra: doc.gotra,
        manglik: doc.manglik,
        birthTime: doc.birthTime,
        birthPlace: doc.birthPlace,
        rashi: doc.rashi,
        nakshatra: doc.nakshatra,
        motherTongue: doc.motherTongue,
        languages: doc.languages,
        disability: doc.disability,
        country: doc.country,
        state: doc.state,
        city: doc.city,
        nativePlace: doc.nativePlace,
        willingToRelocate: doc.willingToRelocate,
        qualification: doc.qualification,
        educationLevel: doc.educationLevel,
        educationField: doc.educationField,
        college: doc.college || "",
        employmentType: doc.employmentType,
        occupation: doc.occupation,
        designation: doc.designation,
        company: doc.company || "",
        income: doc.income,
        familyType: doc.familyType,
        familyStatus: doc.familyStatus,
        familyValues: doc.familyValues,
        fatherOccupation: doc.fatherOccupation || "",
        motherOccupation: doc.motherOccupation || "",
        brothersCount: doc.brothersCount,
        sistersCount: doc.sistersCount,
        siblings: doc.siblings || "",
        aboutFamily: doc.aboutFamily,
        diet: doc.diet,
        smoking: doc.smoking,
        drinking: doc.drinking,
        hobbies: doc.hobbies || [],
        about: doc.about,
        marriageTimeline: doc.marriageTimeline,
        livingArrangement: doc.livingArrangement,
        childrenPreference: doc.childrenPreference,
        prefs: doc.prefs || {
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
        tone: doc.tone,
        status: doc.status,
        verified: doc.verified,
        createdBy: doc.createdBy as any,
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
      };

      const compat = compatibility(myProfile, p);
      return { profile: p, compat };
    });

    // Filter by type
    let filtered = scoredMatches;
    if (type === "mutual") {
      filtered = scoredMatches.filter((m) => m.compat.isMutualMatch);
    } else if (type === "near_me") {
      const myCity = myProfile.city.toLowerCase();
      const myState = myProfile.state?.toLowerCase() || "";
      filtered = scoredMatches.filter(
        (m) =>
          m.profile.city.toLowerCase() === myCity ||
          (myState && m.profile.state?.toLowerCase() === myState),
      );
    } else if (type === "kundali") {
      filtered = scoredMatches.filter(
        (m) => m.compat.kundali.isAuspicious && m.compat.kundali.manglikStatus.isCompatible,
      );
    }

    // Sort by compatibility score
    filtered.sort((a, b) => b.compat.score - a.compat.score);

    return NextResponse.json({
      ok: true,
      type,
      totalCount: filtered.length,
      matches: filtered.slice(0, limit),
      myProfile,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to compute matches.";
    console.error("Matches API error:", error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
