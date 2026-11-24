import type { Profile } from "./types";
import { calculateKundaliMilan, type KundaliMilanResult } from "./kundali";

export function ageFromDob(dob: string, now: Date = new Date()): number {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return 0;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function formatHeight(cm: number): string {
  if (!cm) return "—";
  const totalInches = Math.round(cm / 2.54);
  return `${Math.floor(totalInches / 12)}'${totalInches % 12}" (${cm} cm)`;
}

export function shortHeight(cm: number): string {
  if (!cm) return "—";
  const totalInches = Math.round(cm / 2.54);
  return `${Math.floor(totalInches / 12)}'${totalInches % 12}"`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const COMPLETION_FIELDS: (keyof Profile)[] = [
  "name",
  "dob",
  "heightCm",
  "maritalStatus",
  "religion",
  "community",
  "motherTongue",
  "city",
  "qualification",
  "college",
  "occupation",
  "company",
  "income",
  "familyType",
  "familyValues",
  "fatherOccupation",
  "motherOccupation",
  "siblings",
  "diet",
  "smoking",
  "drinking",
  "about",
];

/** Percentage of profile sections filled in, including hobbies and partner preferences. */
export function profileCompletion(p: Profile): number {
  let filled = COMPLETION_FIELDS.filter((k) => {
    const v = p[k];
    return typeof v === "number" ? v > 0 : Boolean(v && String(v).trim());
  }).length;
  let total = COMPLETION_FIELDS.length + 2;
  if (p.hobbies && p.hobbies.length > 0) filled++;
  const prefsSet =
    p.prefs?.religions?.length > 0 ||
    p.prefs?.locations?.length > 0 ||
    p.prefs?.maritalStatus?.length > 0;
  if (prefsSet) filled++;
  total = Math.max(total, 1);
  return Math.round((filled / total) * 100);
}

export interface Compatibility {
  score: number;
  matched: string[];
  unmatched: string[];
  isMutualMatch: boolean;
  highlights: string[];
  categories: {
    preferences: number; // max 25
    community: number;   // max 20
    location: number;    // max 15
    education: number;   // max 15
    lifestyle: number;   // max 15
    astrology: number;   // max 10
  };
  kundali: KundaliMilanResult;
}

/**
 * Real-world 2-Way (Bidirectional) Compatibility Scoring Engine.
 * Evaluates preferences, community, location/relocation, education/career,
 * lifestyle/diet, and Vedic Kundali / Manglik factors.
 */
export function compatibility(me: Profile, other: Profile, now: Date = new Date()): Compatibility {
  const pA = me.prefs;
  const pB = other.prefs;
  const ageOther = ageFromDob(other.dob, now);
  const ageMe = ageFromDob(me.dob, now);

  const highlights: string[] = [];
  const matched: string[] = [];
  const unmatched: string[] = [];

  // --- 1. Partner Preferences (25 Points) ---
  let prefScore = 0;
  // Age check (User A towards User B)
  const ageMatchA = ageOther >= pA.ageMin && ageOther <= pA.ageMax;
  const ageMatchB = pB ? ageMe >= pB.ageMin && ageMe <= pB.ageMax : true;
  if (ageMatchA) {
    matched.push(`Age ${pA.ageMin}–${pA.ageMax}`);
    prefScore += 4;
  } else {
    unmatched.push(`Age`);
  }

  // Height check
  const heightMatchA = other.heightCm >= pA.heightMin && other.heightCm <= pA.heightMax;
  const heightMatchB = pB ? me.heightCm >= pB.heightMin && me.heightCm <= pB.heightMax : true;
  if (heightMatchA) {
    matched.push(`Height`);
    prefScore += 4;
  } else {
    unmatched.push(`Height`);
  }

  // Marital Status check
  const maritalMatchA = pA.maritalStatus.length === 0 || pA.maritalStatus.includes(other.maritalStatus);
  const maritalMatchB = pB ? pB.maritalStatus.length === 0 || pB.maritalStatus.includes(me.maritalStatus) : true;
  if (maritalMatchA) {
    matched.push(`Marital status`);
    prefScore += 4;
  } else {
    unmatched.push(`Marital status`);
  }

  // 2-Way check bonus
  const isMutualCriteria = ageMatchA && ageMatchB && heightMatchA && heightMatchB && maritalMatchA && maritalMatchB;
  if (isMutualCriteria) {
    prefScore += 13;
    highlights.push("2-Way Mutual Preference Match");
  } else {
    prefScore += 5;
  }

  // --- 2. Religion & Community (20 Points) ---
  let commScore = 0;
  const sameReligion = me.religion && other.religion && me.religion.toLowerCase() === other.religion.toLowerCase();
  const relPrefA = pA.religions.length === 0 || pA.religions.includes(other.religion);
  const relPrefB = !pB || pB.religions.length === 0 || pB.religions.includes(me.religion);

  if (sameReligion && relPrefA && relPrefB) {
    commScore += 12;
    matched.push("Religion");
    highlights.push(`Same Religion: ${me.religion}`);
  } else if (relPrefA) {
    commScore += 7;
    matched.push("Religion");
  } else {
    unmatched.push("Religion");
  }

  const sameCommunity = me.community && other.community && me.community.toLowerCase() === other.community.toLowerCase();
  if (sameCommunity) {
    commScore += 6;
    highlights.push(`Same Community: ${me.community}`);
  } else {
    commScore += 2;
  }

  const sameSubCaste = me.subCaste && other.subCaste && me.subCaste.toLowerCase() === other.subCaste.toLowerCase();
  if (sameSubCaste) {
    commScore += 2;
    highlights.push(`Same Sub-Caste: ${me.subCaste}`);
  }

  // --- 3. Location & Relocation (15 Points) ---
  let locScore = 0;
  const sameCity = me.city && other.city && me.city.toLowerCase() === other.city.toLowerCase();
  const sameState = me.state && other.state && me.state.toLowerCase() === other.state.toLowerCase();
  const locPrefA = pA.locations.length === 0 || pA.locations.includes(other.city);

  if (sameCity) {
    locScore += 15;
    matched.push("Location");
    highlights.push(`Lives in ${me.city}`);
  } else if (sameState) {
    locScore += 11;
    matched.push("Location");
    highlights.push(`Same State: ${me.state}`);
  } else if (other.willingToRelocate && !other.willingToRelocate.toLowerCase().includes("not willing")) {
    locScore += 10;
    matched.push("Location");
    highlights.push("Willing to Relocate");
  } else if (locPrefA) {
    locScore += 8;
    matched.push("Location");
  } else {
    locScore += 4;
    unmatched.push("Location");
  }

  // --- 4. Education & Profession (15 Points) ---
  let eduScore = 0;
  const eduPrefA = !pA.education || pA.education === other.qualification;
  if (eduPrefA) {
    eduScore += 6;
    matched.push("Education");
  } else {
    unmatched.push("Education");
  }

  const occPrefA = !pA.occupation || pA.occupation === other.occupation;
  if (occPrefA) {
    eduScore += 5;
    matched.push("Occupation");
  } else {
    unmatched.push("Occupation");
  }

  if (other.income && me.income) {
    eduScore += 4;
  }

  // --- 5. Lifestyle & Habits (15 Points) ---
  let lifeScore = 0;
  const sameDiet = me.diet && other.diet && me.diet.toLowerCase() === other.diet.toLowerCase();
  if (sameDiet) {
    lifeScore += 8;
    highlights.push(`Diet: ${me.diet}`);
  } else if (
    (me.diet === "Vegetarian" && other.diet === "Eggetarian") ||
    (me.diet === "Eggetarian" && other.diet === "Vegetarian")
  ) {
    lifeScore += 6;
  } else {
    lifeScore += 3;
  }

  const smokeMatch = me.smoking === other.smoking || (me.smoking === "No" && other.smoking === "No");
  const drinkMatch = me.drinking === other.drinking || (me.drinking === "No" && other.drinking === "No");
  if (smokeMatch) lifeScore += 3.5;
  if (drinkMatch) lifeScore += 3.5;

  // --- 6. Vedic Kundali & Manglik (10 Points) ---
  const kundali = calculateKundaliMilan(me, other);
  let astroScore = 0;
  if (kundali.manglikStatus.isCompatible) {
    astroScore += 5;
    highlights.push("Manglik Compatible");
  } else {
    astroScore += 1;
  }

  // 36 Gunas contribution (5 points proportional to 36)
  astroScore += Math.round((kundali.totalScore / 36) * 5);
  if (kundali.isAuspicious) {
    highlights.push(`${kundali.totalScore}/36 Kundali Gunas`);
  }

  // Total Score clamped between 30% and 99%
  const totalRaw = prefScore + commScore + locScore + eduScore + lifeScore + astroScore;
  const finalScore = Math.min(98, Math.max(35, Math.round(totalRaw)));

  return {
    score: finalScore,
    matched,
    unmatched,
    isMutualMatch: Boolean(isMutualCriteria && sameReligion),
    highlights,
    categories: {
      preferences: Math.min(25, Math.round(prefScore)),
      community: Math.min(20, Math.round(commScore)),
      location: Math.min(15, Math.round(locScore)),
      education: Math.min(15, Math.round(eduScore)),
      lifestyle: Math.min(15, Math.round(lifeScore)),
      astrology: Math.min(10, Math.round(astroScore)),
    },
    kundali,
  };
}

export interface ProfileFilters {
  lookingFor?: "bride" | "groom";
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  religion?: string;
  community?: string;
  motherTongue?: string;
  location?: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
  q?: string;
}

export function filterProfiles(
  list: Profile[],
  f: ProfileFilters,
  now: Date = new Date(),
): Profile[] {
  const q = f.q?.trim().toLowerCase();
  const ageMin = f.ageMin ? Number(f.ageMin) : undefined;
  const ageMax = f.ageMax ? Number(f.ageMax) : undefined;
  const heightMin = f.heightMin ? Number(f.heightMin) : undefined;
  const heightMax = f.heightMax ? Number(f.heightMax) : undefined;

  return list.filter((p) => {
    const age = ageFromDob(p.dob, now);
    if (f.lookingFor === "bride" && p.gender !== "female") return false;
    if (f.lookingFor === "groom" && p.gender !== "male") return false;

    if (ageMin !== undefined && !Number.isNaN(ageMin) && age < ageMin) return false;
    if (ageMax !== undefined && !Number.isNaN(ageMax) && age > ageMax) return false;
    if (heightMin !== undefined && !Number.isNaN(heightMin) && p.heightCm < heightMin) return false;
    if (heightMax !== undefined && !Number.isNaN(heightMax) && p.heightCm > heightMax) return false;

    if (f.religion && p.religion && p.religion.toLowerCase() !== f.religion.toLowerCase()) return false;
    if (f.community && p.community && p.community.toLowerCase() !== f.community.toLowerCase()) return false;
    if (f.motherTongue && p.motherTongue && p.motherTongue.toLowerCase() !== f.motherTongue.toLowerCase()) return false;
    if (f.location && p.city && p.city.toLowerCase() !== f.location.toLowerCase()) return false;

    if (f.education) {
      const fEdu = f.education.toLowerCase();
      const pEdu = (p.qualification || "").toLowerCase();
      if (pEdu !== fEdu && !fEdu.includes(pEdu) && !pEdu.includes(fEdu)) {
        return false;
      }
    }

    if (f.occupation) {
      const fOcc = f.occupation.toLowerCase();
      const pOcc = (p.occupation || "").toLowerCase();
      if (pOcc !== fOcc && !fOcc.includes(pOcc) && !pOcc.includes(fOcc)) {
        return false;
      }
    }

    if (f.maritalStatus && p.maritalStatus && p.maritalStatus.toLowerCase() !== f.maritalStatus.toLowerCase()) return false;

    if (q) {
      const blob = `${p.name} ${p.city} ${p.state || ""} ${p.nativePlace || ""} ${p.occupation} ${p.designation || ""} ${p.company || ""} ${p.community} ${p.subCaste || ""} ${p.religion} ${p.qualification}`.toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      const allWordsMatch = words.every((w) => blob.includes(w));
      if (!allWordsMatch) return false;
    }

    return true;
  });
}

export type SortKey = "newest" | "age-asc" | "age-desc" | "completion";

export function sortProfiles(list: Profile[], sort: SortKey): Profile[] {
  const copy = [...list];
  switch (sort) {
    case "age-asc":
      return copy.sort((a, b) => b.dob.localeCompare(a.dob));
    case "age-desc":
      return copy.sort((a, b) => a.dob.localeCompare(b.dob));
    case "completion":
      return copy.sort((a, b) => profileCompletion(b) - profileCompletion(a));
    default:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

/** Base candidate list: approved, opposite-gender profiles excluding oneself. */
function getEligibleCandidates(me: Profile, all: Profile[]) {
  return all.filter((p) => p.id !== me.id && p.status === "approved" && p.gender !== me.gender);
}

/** 1. Daily Top Recommendations (Sorted by total compatibility). */
export function recommendedMatches(me: Profile, all: Profile[], now: Date = new Date()) {
  return getEligibleCandidates(me, all)
    .map((p) => ({ profile: p, compat: compatibility(me, p, now) }))
    .sort((a, b) => b.compat.score - a.compat.score);
}
export const getDailyMatches = recommendedMatches;

/** 2. 2-Way Mutual Matches (Both partners meet each other's criteria). */
export function getMutualMatches(me: Profile, all: Profile[], now: Date = new Date()) {
  return recommendedMatches(me, all, now).filter((m) => m.compat.isMutualMatch);
}

/** 3. Near You Matches (Living in same city, state, or nearby). */
export function getNearMeMatches(me: Profile, all: Profile[], now: Date = new Date()) {
  const myCity = me.city.toLowerCase();
  const myState = me.state?.toLowerCase() || "";
  return recommendedMatches(me, all, now).filter(
    (m) =>
      m.profile.city.toLowerCase() === myCity ||
      (myState && m.profile.state?.toLowerCase() === myState),
  );
}

/** 4. Kundali & Astro Matches (Auspicious 18+ Gunas & Manglik harmony). */
export function getKundaliMatches(me: Profile, all: Profile[], now: Date = new Date()) {
  return recommendedMatches(me, all, now).filter(
    (m) => m.compat.kundali.isAuspicious && m.compat.kundali.manglikStatus.isCompatible,
  );
}

/** 5. Reverse Matches (Profiles whose preferences specifically match you). */
export function getReverseMatches(me: Profile, all: Profile[], now: Date = new Date()) {
  const myAge = ageFromDob(me.dob, now);
  return recommendedMatches(me, all, now).filter((m) => {
    const pB = m.profile.prefs;
    if (!pB) return true;
    const ageOk = myAge >= pB.ageMin && myAge <= pB.ageMax;
    const heightOk = me.heightCm >= pB.heightMin && me.heightCm <= pB.heightMax;
    const relOk = pB.religions.length === 0 || pB.religions.includes(me.religion);
    return ageOk && heightOk && relOk;
  });
}
