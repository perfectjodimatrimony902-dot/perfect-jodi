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

// -------------------------------------------------------------
// SINGLE PERSON KUNDALI ANALYSIS ENGINE (एकल जन्म पत्रिका)
// -------------------------------------------------------------

export interface SingleKundaliInput {
  name: string;
  gender: "male" | "female";
  dob: string; // YYYY-MM-DD
  birthTime?: string; // e.g. "10:30 AM" or "14:15"
  birthPlace?: string;
  city?: string;
  manglik?: string;
  rashi?: string;
  nakshatra?: string;
}

export interface SingleKundaliResult {
  personal: {
    name: string;
    gender: "male" | "female";
    genderLabel: string;
    dob: string;
    formattedDob: string;
    birthTime: string;
    formattedBirthTime: string;
    birthPlace: string;
    dayOfWeek: string;
  };
  astrology: {
    rashi: string;
    rashiHindi: string;
    rashiLord: string;
    rashiElement: string;
    rashiSymbol: string;
    nakshatra: string;
    nakshatraHindi: string;
    nakshatraLord: string;
    pada: number;
    lagna: string;
    lagnaLord: string;
    sunSign: string;
    varna: string;
    vashya: string;
    yoni: string;
    gana: string;
    nadi: string;
  };
  manglikStatus: {
    status: string;
    isManglik: boolean;
    isAnshik: boolean;
    severity: "None" | "Low" | "Medium" | "High";
    title: string;
    description: string;
    remedies: string[];
  };
  luckyAttributes: {
    gemstone: string;
    gemstoneHindi: string;
    metal: string;
    colors: string[];
    numbers: number[];
    favorableDays: string[];
    favorableDirection: string;
    friendlyRashis: string[];
  };
  traits: {
    strengths: string[];
    temperament: string;
    marriageAdvice: string;
    careerAptitude: string;
  };
}

/** Robust parser for any 12h AM/PM or 24h time string */
export function parseTimeTo24h(timeStr?: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 12, minutes: 0 };
  const str = timeStr.trim();
  const ampmMatch = str.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = parseInt(ampmMatch[2], 10);
    const isPm = ampmMatch[3].toLowerCase() === "pm";
    if (h === 12) h = isPm ? 12 : 0;
    else if (isPm) h += 12;
    return { hours: isNaN(h) ? 12 : h, minutes: isNaN(m) ? 0 : m };
  }
  const parts = str.split(":");
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return {
      hours: isNaN(h) ? 12 : h,
      minutes: isNaN(m) ? 0 : m,
    };
  }
  return { hours: 12, minutes: 0 };
}

/** Formats any time string into clean "hh:mm AM/PM" */
export function formatTime12h(timeStr?: string): string {
  const { hours, minutes } = parseTimeTo24h(timeStr);
  const period = hours >= 12 ? "PM" : "AM";
  let h12 = hours % 12;
  if (h12 === 0) h12 = 12;
  return `${h12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export const RASHI_DETAILS = [
  {
    name: "Mesh (Aries)",
    hindi: "मेष",
    lord: "Mars (मंगळ)",
    element: "Fire (अग्नी)",
    symbol: "Ram (मेंढा)",
    gemstone: "Red Coral (रक्त पोवळे)",
    gemstoneHindi: "रक्त पोवळे",
    metal: "Copper / Gold",
    colors: ["Red", "Saffron", "Golden Yellow"],
    numbers: [9, 1, 4],
    days: ["Tuesday (मंगळवार)", "Sunday (रविवार)"],
    direction: "East (पूर्व)",
    friendlyRashis: ["Simha (Leo)", "Dhanu (Sagittarius)", "Mithun (Gemini)"],
    varna: "Kshatriya (क्षत्रिय)",
    vashya: "Chatushpada (चतुष्पद)",
    strengths: ["Bold, energetic, leadership-driven, courageous, authentic and passionate"],
    temperament: "Dynamic and enthusiastic; values honesty and straightforward communication in marriage.",
    careerAptitude: "Engineering, defense, administration, technology, entrepreneurship, sports.",
  },
  {
    name: "Vrishabh (Taurus)",
    hindi: "वृषभ",
    lord: "Venus (शुक्र)",
    element: "Earth (पृथ्वी)",
    symbol: "Bull (बैल)",
    gemstone: "Diamond / White Sapphire (हिरा)",
    gemstoneHindi: "हिरा",
    metal: "Silver / Platinum",
    colors: ["White", "Pink", "Lotus Blue"],
    numbers: [6, 5, 8],
    days: ["Friday (शुक्रवार)", "Wednesday (बुधवार)"],
    direction: "South (दक्षिण)",
    friendlyRashis: ["Kanya (Virgo)", "Makar (Capricorn)", "Kark (Cancer)"],
    varna: "Vaishya (वैश्य)",
    vashya: "Chatushpada (चतुष्पद)",
    strengths: ["Patient, reliable, devoted, grounded, aesthetic appreciation and steadfast loyalty"],
    temperament: "Calm and affectionate; seeks long-term stability, comfort, and peaceful domestic harmony.",
    careerAptitude: "Finance, banking, design, architecture, arts, luxury goods, agriculture.",
  },
  {
    name: "Mithun (Gemini)",
    hindi: "मिथुन",
    lord: "Mercury (बुध)",
    element: "Air (वायू)",
    symbol: "Twins (युगल)",
    gemstone: "Emerald (पाचू)",
    gemstoneHindi: "पाचू",
    metal: "Bronze / Brass",
    colors: ["Emerald Green", "Mint", "Yellow"],
    numbers: [5, 3, 7],
    days: ["Wednesday (बुधवार)", "Thursday (गुरुवार)"],
    direction: "West (पश्चिम)",
    friendlyRashis: ["Tula (Libra)", "Kumbh (Aquarius)", "Mesh (Aries)"],
    varna: "Shudra (शूद्र)",
    vashya: "Manava (मानव)",
    strengths: ["Intelligent, witty, articulate, adaptable, intellectually curious and lively"],
    temperament: "Sociable and mentally agile; thrives with an intellectually stimulating partner who values conversation.",
    careerAptitude: "Software, journalism, communications, marketing, analytics, teaching.",
  },
  {
    name: "Kark (Cancer)",
    hindi: "कर्क",
    lord: "Moon (चंद्र)",
    element: "Water (जल)",
    symbol: "Crab (कर्क)",
    gemstone: "Natural Pearl (मोती)",
    gemstoneHindi: "मोती",
    metal: "Silver (चांदी)",
    colors: ["Pearl White", "Silver", "Cream"],
    numbers: [2, 7, 9],
    days: ["Monday (सोमवार)", "Thursday (गुरुवार)"],
    direction: "North (उत्तर)",
    friendlyRashis: ["Vrishchik (Scorpio)", "Meen (Pisces)", "Vrishabh (Taurus)"],
    varna: "Brahmin (ब्राह्मण)",
    vashya: "Jalachara (जलचर)",
    strengths: ["Empathetic, caring, deeply intuitive, family-oriented and nurturing"],
    temperament: "Emotionally deep and protective; marriage is centered on family devotion, tenderness, and mutual care.",
    careerAptitude: "Healthcare, education, culinary, psychology, HR, public relations.",
  },
  {
    name: "Simha (Leo)",
    hindi: "सिंह",
    lord: "Sun (सूर्य)",
    element: "Fire (अग्नी)",
    symbol: "Lion (सिंह)",
    gemstone: "Ruby (माणिक)",
    gemstoneHindi: "माणिक",
    metal: "Gold / Copper",
    colors: ["Golden", "Ruby Red", "Orange"],
    numbers: [1, 4, 9],
    days: ["Sunday (रविवार)", "Tuesday (मंगळवार)"],
    direction: "East (पूर्व)",
    friendlyRashis: ["Mesh (Aries)", "Dhanu (Sagittarius)", "Tula (Libra)"],
    varna: "Kshatriya (क्षत्रिय)",
    vashya: "Vanachara (वनचर)",
    strengths: ["Magnanimous, charismatic, noble, protective, generous and self-assured"],
    temperament: "Warm-hearted and proud; values mutual respect, admiration, and uplifting partner goals.",
    careerAptitude: "Leadership, corporate management, government service, politics, creative arts.",
  },
  {
    name: "Kanya (Virgo)",
    hindi: "कन्या",
    lord: "Mercury (बुध)",
    element: "Earth (पृथ्वी)",
    symbol: "Virgin (कन्या)",
    gemstone: "Emerald (पाचू)",
    gemstoneHindi: "पाचू",
    metal: "Bronze",
    colors: ["Dark Green", "Olive", "White"],
    numbers: [5, 2, 6],
    days: ["Wednesday (बुधवार)", "Friday (शुक्रवार)"],
    direction: "South (दक्षिण)",
    friendlyRashis: ["Vrishabh (Taurus)", "Makar (Capricorn)", "Kark (Cancer)"],
    varna: "Vaishya (वैश्य)",
    vashya: "Manava (मानव)",
    strengths: ["Analytical, methodical, dutiful, organized, helpful and thoughtful"],
    temperament: "Gentle and sincere; shows love through practical support, care, and attention to family well-being.",
    careerAptitude: "Accountancy, medicine, research, data science, law, quality management.",
  },
  {
    name: "Tula (Libra)",
    hindi: "तुळ",
    lord: "Venus (शुक्र)",
    element: "Air (वायू)",
    symbol: "Scales (तराजू)",
    gemstone: "Diamond / White Zircon (हिरा)",
    gemstoneHindi: "हिरा",
    metal: "Silver / White Gold",
    colors: ["Light Blue", "Pastel Pink", "White"],
    numbers: [6, 5, 8],
    days: ["Friday (शुक्रवार)", "Saturday (शनिवार)"],
    direction: "West (पश्चिम)",
    friendlyRashis: ["Mithun (Gemini)", "Kumbh (Aquarius)", "Simha (Leo)"],
    varna: "Shudra (शूद्र)",
    vashya: "Manava (मानव)",
    strengths: ["Charming, diplomatic, fair-minded, harmonious and refined taste"],
    temperament: "Peace-loving and romantic; thrives in an egalitarian partnership built on balance, harmony, and mutual respect.",
    careerAptitude: "Law, judiciary, diplomacy, public relations, fashion, interior design.",
  },
  {
    name: "Vrishchik (Scorpio)",
    hindi: "वृश्चिक",
    lord: "Mars / Ketu (मंगळ)",
    element: "Water (जल)",
    symbol: "Scorpion (विंचू)",
    gemstone: "Red Coral (पोवळे)",
    gemstoneHindi: "पोवळे",
    metal: "Copper / Brass",
    colors: ["Deep Red", "Maroon", "Rust"],
    numbers: [9, 1, 3],
    days: ["Tuesday (मंगळवार)", "Thursday (गुरुवार)"],
    direction: "North (उत्तर)",
    friendlyRashis: ["Kark (Cancer)", "Meen (Pisces)", "Kanya (Virgo)"],
    varna: "Brahmin (ब्राह्मण)",
    vashya: "Keeta (कीट)",
    strengths: ["Intense, intuitive, resilient, profoundly loyal and determined"],
    temperament: "Deeply loyal and passionate; values unwavering trust, emotional intimacy, and truthfulness.",
    careerAptitude: "Research, investigation, surgery, defense, psychology, data intelligence.",
  },
  {
    name: "Dhanu (Sagittarius)",
    hindi: "धनु",
    lord: "Jupiter (गुरू)",
    element: "Fire (अग्नी)",
    symbol: "Archer (धनुर्धर)",
    gemstone: "Yellow Sapphire (पुष्कराज)",
    gemstoneHindi: "पुष्कराज",
    metal: "Gold (सुवर्ण)",
    colors: ["Yellow", "Saffron", "Royal Blue"],
    numbers: [3, 9, 7],
    days: ["Thursday (गुरुवार)", "Sunday (रविवार)"],
    direction: "East (पूर्व)",
    friendlyRashis: ["Mesh (Aries)", "Simha (Leo)", "Kumbh (Aquarius)"],
    varna: "Kshatriya (क्षत्रिय)",
    vashya: "Manava / Chatushpada",
    strengths: ["Philosophical, optimistic, generous, upright, scholarly and broad-minded"],
    temperament: "Cheerful and expansive; appreciates growth, shared spiritual or philosophical values, and open horizons.",
    careerAptitude: "Higher education, law, philosophy, international business, publishing, tourism.",
  },
  {
    name: "Makar (Capricorn)",
    hindi: "मकर",
    lord: "Saturn (शनी)",
    element: "Earth (पृथ्वी)",
    symbol: "Sea-Goat (मकर)",
    gemstone: "Blue Sapphire (नीलम)",
    gemstoneHindi: "नीलम",
    metal: "Iron / Lead",
    colors: ["Navy Blue", "Charcoal Grey", "Black"],
    numbers: [8, 6, 4],
    days: ["Saturday (शनिवार)", "Friday (शुक्रवार)"],
    direction: "South (दक्षिण)",
    friendlyRashis: ["Vrishabh (Taurus)", "Kanya (Virgo)", "Meen (Pisces)"],
    varna: "Vaishya (वैश्य)",
    vashya: "Jalachara / Chatushpada",
    strengths: ["Disciplined, responsible, persevering, pragmatic and dependable"],
    temperament: "Reliable and mature; expresses devotion through steadfast commitment, family security, and lasting loyalty.",
    careerAptitude: "Civil services, engineering, architecture, corporate leadership, banking.",
  },
  {
    name: "Kumbh (Aquarius)",
    hindi: "कुंभ",
    lord: "Saturn / Rahu (शनी)",
    element: "Air (वायू)",
    symbol: "Water-Bearer (कुंभ)",
    gemstone: "Blue Sapphire / Amethyst (नीलम / जांभळा)",
    gemstoneHindi: "नीलम",
    metal: "Iron / Lead",
    colors: ["Electric Blue", "Cyan", "Purple"],
    numbers: [8, 4, 7],
    days: ["Saturday (शनिवार)", "Wednesday (बुधवार)"],
    direction: "West (पश्चिम)",
    friendlyRashis: ["Mithun (Gemini)", "Tula (Libra)", "Dhanu (Sagittarius)"],
    varna: "Shudra (शूद्र)",
    vashya: "Manava (मानव)",
    strengths: ["Visionary, humanitarian, independent, progressive and intellectually honest"],
    temperament: "Free-thinking and egalitarian; respects personal individuality while sharing deep friendship in marriage.",
    careerAptitude: "Science, high-tech, social enterprise, innovation, aviation, research.",
  },
  {
    name: "Meen (Pisces)",
    hindi: "मीन",
    lord: "Jupiter (गुरू)",
    element: "Water (जल)",
    symbol: "Two Fishes (मीन)",
    gemstone: "Yellow Sapphire (पुष्कराज)",
    gemstoneHindi: "पुष्कराज",
    metal: "Gold / Silver",
    colors: ["Golden Yellow", "Sea Green", "White"],
    numbers: [3, 7, 2],
    days: ["Thursday (गुरुवार)", "Monday (सोमवार)"],
    direction: "North (उत्तर)",
    friendlyRashis: ["Kark (Cancer)", "Vrishchik (Scorpio)", "Makar (Capricorn)"],
    varna: "Brahmin (ब्राह्मण)",
    vashya: "Jalachara (जलचर)",
    strengths: ["Compassionate, artistic, spiritual, gentle, kind-hearted and devotional"],
    temperament: "Tender and sensitive; marriage is a sacred emotional connection characterized by deep empathy and unconditional support.",
    careerAptitude: "Arts, music, spiritual guidance, medicine, marine services, NGO work.",
  },
];

export const NAKSHATRA_DETAILS = [
  { name: "Ashwini", hindi: "अश्विनी", lord: "Ketu (केतु)", yoni: "Ashwa (अश्व - Horse)", gana: "Deva (देव)", nadi: "Adi (आद्य)" },
  { name: "Bharani", hindi: "भरणी", lord: "Venus (शुक्र)", yoni: "Gaja (गज - Elephant)", gana: "Manushya (मनुष्य)", nadi: "Madhya (मध्य)" },
  { name: "Krittika", hindi: "कृत्तिका", lord: "Sun (सूर्य)", yoni: "Mesha (मेष - Sheep)", gana: "Rakshasa (राक्षस)", nadi: "Antya (अंत्य)" },
  { name: "Rohini", hindi: "रोहिणी", lord: "Moon (चंद्र)", yoni: "Sarpa (सर्प - Serpent)", gana: "Manushya (मनुष्य)", nadi: "Antya (अंत्य)" },
  { name: "Mrigashira", hindi: "मृगशिरा", lord: "Mars (मंगळ)", yoni: "Sarpa (सर्प - Serpent)", gana: "Deva (देव)", nadi: "Madhya (मध्य)" },
  { name: "Ardra", hindi: "आर्द्रा", lord: "Rahu (राहू)", yoni: "Shwana (श्वान - Dog)", gana: "Manushya (मनुष्य)", nadi: "Adi (आद्य)" },
  { name: "Punarvasu", hindi: "पुनर्वसु", lord: "Jupiter (गुरू)", yoni: "Marjara (मार्जार - Cat)", gana: "Deva (देव)", nadi: "Adi (आद्य)" },
  { name: "Pushya", hindi: "पुष्य", lord: "Saturn (शनी)", yoni: "Mesha (मेष - Sheep)", gana: "Deva (देव)", nadi: "Madhya (मध्य)" },
  { name: "Ashlesha", hindi: "आश्लेषा", lord: "Mercury (बुध)", yoni: "Marjara (मार्जार - Cat)", gana: "Rakshasa (राक्षस)", nadi: "Antya (अंत्य)" },
  { name: "Magha", hindi: "मघा", lord: "Ketu (केतु)", yoni: "Mushaka (मूषक - Rat)", gana: "Rakshasa (राक्षस)", nadi: "Antya (अंत्य)" },
  { name: "Purva Phalguni", hindi: "पूर्वा फाल्गुनी", lord: "Venus (शुक्र)", yoni: "Mushaka (मूषक - Rat)", gana: "Manushya (मनुष्य)", nadi: "Madhya (मध्य)" },
  { name: "Uttara Phalguni", hindi: "उत्तरा फाल्गुनी", lord: "Sun (सूर्य)", yoni: "Gau (गौ - Cow)", gana: "Manushya (मनुष्य)", nadi: "Adi (आद्य)" },
  { name: "Hasta", hindi: "हस्त", lord: "Moon (चंद्र)", yoni: "Mahisha (महिष - Buffalo)", gana: "Deva (देव)", nadi: "Adi (आद्य)" },
  { name: "Chitra", hindi: "चित्रा", lord: "Mars (मंगळ)", yoni: "Vyaghra (व्याघ्र - Tiger)", gana: "Rakshasa (राक्षस)", nadi: "Madhya (मध्य)" },
  { name: "Swati", hindi: "स्वाती", lord: "Rahu (राहू)", yoni: "Mahisha (महिष - Buffalo)", gana: "Deva (देव)", nadi: "Antya (अंत्य)" },
  { name: "Vishakha", hindi: "विशाखा", lord: "Jupiter (गुरू)", yoni: "Vyaghra (व्याघ्र - Tiger)", gana: "Rakshasa (राक्षस)", nadi: "Antya (अंत्य)" },
  { name: "Anuradha", hindi: "अनुराधा", lord: "Saturn (शनी)", yoni: "Mriga (मृग - Deer)", gana: "Deva (देव)", nadi: "Madhya (मध्य)" },
  { name: "Jyeshtha", hindi: "ज्येष्ठा", lord: "Mercury (बुध)", yoni: "Mriga (मृग - Deer)", gana: "Rakshasa (राक्षस)", nadi: "Adi (आद्य)" },
  { name: "Mula", hindi: "मूळ", lord: "Ketu (केतु)", yoni: "Shwana (श्वान - Dog)", gana: "Rakshasa (राक्षस)", nadi: "Adi (आद्य)" },
  { name: "Purva Ashadha", hindi: "पूर्वाषाढा", lord: "Venus (शुक्र)", yoni: "Vanara (वानर - Monkey)", gana: "Manushya (मनुष्य)", nadi: "Madhya (मध्य)" },
  { name: "Uttara Ashadha", hindi: "उत्तराषाढा", lord: "Sun (सूर्य)", yoni: "Nakula (नकुल - Mongoose)", gana: "Manushya (मनुष्य)", nadi: "Antya (अंत्य)" },
  { name: "Shravana", hindi: "श्रवण", lord: "Moon (चंद्र)", yoni: "Vanara (वानर - Monkey)", gana: "Deva (देव)", nadi: "Antya (अंत्य)" },
  { name: "Dhanishta", hindi: "धनिष्ठा", lord: "Mars (मंगळ)", yoni: "Simha (सिंह - Lion)", gana: "Rakshasa (राक्षस)", nadi: "Madhya (मध्य)" },
  { name: "Shatabhisha", hindi: "शतभिषा", lord: "Rahu (राहू)", yoni: "Ashwa (अश्व - Horse)", gana: "Rakshasa (राक्षस)", nadi: "Adi (आद्य)" },
  { name: "Purva Bhadrapada", hindi: "पूर्वा भाद्रपद", lord: "Jupiter (गुरू)", yoni: "Simha (सिंह - Lion)", gana: "Manushya (मनुष्य)", nadi: "Adi (आद्य)" },
  { name: "Uttara Bhadrapada", hindi: "उत्तरा भाद्रपद", lord: "Saturn (शनी)", yoni: "Gau (गौ - Cow)", gana: "Manushya (मनुष्य)", nadi: "Madhya (मध्य)" },
  { name: "Revati", hindi: "रेवती", lord: "Mercury (बुध)", yoni: "Gaja (गज - Elephant)", gana: "Deva (देव)", nadi: "Antya (अंत्य)" },
];

/**
 * Computes Sidereal Moon Position (Nirayana) from birth date and time.
 * Accurate approximation based on Jean Meeus Astronomical lunar algorithm & Lahiri Ayanamsha.
 */
export function computeSiderealMoon(
  dateStr: string,
  timeStr?: string
): { rashiIdx: number; nakshatraIdx: number; pada: number } {
  const d = new Date(dateStr);
  const { hours, minutes } = parseTimeTo24h(timeStr);

  const y = isNaN(d.getUTCFullYear()) ? 1996 : d.getUTCFullYear();
  const m = isNaN(d.getUTCMonth()) ? 1 : d.getUTCMonth() + 1;
  const day = (isNaN(d.getUTCDate()) ? 1 : d.getUTCDate()) + (hours - 5.5 + minutes / 60) / 24;

  const a = Math.floor((14 - m) / 12);
  const yj = y + 4800 - a;
  const mj = m + 12 * a - 3;
  const jd =
    day +
    Math.floor((153 * mj + 2) / 5) +
    365 * yj +
    Math.floor(yj / 4) -
    Math.floor(yj / 100) +
    Math.floor(yj / 400) -
    32045;

  const T = (jd - 2451545.0) / 36525;
  const L0 = 218.3164477 + 481267.88123421 * T;
  const ayanamsha = 23.856 + (1.397 * (y - 2000)) / 100;

  let siderealMoon = (L0 - ayanamsha) % 360;
  if (siderealMoon < 0) siderealMoon += 360;

  const rashiIdx = Math.floor(siderealMoon / 30) % 12;
  const nakshatraIdx = Math.floor(siderealMoon / (360 / 27)) % 27;
  const pada = (Math.floor((siderealMoon % (360 / 27)) / (360 / 108)) % 4) + 1;

  return { rashiIdx, nakshatraIdx, pada };
}

const DAYS_OF_WEEK = [
  "Sunday (रविवार)",
  "Monday (सोमवार)",
  "Tuesday (मंगळवार)",
  "Wednesday (बुधवार)",
  "Thursday (गुरुवार)",
  "Friday (शुक्रवार)",
  "Saturday (शनिवार)",
];

/**
 * Calculates complete single-person Vedic Janam Kundali analysis.
 */
export function calculateSingleKundali(input: SingleKundaliInput): SingleKundaliResult {
  const d = new Date(input.dob || "1996-01-01");
  const dayOfWeek = DAYS_OF_WEEK[d.getDay()] || "Monday (सोमवार)";
  const { hours, minutes } = parseTimeTo24h(input.birthTime);
  const formattedBirthTime = formatTime12h(input.birthTime);

  // Determine Rashi and Nakshatra:
  // If user explicitly provided, use them; otherwise calculate using sidereal ephemeris
  let rashiIdx = getRashiIndex(input.rashi);
  let nakshatraIdx = getNakshatraIndex(input.nakshatra);
  let pada = 1;

  if (!input.rashi || !input.nakshatra) {
    const computed = computeSiderealMoon(input.dob, input.birthTime);
    if (!input.rashi) rashiIdx = computed.rashiIdx;
    if (!input.nakshatra) {
      nakshatraIdx = computed.nakshatraIdx;
      pada = computed.pada;
    }
  }

  const rashiData = RASHI_DETAILS[rashiIdx] || RASHI_DETAILS[0];
  const nakData = NAKSHATRA_DETAILS[nakshatraIdx] || NAKSHATRA_DETAILS[0];

  // Calculate Sun Sign (Vedic Solar transit ~Apr 14 Mesha)
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  const sunRashiIdx = (Math.floor((dayOfYear - 104 + 365) / 30.4) + 12) % 12;
  const sunSign = RASHIS_ORDER[sunRashiIdx] || "Mesh (Aries)";

  // Calculate Lagna (Ascendant): rotates 1 sign every ~2 hours starting from Sun Sign at ~6 AM
  const hoursSince6am = (hours - 6 + 24) % 24;
  const lagnaIdx = (sunRashiIdx + Math.floor(hoursSince6am / 2)) % 12;
  const lagnaData = RASHI_DETAILS[lagnaIdx] || RASHI_DETAILS[0];

  // Manglik Analysis
  const mang = (input.manglik || "Non-Manglik").trim();
  const isMang = mang.toLowerCase().includes("manglik") && !mang.toLowerCase().includes("non");
  const isAnshik = mang.toLowerCase().includes("anshik") || mang.toLowerCase().includes("partial");

  let manglikTitle = "Non-Manglik (अमांगलिक - Kuja Dosha Absent)";
  let manglikDesc =
    "Your Vedic horoscope indicates a calm and harmonious Mars placement without obstructive Kuja Dosha. You can comfortably match with Non-Manglik or Anshik Manglik individuals without astrological friction.";
  let severity: SingleKundaliResult["manglikStatus"]["severity"] = "None";
  let remedies: string[] = [];

  if (isMang) {
    severity = "High";
    manglikTitle = "Poorna Manglik (मांगलिक - Kuja Dosha Present)";
    manglikDesc =
      "Mars (मंगळ) occupies an influential house (1st, 4th, 7th, 8th, or 12th). This brings immense dynamism, courage, and leadership, but requires patience in matrimony. Matching with another Manglik naturally cancels the Dosha.";
    remedies = [
      "Kumbh Vivah or Ark Vivah ceremony prior to marriage.",
      "Recite Hanuman Chalisa and worship Lord Kartikeya on Tuesdays.",
      "Wear a natural triangular Red Coral (रक्त पोवळे) set in copper or gold after consultation.",
      "Perform Lord Shiva Abhishek with milk on Mondays.",
    ];
  } else if (isAnshik) {
    severity = "Low";
    manglikTitle = "Anshik Manglik (आंशिक / सौम्य मांगलिक)";
    manglikDesc =
      "Mild or partial Mars influence observed. The effect is minor and naturally harmonized with maturity (after age 28) or through common Vedic remedies.";
    remedies = [
      "Chant Mangal Gayatri Mantra (ॐ अंगारकाय विद्महे...) on Tuesdays.",
      "Donate red lentils (मसूर डाळ) or copper utensils on auspicious Tuesday mornings.",
    ];
  }

  const formattedDob = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    personal: {
      name: input.name || (input.gender === "male" ? "Groom" : "Bride"),
      gender: input.gender,
      genderLabel: input.gender === "male" ? "Male (पुरुष)" : "Female (स्त्री)",
      dob: input.dob,
      formattedDob,
      birthTime: input.birthTime || "12:00",
      formattedBirthTime,
      birthPlace: input.birthPlace || input.city || "Mumbai, Maharashtra",
      dayOfWeek,
    },
    astrology: {
      rashi: rashiData.name,
      rashiHindi: rashiData.hindi,
      rashiLord: rashiData.lord,
      rashiElement: rashiData.element,
      rashiSymbol: rashiData.symbol,
      nakshatra: nakData.name,
      nakshatraHindi: nakData.hindi,
      nakshatraLord: nakData.lord,
      pada,
      lagna: lagnaData.name,
      lagnaLord: lagnaData.lord,
      sunSign,
      varna: rashiData.varna,
      vashya: rashiData.vashya,
      yoni: nakData.yoni,
      gana: nakData.gana,
      nadi: nakData.nadi,
    },
    manglikStatus: {
      status: input.manglik || "Non-Manglik",
      isManglik: isMang,
      isAnshik,
      severity,
      title: manglikTitle,
      description: manglikDesc,
      remedies,
    },
    luckyAttributes: {
      gemstone: rashiData.gemstone,
      gemstoneHindi: rashiData.gemstoneHindi,
      metal: rashiData.metal,
      colors: rashiData.colors,
      numbers: rashiData.numbers,
      favorableDays: rashiData.days,
      favorableDirection: rashiData.direction,
      friendlyRashis: rashiData.friendlyRashis,
    },
    traits: {
      strengths: rashiData.strengths,
      temperament: rashiData.temperament,
      marriageAdvice: `Being a native of ${rashiData.name} and ${nakData.name} Nakshatra, you flourish best in a partnership characterized by mutual trust and emotional transparency. Your most auspicious matrimonial unions are formed with ${rashiData.friendlyRashis.join(", ")}.`,
      careerAptitude: rashiData.careerAptitude,
    },
  };
}
