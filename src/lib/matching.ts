import type { Profile } from "./types";

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
  if (p.hobbies.length > 0) filled++;
  const prefsSet =
    p.prefs.religions.length > 0 ||
    p.prefs.locations.length > 0 ||
    p.prefs.maritalStatus.length > 0;
  if (prefsSet) filled++;
  total = Math.max(total, 1);
  return Math.round((filled / total) * 100);
}

export interface Compatibility {
  score: number;
  matched: string[];
  unmatched: string[];
}

/**
 * Demo compatibility estimate: share of my partner preferences that the other profile meets.
 * Empty preference lists count as "open to all". Not a scientific assessment.
 */
export function compatibility(me: Profile, other: Profile, now: Date = new Date()): Compatibility {
  const p = me.prefs;
  const age = ageFromDob(other.dob, now);
  const checks: [string, boolean][] = [
    [`Age ${p.ageMin}–${p.ageMax}`, age >= p.ageMin && age <= p.ageMax],
    [
      `Height ${shortHeight(p.heightMin)}–${shortHeight(p.heightMax)}`,
      other.heightCm >= p.heightMin && other.heightCm <= p.heightMax,
    ],
    ["Religion", p.religions.length === 0 || p.religions.includes(other.religion)],
    ["Location", p.locations.length === 0 || p.locations.includes(other.city)],
    ["Education", !p.education || p.education === other.qualification],
    ["Occupation", !p.occupation || p.occupation === other.occupation],
    [
      "Marital status",
      p.maritalStatus.length === 0 || p.maritalStatus.includes(other.maritalStatus),
    ],
  ];
  const matched = checks.filter(([, ok]) => ok).map(([l]) => l);
  const unmatched = checks.filter(([, ok]) => !ok).map(([l]) => l);
  return { score: Math.round((matched.length / checks.length) * 100), matched, unmatched };
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
  return list.filter((p) => {
    const age = ageFromDob(p.dob, now);
    if (f.lookingFor === "bride" && p.gender !== "female") return false;
    if (f.lookingFor === "groom" && p.gender !== "male") return false;
    if (f.ageMin && age < f.ageMin) return false;
    if (f.ageMax && age > f.ageMax) return false;
    if (f.heightMin && p.heightCm < f.heightMin) return false;
    if (f.heightMax && p.heightCm > f.heightMax) return false;
    if (f.religion && p.religion !== f.religion) return false;
    if (f.community && p.community !== f.community) return false;
    if (f.motherTongue && p.motherTongue !== f.motherTongue) return false;
    if (f.location && p.city !== f.location) return false;
    if (f.education && p.qualification !== f.education) return false;
    if (f.occupation && p.occupation !== f.occupation) return false;
    if (f.maritalStatus && p.maritalStatus !== f.maritalStatus) return false;
    if (q && !`${p.name} ${p.city} ${p.occupation} ${p.community}`.toLowerCase().includes(q))
      return false;
    return true;
  });
}

export type SortKey = "newest" | "age-asc" | "age-desc" | "completion";

export function sortProfiles(list: Profile[], sort: SortKey): Profile[] {
  const copy = [...list];
  switch (sort) {
    case "age-asc": // youngest first = latest DOB first
      return copy.sort((a, b) => b.dob.localeCompare(a.dob));
    case "age-desc":
      return copy.sort((a, b) => a.dob.localeCompare(b.dob));
    case "completion":
      return copy.sort((a, b) => profileCompletion(b) - profileCompletion(a));
    default:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

/** Approved, opposite-gender profiles ranked by the demo compatibility estimate. */
export function recommendedMatches(me: Profile, all: Profile[], now: Date = new Date()) {
  return all
    .filter((p) => p.id !== me.id && p.status === "approved" && p.gender !== me.gender)
    .map((p) => ({ profile: p, compat: compatibility(me, p, now) }))
    .sort((a, b) => b.compat.score - a.compat.score);
}
