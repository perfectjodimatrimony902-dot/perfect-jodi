import { NextResponse } from "next/server";
import { calculateKundaliMilan } from "@/lib/kundali";
import type { Profile } from "@/lib/types";

// Standard coordinates for major Indian cities
const INDIAN_CITIES_COORDS: Record<string, { lat: number; lng: number }> = {
  mumbai: { lat: 19.076, lng: 72.8777 },
  pune: { lat: 18.5204, lng: 73.8567 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  aurangabad: { lat: 19.8762, lng: 75.3433 },
  chhatrapati_sambhajinagar: { lat: 19.8762, lng: 75.3433 },
  kolhapur: { lat: 16.705, lng: 74.2433 },
  thane: { lat: 19.2183, lng: 72.9781 },
  solapur: { lat: 17.6599, lng: 75.9064 },
  delhi: { lat: 28.7041, lng: 77.1025 },
  "new delhi": { lat: 28.6139, lng: 77.209 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  surat: { lat: 21.1702, lng: 72.8311 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  indore: { lat: 22.7196, lng: 75.8577 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  patna: { lat: 25.5941, lng: 85.1376 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  rajkot: { lat: 22.3039, lng: 70.8022 },
  goa: { lat: 15.2993, lng: 74.124 },
};

function getCityCoordinates(place?: string): { lat: number; lng: number } {
  if (!place) return { lat: 19.076, lng: 72.8777 }; // Default Mumbai
  const normalized = place.toLowerCase().trim();
  for (const [key, coords] of Object.entries(INDIAN_CITIES_COORDS)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }
  return { lat: 19.076, lng: 72.8777 };
}

function parseBirthData(profile: Profile) {
  const d = new Date(profile.dob || "1996-01-01");
  const [hours, minutes] = (profile.birthTime || "12:00").split(":").map(Number);
  const coords = getCityCoordinates(profile.birthPlace || profile.city);

  return {
    year: isNaN(d.getFullYear()) ? 1996 : d.getFullYear(),
    month: isNaN(d.getMonth()) ? 1 : d.getMonth() + 1,
    date: isNaN(d.getDate()) ? 1 : d.getDate(),
    hours: isNaN(hours) ? 12 : hours,
    minutes: isNaN(minutes) ? 0 : minutes,
    seconds: 0,
    latitude: coords.lat,
    longitude: coords.lng,
    timezone: 5.5, // IST
  };
}

// In-memory cache to save daily API credits (500/day)
const matchCache = new Map<string, any>();

export async function POST(req: Request) {
  try {
    const { boy, girl }: { boy: Profile; girl: Profile } = await req.json();

    if (!boy || !girl) {
      return NextResponse.json(
        { ok: false, error: "Both boy and girl profile records are required" },
        { status: 400 },
      );
    }

    const cacheKey = `${boy.id || boy.name}_${girl.id || girl.name}`;
    if (matchCache.has(cacheKey)) {
      return NextResponse.json({ ok: true, ...matchCache.get(cacheKey), fromCache: true });
    }

    const apiKey = process.env.FreeAstrologyAPI || process.env.FREE_ASTROLOGY_API_KEY;

    if (apiKey) {
      try {
        const payload = {
          male: parseBirthData(boy),
          female: parseBirthData(girl),
          config: {
            ayanamsha: "lahiri",
          },
        };

        const apiRes = await fetch("https://json.freeastrologyapi.com/match-making/ashtakoot-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(payload),
        });

        if (apiRes.ok) {
          const json = await apiRes.json();
          const out = json.output;

          if (out && typeof out.total_score === "number") {
            const totalScore = Number(out.total_score);
            const isAuspicious = totalScore >= 18;

            let verdict: "Uttam (Excellent)" | "Madhyam (Good / Auspicious)" | "Sadharan (Average)" | "Ashubh (Inauspicious)" =
              "Ashubh (Inauspicious)";
            if (totalScore >= 28) verdict = "Uttam (Excellent)";
            else if (totalScore >= 18) verdict = "Madhyam (Good / Auspicious)";
            else if (totalScore >= 14) verdict = "Sadharan (Average)";

            // Build structured 8 Kootas array with Hindi names and rich descriptions
            const kootas = [
              {
                name: "Varna",
                hindiName: "वर्ण",
                score: out.varna_kootam?.score ?? 0,
                maxScore: out.varna_kootam?.out_of ?? 1,
                status: (out.varna_kootam?.score ?? 0) >= 1 ? ("excellent" as const) : ("poor" as const),
                description:
                  (out.varna_kootam?.score ?? 0) >= 1
                    ? `Harmonious spiritual alignment (${out.varna_kootam?.groom?.varnam_name || "Groom"} & ${out.varna_kootam?.bride?.varnam_name || "Bride"})`
                    : "Difference in spiritual/ego temperaments; mutual respect advised.",
                details: {
                  groom: `${out.varna_kootam?.groom?.varnam_name || "—"} (${out.varna_kootam?.groom?.moon_sign || "—"})`,
                  bride: `${out.varna_kootam?.bride?.varnam_name || "—"} (${out.varna_kootam?.bride?.moon_sign || "—"})`,
                },
              },
              {
                name: "Vashya",
                hindiName: "वश्य",
                score: out.vasya_kootam?.score ?? 0,
                maxScore: out.vasya_kootam?.out_of ?? 2,
                status: (out.vasya_kootam?.score ?? 0) >= 1.5 ? ("excellent" as const) : (out.vasya_kootam?.score ?? 0) >= 1 ? ("good" as const) : ("poor" as const),
                description:
                  (out.vasya_kootam?.score ?? 0) >= 1.5
                    ? "Strong mutual attraction, dominance balance, and magnetic bonding."
                    : "Moderate mutual influence and relationship adjustment required.",
                details: {
                  groom: out.vasya_kootam?.groom?.groom_kootam_name || "—",
                  bride: out.vasya_kootam?.bride?.bride_kootam_name || "—",
                },
              },
              {
                name: "Tara",
                hindiName: "तारा",
                score: out.tara_kootam?.score ?? 0,
                maxScore: out.tara_kootam?.out_of ?? 3,
                status: (out.tara_kootam?.score ?? 0) >= 2 ? ("excellent" as const) : (out.tara_kootam?.score ?? 0) >= 1.5 ? ("good" as const) : ("poor" as const),
                description:
                  (out.tara_kootam?.score ?? 0) >= 2
                    ? `Auspicious birth star destiny (${out.tara_kootam?.groom?.star_name || "—"} & ${out.tara_kootam?.bride?.star_name || "—"})`
                    : "Average destiny and longevity synergy.",
                details: {
                  groom: out.tara_kootam?.groom?.star_name || "—",
                  bride: out.tara_kootam?.bride?.star_name || "—",
                },
              },
              {
                name: "Yoni",
                hindiName: "योनि",
                score: out.yoni_kootam?.score ?? 0,
                maxScore: out.yoni_kootam?.out_of ?? 4,
                status: (out.yoni_kootam?.score ?? 0) >= 3 ? ("excellent" as const) : (out.yoni_kootam?.score ?? 0) >= 2 ? ("good" as const) : ("poor" as const),
                description:
                  (out.yoni_kootam?.score ?? 0) >= 3
                    ? `Natural biological, intimate affinity and sexual chemistry (${out.yoni_kootam?.groom?.yoni || "—"} & ${out.yoni_kootam?.bride?.yoni || "—"})`
                    : `Biological harmony: ${out.yoni_kootam?.groom?.yoni || "Groom"} & ${out.yoni_kootam?.bride?.yoni || "Bride"}`,
                details: {
                  groom: out.yoni_kootam?.groom?.yoni || "—",
                  bride: out.yoni_kootam?.bride?.yoni || "—",
                },
              },
              {
                name: "Graha Maitri",
                hindiName: "ग्रह मैत्री",
                score: out.graha_maitri_kootam?.score ?? 0,
                maxScore: out.graha_maitri_kootam?.out_of ?? 5,
                status: (out.graha_maitri_kootam?.score ?? 0) >= 4 ? ("excellent" as const) : (out.graha_maitri_kootam?.score ?? 0) >= 2.5 ? ("good" as const) : ("poor" as const),
                description:
                  (out.graha_maitri_kootam?.score ?? 0) >= 3
                    ? `Deep mental friendship & worldview alignment between Lords (${out.graha_maitri_kootam?.groom?.moon_sign_lord_name || "—"} & ${out.graha_maitri_kootam?.bride?.moon_sign_lord_name || "—"})`
                    : "Differences in emotional outlook; communication practices recommended.",
                details: {
                  groom: `${out.graha_maitri_kootam?.groom?.moon_sign_lord_name || "—"} (${out.graha_maitri_kootam?.groom?.moon_sign || "—"})`,
                  bride: `${out.graha_maitri_kootam?.bride?.moon_sign_lord_name || "—"} (${out.graha_maitri_kootam?.bride?.moon_sign || "—"})`,
                },
              },
              {
                name: "Gana",
                hindiName: "गण",
                score: out.gana_kootam?.score ?? 0,
                maxScore: out.gana_kootam?.out_of ?? 6,
                status: (out.gana_kootam?.score ?? 0) >= 5 ? ("excellent" as const) : (out.gana_kootam?.score ?? 0) >= 3 ? ("good" as const) : ("poor" as const),
                description:
                  (out.gana_kootam?.score ?? 0) >= 4
                    ? `Harmonious behavioral temperament and mutual wavelength (${out.gana_kootam?.groom?.groom_nadi_name || "—"} & ${out.gana_kootam?.bride?.bride_nadi_name || "—"})`
                    : "Distinct personality styles; balance between flexibility and assertiveness required.",
                details: {
                  groom: out.gana_kootam?.groom?.groom_nadi_name || "—",
                  bride: out.gana_kootam?.bride?.bride_nadi_name || "—",
                },
              },
              {
                name: "Bhakoot",
                hindiName: "भकूट",
                score: out.rasi_kootam?.score ?? 0,
                maxScore: out.rasi_kootam?.out_of ?? 7,
                status: (out.rasi_kootam?.score ?? 0) >= 7 ? ("excellent" as const) : ("poor" as const),
                description:
                  (out.rasi_kootam?.score ?? 0) >= 7
                    ? `Auspicious domestic prosperity, marital longevity, and emotional fulfillment.`
                    : "Bhakoot Dosha observed; common in Vedic charts, mitigated by Graha Maitri and mutual maturity.",
                details: {
                  groom: out.rasi_kootam?.groom?.moon_sign_name || "—",
                  bride: out.rasi_kootam?.bride?.moon_sign_name || "—",
                },
              },
              {
                name: "Nadi",
                hindiName: "नाडी",
                score: out.nadi_kootam?.score ?? 0,
                maxScore: out.nadi_kootam?.out_of ?? 8,
                status: (out.nadi_kootam?.score ?? 0) === 8 ? ("excellent" as const) : ("poor" as const),
                description:
                  (out.nadi_kootam?.score ?? 0) === 8
                    ? `Flawless genetic compatibility, vital health, and auspicious progeny prospects (${out.nadi_kootam?.groom?.nadi_name || "—"} & ${out.nadi_kootam?.bride?.nadi_name || "—"}).`
                    : "Same Nadi (Nadi Dosha); consult family astrologer for traditional Sankalp or Mahamrityunjaya japa.",
                details: {
                  groom: out.nadi_kootam?.groom?.nadi_name || "—",
                  bride: out.nadi_kootam?.bride?.nadi_name || "—",
                },
              },
            ];

            // Manglik analysis based on profiles
            const boyManglik = (boy.manglik || "Non-Manglik").toLowerCase();
            const girlManglik = (girl.manglik || "Non-Manglik").toLowerCase();
            const isBoyM = boyManglik.includes("manglik") && !boyManglik.includes("non");
            const isGirlM = girlManglik.includes("manglik") && !girlManglik.includes("non");
            const manglikCompatible = (isBoyM && isGirlM) || (!isBoyM && !isGirlM) || boyManglik.includes("anshik") || girlManglik.includes("anshik");

            const manglikRemark = manglikCompatible
              ? isBoyM && isGirlM
                ? "Both partners are Manglik — Dosha naturally cancels out (Auspicious)."
                : "Both partners are Non-Manglik — Natural harmonious planetary peace."
              : "Partial Manglik variance — Astrological consultation suggested for remedies.";

            // Complete Astrological Profiles for BOTH individuals
            const astroProfiles = {
              groom: {
                name: boy.name,
                gender: "Male (वर)",
                dob: boy.dob,
                birthTime: boy.birthTime || "Not Specified",
                birthPlace: boy.birthPlace || boy.city || "Not Specified",
                manglik: boy.manglik || "Non-Manglik",
                rashi: out.rasi_kootam?.groom?.moon_sign_name || boy.rashi || "—",
                nakshatra: out.tara_kootam?.groom?.star_name || boy.nakshatra || "—",
                rashiLord: out.graha_maitri_kootam?.groom?.moon_sign_lord_name || "—",
                varna: out.varna_kootam?.groom?.varnam_name || "—",
                vashya: out.vasya_kootam?.groom?.groom_kootam_name || "—",
                yoni: out.yoni_kootam?.groom?.yoni || "—",
                gana: out.gana_kootam?.groom?.groom_nadi_name || "—",
                nadi: out.nadi_kootam?.groom?.nadi_name || "—",
              },
              bride: {
                name: girl.name,
                gender: "Female (वधू)",
                dob: girl.dob,
                birthTime: girl.birthTime || "Not Specified",
                birthPlace: girl.birthPlace || girl.city || "Not Specified",
                manglik: girl.manglik || "Non-Manglik",
                rashi: out.rasi_kootam?.bride?.moon_sign_name || girl.rashi || "—",
                nakshatra: out.tara_kootam?.bride?.star_name || girl.nakshatra || "—",
                rashiLord: out.graha_maitri_kootam?.bride?.moon_sign_lord_name || "—",
                varna: out.varna_kootam?.bride?.varnam_name || "—",
                vashya: out.vasya_kootam?.bride?.bride_kootam_name || "—",
                yoni: out.yoni_kootam?.bride?.yoni || "—",
                gana: out.gana_kootam?.bride?.bride_nadi_name || "—",
                nadi: out.nadi_kootam?.bride?.nadi_name || "—",
              },
            };

            const result = {
              source: "FreeAstrologyAPI (Live Vedic Calculation)",
              totalScore,
              maxScore: 36,
              percentage: Math.round((totalScore / 36) * 100),
              verdict,
              isAuspicious,
              summary: isAuspicious
                ? `${totalScore}/36 Ashtakoot Gunas matched. Auspicious union blessed with longevity and happiness.`
                : `${totalScore}/36 Ashtakoot Gunas matched. Astrological remedial guidance recommended prior to marriage.`,
              manglikStatus: {
                userAManglik: boy.manglik || "Non-Manglik",
                userBManglik: girl.manglik || "Non-Manglik",
                isCompatible: manglikCompatible,
                remark: manglikRemark,
              },
              kootas,
              astroProfiles,
              doshas: {
                nadiDosha: (out.nadi_kootam?.score ?? 0) === 0,
                bhakootDosha: (out.rasi_kootam?.score ?? 0) === 0,
                manglikDosha: !manglikCompatible,
              },
              remedies: [
                (out.nadi_kootam?.score ?? 0) === 0 ? "Nadi Dosha Remedy: Mahamrityunjaya Mantra chant or gold donation." : null,
                (out.rasi_kootam?.score ?? 0) === 0 ? "Bhakoot Dosha Remedy: Lord Shiva Puja or Gopal Sahasranama recital." : null,
                !manglikCompatible ? "Mangal Dosha Remedy: Kumbh Vivah or Hanuman Chalisa recital on Tuesdays." : null,
              ].filter(Boolean),
            };

            // Store in cache (limit 200 items)
            if (matchCache.size > 200) matchCache.clear();
            matchCache.set(cacheKey, result);

            return NextResponse.json({ ok: true, ...result });
          }
        }
      } catch (apiError) {
        console.warn("FreeAstrologyAPI execution error, falling back to local engine:", apiError);
      }
    }

    // Seamless Fallback
    const fallback = calculateKundaliMilan(boy, girl);
    const fallbackProfiles = {
      groom: {
        name: boy.name,
        gender: "Male (वर)",
        dob: boy.dob,
        birthTime: boy.birthTime || "Not Specified",
        birthPlace: boy.birthPlace || boy.city || "Not Specified",
        manglik: boy.manglik || "Non-Manglik",
        rashi: boy.rashi || "Mesh (Aries)",
        nakshatra: boy.nakshatra || "Ashwini",
        rashiLord: "Mars",
        varna: "Kshatriya",
        vashya: "Chatushpada",
        yoni: "Ashwa",
        gana: "Deva",
        nadi: "Adi",
      },
      bride: {
        name: girl.name,
        gender: "Female (वधू)",
        dob: girl.dob,
        birthTime: girl.birthTime || "Not Specified",
        birthPlace: girl.birthPlace || girl.city || "Not Specified",
        manglik: girl.manglik || "Non-Manglik",
        rashi: girl.rashi || "Kanya (Virgo)",
        nakshatra: girl.nakshatra || "Hasta",
        rashiLord: "Mercury",
        varna: "Vaishya",
        vashya: "Manava",
        yoni: "Mahisha",
        gana: "Deva",
        nadi: "Madhya",
      },
    };

    return NextResponse.json({
      ok: true,
      source: "Local Vedic Engine (Offline Fallback)",
      ...fallback,
      astroProfiles: fallbackProfiles,
      doshas: {
        nadiDosha: false,
        bhakootDosha: false,
        manglikDosha: !fallback.manglikStatus.isCompatible,
      },
      remedies: [],
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
