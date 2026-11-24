export const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Parsi"];
export const COMMUNITIES = [
  "Agarwal",
  "Brahmin",
  "Catholic",
  "Digambar",
  "Iyer",
  "Jat",
  "Kayastha",
  "Khatri",
  "Maratha",
  "Marwari",
  "Nair",
  "Patel",
  "Protestant",
  "Rajput",
  "Reddy",
  "Shia",
  "Shwetambar",
  "Sunni",
  "Syrian Christian",
  "Other",
];
export const MOTHER_TONGUES = [
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "Odia",
  "Konkani",
];
export const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Kochi",
  "Chandigarh",
  "Indore",
  "Bhopal",
  "Nagpur",
  "Coimbatore",
  "Guwahati",
  "Bhubaneswar",
];
export const MARITAL_STATUSES = [
  "Never Married",
  "Divorced",
  "Widowed",
  "Awaiting Divorce",
  "Annulled",
];
export const QUALIFICATIONS = [
  "B.Tech / B.E.",
  "M.Tech / M.E.",
  "MBA / PGDM",
  "MBBS / MD",
  "CA / CS",
  "B.Com",
  "M.Com",
  "B.Sc",
  "M.Sc",
  "BA",
  "MA",
  "LLB / LLM",
  "B.Arch",
  "B.Des / M.Des",
  "PhD",
];
export const OCCUPATIONS = [
  "Software Engineer",
  "Doctor",
  "Chartered Accountant",
  "Teacher / Professor",
  "Business Owner",
  "Civil Services",
  "Architect",
  "Lawyer",
  "Banking Professional",
  "Marketing Manager",
  "Designer",
  "Data Scientist",
  "Government Employee",
  "Consultant",
  "Not Working",
];
export const INCOMES = [
  "Below ₹3 LPA",
  "₹3–6 LPA",
  "₹6–10 LPA",
  "₹10–15 LPA",
  "₹15–25 LPA",
  "₹25–50 LPA",
  "₹50 LPA+",
];
export const FAMILY_TYPES = ["Nuclear", "Joint"];
export const FAMILY_VALUES = ["Traditional", "Moderate", "Liberal"];
export const DIETS = ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Vegan", "Jain"];
export const HABITS = ["No", "Occasionally", "Yes"];
export const HOBBIES = [
  "Reading",
  "Travel",
  "Cooking",
  "Music",
  "Classical Dance",
  "Cricket",
  "Yoga",
  "Photography",
  "Trekking",
  "Painting",
  "Movies",
  "Gardening",
  "Fitness",
  "Volunteering",
];
export const CREATED_BY = [
  "Self",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Parent",
  "Sibling",
  "Relative",
  "Guardian",
] as const;

export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "UAE",
  "Singapore",
  "Other",
];

export const STATES = [
  "Maharashtra",
  "Delhi NCR",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Punjab",
  "Rajasthan",
  "Madhya Pradesh",
  "Haryana",
  "Kerala",
  "Bihar",
  "Odisha",
  "Assam",
  "Goa",
  "Other",
];

export const RELOCATION_OPTIONS = [
  "Yes, willing to relocate",
  "Within country only",
  "Willing to relocate abroad",
  "Not willing to relocate",
  "Flexible",
];

export const EDUCATION_LEVELS = [
  "Undergraduate / Bachelor's",
  "Postgraduate / Master's",
  "Doctorate / PhD",
  "Professional qualification",
  "Diploma",
  "High school",
  "Other",
];

export const EMPLOYMENT_TYPES = [
  "Private sector",
  "Government / Public sector",
  "Business / Self-employed",
  "Freelancer / Consultant",
  "Civil Services",
  "Defense",
  "Student",
  "Not currently employed",
  "Other",
];

export const FAMILY_STATUSES = [
  "Middle class",
  "Upper middle class",
  "Affluent / Rich",
  "Prefer not to say",
];

export const DISABILITIES = [
  "None",
  "Physical disability",
  "Visual impairment",
  "Hearing impairment",
  "Other",
  "Prefer not to disclose",
];

export const MANGLIK_STATUSES = [
  "Non-Manglik",
  "Manglik",
  "Anshik (Partial) Manglik",
  "Don't know",
];

export const RASHIS = [
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
  "Don't know",
];

export const MARRIAGE_TIMELINES = [
  "Within 6 months",
  "6–12 months",
  "1–2 years",
  "Not decided yet",
];

export const LIVING_ARRANGEMENTS = [
  "Living with parents / Joint family",
  "Independent home",
  "Flexible / Open to discussion",
];

export const CHILDREN_PREFERENCES = [
  "Yes, want children",
  "No",
  "Unsure / Open to discussion",
];

export const LANGUAGES_KNOWN = [
  "English",
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "Odia",
  "French",
  "German",
  "Spanish",
];

export const WEIGHTS = Array.from({ length: 81 }, (_, i) => 40 + i); // 40kg - 120kg
export const REPORT_REASONS = [
  "Fake or misleading profile",
  "Inappropriate content",
  "Asked for money",
  "Already married",
  "Harassment",
  "Other",
];
export const HEIGHTS = Array.from({ length: 62 }, (_, i) => 137 + i); // 4'6" – 6'6"
export const AGES = Array.from({ length: 43 }, (_, i) => 18 + i);
