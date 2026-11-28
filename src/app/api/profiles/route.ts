import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Profile as ProfileModel } from "@/models/Profile";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const gender = searchParams.get("gender");
    const city = searchParams.get("city");

    const query: Record<string, unknown> = {
      $or: [{ status: "approved" }, { status: { $exists: false } }, { status: "" }, { status: null }],
    };
    if (gender && (gender === "male" || gender === "female")) {
      query.gender = gender;
    }
    if (city) {
      query.city = new RegExp(city, "i");
    }

    const docs = await ProfileModel.find(query).sort({ createdAt: -1 }).limit(200);

    const profiles: Profile[] = docs.map((doc) => ({
      id: doc._id.toString(),
      ownerId: doc.userId ? doc.userId.toString() : doc._id.toString(),
      name: doc.name,
      email: doc.email || "",
      mobile: doc.mobile || "",
      gender: doc.gender,
      dob: doc.dob,
      photoUrl: doc.photoUrl || "",
      photos: doc.photos || [],
      heightCm: doc.heightCm || 165,
      weightKg: doc.weightKg,
      maritalStatus: doc.maritalStatus || "Never Married",
      religion: doc.religion || "Hindu",
      community: doc.community || "",
      subCaste: doc.subCaste || "",
      gotra: doc.gotra || "",
      manglik: doc.manglik || "Non-Manglik",
      birthTime: doc.birthTime || "",
      birthPlace: doc.birthPlace || "",
      rashi: doc.rashi || "",
      nakshatra: doc.nakshatra || "",
      motherTongue: doc.motherTongue || "Hindi",
      languages: doc.languages || [],
      disability: doc.disability || "None",
      country: doc.country || "India",
      state: doc.state || "",
      city: doc.city || "Mumbai",
      nativePlace: doc.nativePlace || "",
      willingToRelocate: doc.willingToRelocate || "Flexible",
      qualification: doc.qualification || "Graduate",
      educationLevel: doc.educationLevel || "",
      educationField: doc.educationField || "",
      college: doc.college || "",
      employmentType: doc.employmentType || "",
      occupation: doc.occupation || "Professional",
      designation: doc.designation || "",
      company: doc.company || "",
      income: doc.income || "10-15 Lakhs",
      familyType: doc.familyType || "Nuclear",
      familyStatus: doc.familyStatus || "Middle class",
      familyValues: doc.familyValues || "Moderate",
      fatherOccupation: doc.fatherOccupation || "",
      motherOccupation: doc.motherOccupation || "",
      brothersCount: doc.brothersCount || 0,
      sistersCount: doc.sistersCount || 0,
      siblings: doc.siblings || "",
      aboutFamily: doc.aboutFamily || "",
      diet: doc.diet || "Vegetarian",
      smoking: doc.smoking || "No",
      drinking: doc.drinking || "No",
      hobbies: doc.hobbies || [],
      about: doc.about || "",
      marriageTimeline: doc.marriageTimeline || "6–12 months",
      livingArrangement: doc.livingArrangement || "Flexible",
      childrenPreference: doc.childrenPreference || "Yes",
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
      tone: typeof doc.tone === "number" ? doc.tone : 1,
      status: doc.status || "approved",
      verified: doc.verified ?? true,
      createdBy: doc.createdBy || "Self",
      createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    }));

    const response = NextResponse.json({
      ok: true,
      profiles,
      count: profiles.length,
    });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error: unknown) {
    console.error("Fetch profiles API error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch profiles.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
