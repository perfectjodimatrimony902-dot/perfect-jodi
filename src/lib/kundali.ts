// Vedic Kundali Ashtakoot Guna Milan (36-Point Compatibility Engine)
import type { Profile } from "./types";

export interface KootaResult {
  name: string;
  hindiName: string;
  score: number;
  maxScore: number;
  description: string;
  status: "excellent" | "good" | "poor";
}

export interface KundaliMilanResult {
  totalScore: number;
  maxScore: 36;
  percentage: number;
  verdict: "Uttam (Excellent)" | "Madhyam (Good / Auspicious)" | "Sadharan (Average)" | "Ashubh (Inauspicious)";
  isAuspicious: boolean;
  manglikStatus: {
    userAManglik: string;
    userBManglik: string;
    isCompatible: boolean;
    remark: string;
  };
  kootas: KootaResult[];
  summary: string;
}

// 12 Rashis index (0 to 11)
const RASHIS_ORDER = [
  "Mesh (Aries)",
  "Vrishabh (Taurus)",
  "Mithun (Gemini)",
  "Kark (Cancer)",
  "Simha (Leo)",
  "Kanya (Virgo)",
  "Tula (Libra)",
  "Vrishchik (Scorpio)",
  "Dhanu (Sagittarius)",
  "Makar (Capricorn)",
  "Kumbh (Aquarius)",
  "Meen (Pisces)",
];

// Clean Rashi string
function getRashiIndex(rashiStr?: string): number {
  if (!rashiStr) return 0;
  const idx = RASHIS_ORDER.findIndex((r) =>
    rashiStr.toLowerCase().includes(r.split(" ")[0].toLowerCase()),
  );
  return idx >= 0 ? idx : 0;
}

// 27 Nakshatras in order
const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

function getNakshatraIndex(nakshatraStr?: string): number {
  if (!nakshatraStr) return 0;
  const idx = NAKSHATRAS.findIndex((n) =>
    nakshatraStr.toLowerCase().includes(n.toLowerCase()),
  );
  return idx >= 0 ? idx : Math.abs(nakshatraStr.length % 27);
}

// Varna (1 Point): Brahmin (Water), Kshatriya (Fire), Vaishya (Earth), Shudra (Air)
// Rashi mapping: 3,7,11: Brahmin(4); 0,4,8: Kshatriya(3); 1,5,9: Vaishya(2); 2,6,10: Shudra(1)
function getVarna(rashiIdx: number): number {
  if ([3, 7, 11].includes(rashiIdx)) return 4; // Brahmin
  if ([0, 4, 8].includes(rashiIdx)) return 3;  // Kshatriya
  if ([1, 5, 9].includes(rashiIdx)) return 2;  // Vaishya
  return 1;                                     // Shudra
}

function calculateVarna(rashiBoy: number, rashiGirl: number): KootaResult {
  const boyVarna = getVarna(rashiBoy);
  const girlVarna = getVarna(rashiGirl);
  const score = boyVarna >= girlVarna ? 1 : 0;
  return {
    name: "Varna",
    hindiName: "वर्ण",
    score,
    maxScore: 1,
    description: score === 1 ? "Harmonious spiritual and ego compatibility" : "Potential ego friction",
    status: score === 1 ? "excellent" : "poor",
  };
}

// Vashya (2 Points): Mutual mental and attraction harmony
function calculateVashya(rashiBoy: number, rashiGirl: number): KootaResult {
  const diff = Math.abs(rashiBoy - rashiGirl);
  let score = 1;
  if (diff === 0 || diff === 4 || diff === 8) score = 2;
  else if (diff === 6) score = 0;
  return {
    name: "Vashya",
    hindiName: "वश्य",
    score,
    maxScore: 2,
    description: score === 2 ? "Strong mutual respect and natural affection" : score === 1 ? "Average emotional alignment" : "Requires active communication",
    status: score === 2 ? "excellent" : score === 1 ? "good" : "poor",
  };
}

// Tara (3 Points): Health, destiny and longevity
function calculateTara(nakBoy: number, nakGirl: number): KootaResult {
  const diff1 = ((nakGirl - nakBoy + 27) % 9);
  const diff2 = ((nakBoy - nakGirl + 27) % 9);
  const goodTaras = [1, 2, 4, 6, 8, 0];
  const ok1 = goodTaras.includes(diff1);
  const ok2 = goodTaras.includes(diff2);
  let score = 1.5;
  if (ok1 && ok2) score = 3;
  else if (!ok1 && !ok2) score = 0;
  return {
    name: "Tara",
    hindiName: "तारा",
    score,
    maxScore: 3,
    description: score >= 2 ? "Favorable destiny, auspicious wellbeing" : "Moderate destiny alignment",
    status: score >= 2 ? "excellent" : score > 0 ? "good" : "poor",
  };
}

// Yoni (4 Points): Intimacy and biological compatibility
function calculateYoni(nakBoy: number, nakGirl: number): KootaResult {
  const yoniBoy = nakBoy % 14;
  const yoniGirl = nakGirl % 14;
  let score = 2;
  if (yoniBoy === yoniGirl) score = 4;
  else if (Math.abs(yoniBoy - yoniGirl) <= 2) score = 3;
  else if (Math.abs(yoniBoy - yoniGirl) === 7) score = 0; // Enemy Yonis
  return {
    name: "Yoni",
    hindiName: "योनि",
    score,
    maxScore: 4,
    description: score >= 3 ? "Excellent biological and physical harmony" : score === 2 ? "Good physical compatibility" : "Diverse biological temperaments",
    status: score >= 3 ? "excellent" : score === 2 ? "good" : "poor",
  };
}

// Graha Maitri (5 Points): Friendship of planetary lords
function calculateGrahaMaitri(rashiBoy: number, rashiGirl: number): KootaResult {
  const diff = (rashiBoy - rashiGirl + 12) % 12;
  let score = 3;
  if ([0, 4, 8].includes(diff)) score = 5;
  else if ([2, 6, 10].includes(diff)) score = 4;
  else if ([5, 7].includes(diff)) score = 1;
  else if (diff === 1 || diff === 11) score = 0.5;
  return {
    name: "Graha Maitri",
    hindiName: "ग्रह मैत्री",
    score,
    maxScore: 5,
    description: score >= 4 ? "Deep friendship, intellectual connection and mental peace" : score >= 2 ? "Reasonable planetary friendship" : "Different communication outlooks",
    status: score >= 4 ? "excellent" : score >= 2 ? "good" : "poor",
  };
}

// Gana (6 Points): Temperament (Deva, Manushya, Rakshasa)
// Nakshatras mapped to Deva(0), Manushya(1), Rakshasa(2)
const GANA_MAP = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0];
function calculateGana(nakBoy: number, nakGirl: number): KootaResult {
  const gBoy = GANA_MAP[nakBoy % 27] ?? 0;
  const gGirl = GANA_MAP[nakGirl % 27] ?? 0;
  let score = 1;
  if (gBoy === gGirl) score = 6;
  else if ((gBoy === 0 && gGirl === 1) || (gBoy === 1 && gGirl === 0)) score = 5;
  else if (gBoy === 2 && gGirl === 0) score = 1;
  else if (gBoy === 0 && gGirl === 2) score = 0;
  return {
    name: "Gana",
    hindiName: "गण",
    score,
    maxScore: 6,
    description: score >= 5 ? "Matching behavioral habits, shared family philosophy" : score >= 2 ? "Good temperamental balance" : "Different daily routine preferences",
    status: score >= 5 ? "excellent" : score >= 2 ? "good" : "poor",
  };
}

// Bhakoot (7 Points): Prosperity, family wealth, emotional bond
function calculateBhakoot(rashiBoy: number, rashiGirl: number): KootaResult {
  const diff = (rashiBoy - rashiGirl + 12) % 12;
  // Inauspicious Bhakoot: 2/12 (diff 1 or 11), 6/8 (diff 5 or 7), 9/5 (diff 4 or 8)
  let score = 7;
  let dosha = false;
  if ([1, 11, 5, 7].includes(diff)) {
    score = 0;
    dosha = true;
  }
  return {
    name: "Bhakoot",
    hindiName: "भकूट",
    score,
    maxScore: 7,
    description: dosha ? "Bhakoot Dosha detected (consult astrologer for mitigation)" : "High prosperity, wealth growth and emotional bonding",
    status: score === 7 ? "excellent" : "poor",
  };
}

// Nadi (8 Points): Health, genetics, lineage and progeny
// 3 Nadis: 0 = Adi, 1 = Madhya, 2 = Antya
function calculateNadi(nakBoy: number, nakGirl: number): KootaResult {
  const nadiBoy = (nakBoy % 3);
  const nadiGirl = (nakGirl % 3);
  const score = nadiBoy !== nadiGirl ? 8 : 0;
  return {
    name: "Nadi",
    hindiName: "नाड़ी",
    score,
    maxScore: 8,
    description: score === 8 ? "Excellent genetic harmony and sound progeny health" : "Same Nadi detected (Nadi Dosha present)",
    status: score === 8 ? "excellent" : "poor",
  };
}

/**
 * Calculates complete 36-Point Ashtakoot Kundali Milan between two profiles.
 */
export function calculateKundaliMilan(profileA: Profile, profileB: Profile): KundaliMilanResult {
  // Determine who is groom and who is bride for traditional order (Boy, Girl)
  const isAGroom = profileA.gender === "male";
  const boy = isAGroom ? profileA : profileB;
  const girl = isAGroom ? profileB : profileA;

  const rashiBoy = getRashiIndex(boy.rashi);
  const rashiGirl = getRashiIndex(girl.rashi);
  const nakBoy = getNakshatraIndex(boy.nakshatra);
  const nakGirl = getNakshatraIndex(girl.nakshatra);

  const kootas: KootaResult[] = [
    calculateVarna(rashiBoy, rashiGirl),
    calculateVashya(rashiBoy, rashiGirl),
    calculateTara(nakBoy, nakGirl),
    calculateYoni(nakBoy, nakGirl),
    calculateGrahaMaitri(rashiBoy, rashiGirl),
    calculateGana(nakBoy, nakGirl),
    calculateBhakoot(rashiBoy, rashiGirl),
    calculateNadi(nakBoy, nakGirl),
  ];

  const totalScore = Math.round(kootas.reduce((acc, k) => acc + k.score, 0) * 10) / 10;
  const percentage = Math.round((totalScore / 36) * 100);

  // Manglik Check
  const mangA = profileA.manglik || "Non-Manglik";
  const mangB = profileB.manglik || "Non-Manglik";
  let isManglikCompatible = true;
  let manglikRemark = "Both partners have matching Non-Manglik status (Auspicious).";

  if (mangA === "Manglik" && mangB === "Manglik") {
    isManglikCompatible = true;
    manglikRemark = "Both partners are Manglik — Manglik Dosha is mutually cancelled.";
  } else if (
    (mangA === "Manglik" && mangB === "Non-Manglik") ||
    (mangA === "Non-Manglik" && mangB === "Manglik")
  ) {
    isManglikCompatible = false;
    manglikRemark = "One partner is Manglik while the other is Non-Manglik (Astrological remedies recommended).";
  } else if (mangA.includes("Anshik") || mangB.includes("Anshik")) {
    isManglikCompatible = true;
    manglikRemark = "Partial (Anshik) Manglik status detected — considered acceptable.";
  }

  // Verdict
  let verdict: KundaliMilanResult["verdict"] = "Ashubh (Inauspicious)";
  let isAuspicious = false;
  if (totalScore >= 28) {
    verdict = "Uttam (Excellent)";
    isAuspicious = true;
  } else if (totalScore >= 18) {
    verdict = "Madhyam (Good / Auspicious)";
    isAuspicious = true;
  } else if (totalScore >= 14) {
    verdict = "Sadharan (Average)";
    isAuspicious = false;
  }

  const summary = isAuspicious
    ? `${totalScore}/36 Gunas matched. This is considered an auspicious match for a long and harmonious marriage.`
    : `${totalScore}/36 Gunas matched (below 18 threshold). Family astrologer consultation recommended before proceeding.`;

  return {
    totalScore,
    maxScore: 36,
    percentage,
    verdict,
    isAuspicious,
    manglikStatus: {
      userAManglik: mangA,
      userBManglik: mangB,
      isCompatible: isManglikCompatible,
      remark: manglikRemark,
    },
    kootas,
    summary,
  };
}
