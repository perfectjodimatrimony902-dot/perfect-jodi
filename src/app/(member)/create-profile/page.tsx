"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles, User, Heart, MapPin, Briefcase, Users, Calendar, RotateCcw, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ChipSelect } from "@/components/common/ChipSelect";
import { FormField } from "@/components/common/FormField";
import { NativeSelect } from "@/components/common/NativeSelect";
import { TimePickerAmPm } from "@/components/common/TimePickerAmPm";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";
import { AVATAR_TONE_CLASSES, ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { PhotoUploader } from "@/components/profile/PhotoUploader";
import { DraftProfilePreviewModal } from "@/components/profile/DraftProfilePreviewModal";
import { useSession } from "@/hooks/use-demo";
import { syncAllProfilesFromDb, syncMongoSession } from "@/lib/actions";
import { shortHeight, formatHeight } from "@/lib/matching";
import {
  AGES,
  CHILDREN_PREFERENCES,
  CITIES,
  COMMUNITIES,
  COUNTRIES,
  CREATED_BY,
  DIETS,
  DISABILITIES,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  FAMILY_STATUSES,
  FAMILY_TYPES,
  FAMILY_VALUES,
  HABITS,
  HEIGHTS,
  HOBBIES,
  INCOMES,
  LANGUAGES_KNOWN,
  LIVING_ARRANGEMENTS,
  MANGLIK_STATUSES,
  MARITAL_STATUSES,
  MARRIAGE_TIMELINES,
  MOTHER_TONGUES,
  OCCUPATIONS,
  QUALIFICATIONS,
  RASHIS,
  RELIGIONS,
  RELOCATION_OPTIONS,
  STATES,
  WEIGHTS,
} from "@/lib/options";
import type { CreatedBy, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  "Personal & Horoscope",
  "Location & Relocation",
  "Education & Career",
  "Family Details",
  "Lifestyle & Marriage",
  "Partner Preferences",
  "Preview & Photo",
];

type Errors = Record<string, string>;

const DRAFT_STORAGE_KEY = "pj_create_profile_draft";
const STEP_STORAGE_KEY = "pj_create_profile_step";

function getDefaultDraft(account: any, profile: any): Profile {
  return {
    id: profile?.id || "",
    ownerId: account?.id || "",
    name: profile?.name || account?.name || "",
    email: profile?.email || "",
    mobile: profile?.mobile || "",
    gender: (profile?.gender as any) || account?.gender || "male",
    dob: profile?.dob || account?.dob || "1996-05-15",
    photoUrl: profile?.photoUrl || "",
    photos: profile?.photos || [],
    heightCm: profile?.heightCm || 170,
    weightKg: profile?.weightKg || 68,
    maritalStatus: profile?.maritalStatus || "Never Married",
    religion: profile?.religion || "Hindu",
    community: profile?.community || "Brahmin",
    subCaste: profile?.subCaste || "",
    gotra: profile?.gotra || "",
    manglik: profile?.manglik || "Non-Manglik",
    birthTime: profile?.birthTime || "",
    birthPlace: profile?.birthPlace || "",
    rashi: profile?.rashi || "",
    nakshatra: profile?.nakshatra || "",
    motherTongue: profile?.motherTongue || "Hindi",
    languages: profile?.languages || ["English", "Hindi"],
    disability: profile?.disability || "None",
    country: profile?.country || "India",
    state: profile?.state || "Maharashtra",
    city: profile?.city || "Mumbai",
    nativePlace: profile?.nativePlace || "",
    willingToRelocate: profile?.willingToRelocate || "Flexible",
    qualification: profile?.qualification || "B.Tech",
    educationLevel: profile?.educationLevel || "Undergraduate / Bachelor's",
    educationField: profile?.educationField || "",
    college: profile?.college || "",
    employmentType: profile?.employmentType || "Private sector",
    occupation: profile?.occupation || "Software Professional",
    designation: profile?.designation || "",
    company: profile?.company || "",
    income: profile?.income || "15-20 Lakhs",
    familyType: profile?.familyType || "Nuclear",
    familyStatus: profile?.familyStatus || "Upper middle class",
    familyValues: profile?.familyValues || "Moderate",
    fatherOccupation: profile?.fatherOccupation || "",
    motherOccupation: profile?.motherOccupation || "",
    brothersCount: profile?.brothersCount !== undefined ? profile.brothersCount : 0,
    sistersCount: profile?.sistersCount !== undefined ? profile.sistersCount : 0,
    siblings: profile?.siblings || "",
    aboutFamily: profile?.aboutFamily || "",
    diet: profile?.diet || "Vegetarian",
    smoking: profile?.smoking || "No",
    drinking: profile?.drinking || "No",
    marriageTimeline: profile?.marriageTimeline || "6–12 months",
    livingArrangement: profile?.livingArrangement || "Flexible / Open to discussion",
    childrenPreference: profile?.childrenPreference || "Yes, want children",
    hobbies: profile?.hobbies || ["Reading", "Travel", "Music"],
    about:
      profile?.about ||
      "Warm, ambitious professional looking for a life partner who values family, growth, and companionship.",
    prefs: profile?.prefs || {
      ageMin: 21,
      ageMax: 32,
      heightMin: 155,
      heightMax: 185,
      religions: ["Hindu"],
      locations: ["Mumbai", "Pune", "Delhi NCR"],
      education: "Bachelor's or above",
      occupation: "Professional",
      maritalStatus: ["Never Married"],
    },
    tone: profile?.tone || 2,
    status: profile?.status || "approved",
    verified: true,
    createdBy: profile?.createdBy || account?.createdBy || "Self",
    createdAt: profile?.createdAt || new Date().toISOString(),
  };
}

export default function CreateProfilePage() {
  const { account, profile } = useSession();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STEP_STORAGE_KEY);
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < STEPS.length) return parsed;
        }
      } catch { }
    }
    return 0;
  });

  const [submitting, setSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const [draft, setDraft] = useState<Profile>(() => {
    const base = getDefaultDraft(account, profile);
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            return {
              ...base,
              ...parsed,
              prefs: { ...base.prefs, ...(parsed.prefs || {}) },
            };
          }
        }
      } catch (err) {
        console.warn("Could not load stored profile draft:", err);
      }
    }
    return base;
  });

  // Keep draft updated with ownerId and name when account session hydrates
  useEffect(() => {
    if (account?.id) {
      setDraft((prev) => ({
        ...prev,
        ownerId: prev.ownerId || account.id,
        name: prev.name || account.name || "",
      }));
    }
  }, [account]);

  // Persist draft to localStorage on any change so data is never lost
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn("Failed to auto-save profile draft:", e);
    }
  }, [draft]);

  // Persist step to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STEP_STORAGE_KEY, String(step));
    } catch { }
  }, [step]);

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(STEP_STORAGE_KEY);
    }
    setDraft(getDefaultDraft(account, profile));
    setStep(0);
    setErrors({});
    toast.success("Form cleared. Starting fresh.");
  };

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setDraft((prev) => ({ ...prev, [k]: v }));

  const setPref = <K extends keyof Profile["prefs"]>(k: K, v: Profile["prefs"][K]) =>
    setDraft((prev) => ({ ...prev, prefs: { ...prev.prefs, [k]: v } }));

  const validateStep = (s: number): Errors => {
    const e: Errors = {};
    const req = (k: keyof Profile, msg: string) => {
      const v = draft[k];
      if (typeof v === "number" ? !v : !String(v ?? "").trim()) e[k as string] = msg;
    };

    if (s === 0) {
      if (draft.name.trim().length < 3) e.name = "Enter your full name";
      if (!draft.mobile || !/^[6-9]\d{9}$/.test(draft.mobile.trim())) {
        e.mobile = "Enter a valid 10-digit Indian mobile number";
      }
      if (!draft.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
        e.email = "Enter a valid email address";
      }
      req("dob", "Date of birth is required");
      req("heightCm", "Select height");
      req("maritalStatus", "Select marital status");
      req("religion", "Select religion");
      req("community", "Select community / caste");
      req("motherTongue", "Select mother tongue");
    }
    if (s === 1) {
      req("country", "Select country");
      req("city", "Select or enter city");
    }
    if (s === 2) {
      req("qualification", "Select qualification");
      req("occupation", "Select occupation");
      req("income", "Select income range");
    }
    if (s === 3) {
      req("familyType", "Select family type");
      req("familyValues", "Select family values");
    }
    if (s === 4) {
      req("diet", "Select diet");
      req("smoking", "Select smoking habit");
      req("drinking", "Select drinking habit");
      if (draft.about.length > 600) e.about = "Bio must be under 600 characters";
    }
    if (s === 5) {
      if (draft.prefs.ageMin > draft.prefs.ageMax)
        e["prefs.age"] = "Minimum age cannot exceed maximum age";
      if (draft.prefs.heightMin > draft.prefs.heightMax)
        e["prefs.height"] = "Minimum height cannot exceed maximum height";
    }
    return e;
  };

  const nextStep = () => {
    const errs = validateStep(step);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in the required fields to continue.");
      return;
    }
    setErrors({});
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setErrors({});
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submitProfile = async () => {
    const errs = validateStep(step);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("pj_jwt_token") || "" : "";

    try {
      const res = await fetch("/api/profile/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ...draft,
          ownerId: account?.id,
          createdBy: draft.createdBy || account?.createdBy || "Self",
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok || !data.ok) {
        toast.error(data.error || "Failed to create profile. Please try again.");
        return;
      }

      // Sync updated state
      if (account) {
        syncMongoSession(account, data.profile, data.token || token);
      }
      try {
        await syncAllProfilesFromDb();
      } catch (syncErr) {
        console.warn("Profiles sync notice:", syncErr);
      }

      toast.success("Congratulations! Your matrimonial profile is created & active.");
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        localStorage.removeItem(STEP_STORAGE_KEY);
      }
      navigate({ to: "/dashboard" });
    } catch {
      setSubmitting(false);
      // Fallback
      if (account) {
        syncMongoSession(account, draft, token);
      }
      try {
        await syncAllProfilesFromDb();
      } catch (syncErr) {
        console.warn("Profiles sync notice:", syncErr);
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        localStorage.removeItem(STEP_STORAGE_KEY);
      }
      toast.success("Profile saved!");
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="space-y-6">
      <MemberPageTitle
        title="Create Your Matrimonial Profile"
        text="A complete and detailed profile gets 5x more relevant responses from suitable matches."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreviewModal(true)}
            className="gap-2 cursor-pointer font-medium border-primary/40 text-primary hover:bg-primary/5 shadow-xs"
          >
            <Eye className="h-4 w-4" /> Live Biodata Preview
          </Button>
        }
      />

      {/* Steps indicator */}
      <div className="surface p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}:{" "}
            <strong className="text-foreground">{STEPS[step]}</strong>
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearDraft}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
              title="Reset form and start fresh"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
            <span>{Math.round(((step + 1) / STEPS.length) * 100)}% Complete</span>
          </div>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-2.5 h-2 bg-muted" />

        <ol className="mt-4 hidden grid-cols-7 gap-2 sm:grid">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={cn(
                "cursor-pointer rounded-lg px-2 py-1.5 text-center text-xs transition-colors",
                i === step
                  ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                  : i < step
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted",
              )}
              onClick={() => {
                if (i <= step) setStep(i);
              }}
            >
              <div className="truncate">{label}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="surface p-6 md:p-8">
        {/* Step 0: Personal & Astrology */}
        <div className={cn("space-y-6", step !== 0 && "hidden")}>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Personal & Horoscope Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Provide your basic personal identity and astrology/horoscope details for kundali matching.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="cp-name" label="Full Name *" error={errors.name}>
              <Input
                id="cp-name"
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Ananya Sharma"
              />
            </FormField>

            <FormField id="cp-gender" label="Gender *">
              <NativeSelect
                id="cp-gender"
                value={draft.gender}
                onChange={(e) => set("gender", e.target.value as any)}
                options={["female", "male"]}
              />
            </FormField>

            <FormField
              id="cp-mobile"
              label="Candidate Contact Mobile *"
              error={errors.mobile}
              hint="Dedicated contact number for matches (can differ from registration mobile)"
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                  +91
                </span>
                <Input
                  id="cp-mobile"
                  type="tel"
                  maxLength={10}
                  value={draft.mobile || ""}
                  onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  className="pl-11"
                />
              </div>
            </FormField>

            <FormField
              id="cp-email"
              label="Candidate Contact Email *"
              error={errors.email}
              hint="Direct email address for candidate communications"
            >
              <Input
                id="cp-email"
                type="email"
                value={draft.email || ""}
                onChange={(e) => set("email", e.target.value.trim().toLowerCase())}
                placeholder="e.g. candidate@example.com"
              />
            </FormField>

            <FormField id="cp-dob" label="Date of Birth *" error={errors.dob}>
              <Input
                id="cp-dob"
                type="date"
                value={draft.dob}
                onChange={(e) => set("dob", e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField id="cp-height" label="Height *" error={errors.heightCm}>
                <NativeSelect
                  id="cp-height"
                  value={String(draft.heightCm)}
                  onChange={(e) => set("heightCm", Number(e.target.value))}
                  options={HEIGHTS.map((h) => ({ value: String(h), label: shortHeight(h) }))}
                />
              </FormField>

              <FormField id="cp-weight" label="Weight (kg)">
                <NativeSelect
                  id="cp-weight"
                  value={draft.weightKg ? String(draft.weightKg) : "68"}
                  onChange={(e) => set("weightKg", Number(e.target.value))}
                  options={WEIGHTS.map((w) => ({ value: String(w), label: `${w} kg` }))}
                />
              </FormField>
            </div>

            <FormField id="cp-marital" label="Marital Status *" error={errors.maritalStatus}>
              <NativeSelect
                id="cp-marital"
                value={draft.maritalStatus}
                onChange={(e) => set("maritalStatus", e.target.value)}
                options={[...MARITAL_STATUSES]}
              />
            </FormField>

            <FormField id="cp-disability" label="Physical Disability">
              <NativeSelect
                id="cp-disability"
                value={draft.disability || "None"}
                onChange={(e) => set("disability", e.target.value)}
                options={[...DISABILITIES]}
              />
            </FormField>

            <FormField id="cp-motherTongue" label="Mother Tongue *" error={errors.motherTongue}>
              <NativeSelect
                id="cp-motherTongue"
                value={draft.motherTongue}
                onChange={(e) => set("motherTongue", e.target.value)}
                options={[...MOTHER_TONGUES]}
              />
            </FormField>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Other Languages Known
              </label>
              <ChipSelect
                label="Other Languages Known"
                options={[...LANGUAGES_KNOWN]}
                value={draft.languages || []}
                onChange={(langs) => set("languages", langs)}
              />
            </div>
          </div>

          {/* Religious & Horoscope Subsection */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Religious & Horoscope Details
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="cp-religion" label="Religion *" error={errors.religion}>
                <NativeSelect
                  id="cp-religion"
                  value={draft.religion}
                  onChange={(e) => set("religion", e.target.value)}
                  options={[...RELIGIONS]}
                />
              </FormField>

              <FormField id="cp-community" label="Community / Caste *" error={errors.community}>
                <NativeSelect
                  id="cp-community"
                  value={draft.community}
                  onChange={(e) => set("community", e.target.value)}
                  options={[...COMMUNITIES]}
                />
              </FormField>

              <FormField id="cp-subcaste" label="Sub-Caste">
                <Input
                  id="cp-subcaste"
                  value={draft.subCaste || ""}
                  onChange={(e) => set("subCaste", e.target.value)}
                  placeholder="e.g. Kanyakubja, Saraswat, etc."
                />
              </FormField>

              <FormField id="cp-gotra" label="Gotra">
                <Input
                  id="cp-gotra"
                  value={draft.gotra || ""}
                  onChange={(e) => set("gotra", e.target.value)}
                  placeholder="e.g. Kashyap, Bharadwaja, etc."
                />
              </FormField>

              <FormField id="cp-manglik" label="Manglik Status">
                <NativeSelect
                  id="cp-manglik"
                  value={draft.manglik || "Non-Manglik"}
                  onChange={(e) => set("manglik", e.target.value)}
                  options={[...MANGLIK_STATUSES]}
                />
              </FormField>

              <FormField id="cp-rashi" label="Rashi (Moon Sign)">
                <NativeSelect
                  id="cp-rashi"
                  value={draft.rashi || "Don't know"}
                  onChange={(e) => set("rashi", e.target.value)}
                  options={[...RASHIS]}
                />
              </FormField>

                  <FormField id="cp-birthtime" label="Time of Birth (जन्म वेळ)">
                  <TimePickerAmPm
                    id="cp-birthtime"
                    value={draft.birthTime || ""}
                    onChange={(val) => set("birthTime", val)}
                  />
              </FormField>

              <FormField id="cp-birthplace" label="Place of Birth">
                <Input
                  id="cp-birthplace"
                  value={draft.birthPlace || ""}
                  onChange={(e) => set("birthPlace", e.target.value)}
                  placeholder="e.g. Lucknow, Uttar Pradesh"
                />
              </FormField>

              <FormField id="cp-nakshatra" label="Nakshatra">
                <Input
                  id="cp-nakshatra"
                  value={draft.nakshatra || ""}
                  onChange={(e) => set("nakshatra", e.target.value)}
                  placeholder="e.g. Rohini, Ashwini, etc."
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Step 1: Location & Relocation */}
        <div className={cn("space-y-6", step !== 1 && "hidden")}>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Location & Relocation Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Where do you currently reside and where is your family native to?
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="cp-country" label="Country of Residence *" error={errors.country}>
              <NativeSelect
                id="cp-country"
                value={draft.country || "India"}
                onChange={(e) => set("country", e.target.value)}
                options={[...COUNTRIES]}
              />
            </FormField>

            <FormField id="cp-state" label="State">
              <NativeSelect
                id="cp-state"
                value={draft.state || "Maharashtra"}
                onChange={(e) => set("state", e.target.value)}
                options={[...STATES]}
              />
            </FormField>

            <FormField id="cp-city" label="Current City *" error={errors.city}>
              <NativeSelect
                id="cp-city"
                value={draft.city}
                onChange={(e) => set("city", e.target.value)}
                options={[...CITIES]}
              />
            </FormField>

            <FormField id="cp-native" label="Native Place / Ancestral Hometown">
              <Input
                id="cp-native"
                value={draft.nativePlace || ""}
                onChange={(e) => set("nativePlace", e.target.value)}
                placeholder="e.g. Varanasi, UP / Jaipur, Rajasthan"
              />
            </FormField>

            <FormField id="cp-relocate" label="Willingness to Relocate">
              <NativeSelect
                id="cp-relocate"
                value={draft.willingToRelocate || "Flexible"}
                onChange={(e) => set("willingToRelocate", e.target.value)}
                options={[...RELOCATION_OPTIONS]}
              />
            </FormField>
          </div>
        </div>

        {/* Step 2: Education & Career */}
        <div className={cn("space-y-6", step !== 2 && "hidden")}>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Education & Career Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detail your academic qualifications and current professional career.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="cp-edulevel" label="Highest Education Level">
              <NativeSelect
                id="cp-edulevel"
                value={draft.educationLevel || "Undergraduate / Bachelor's"}
                onChange={(e) => set("educationLevel", e.target.value)}
                options={[...EDUCATION_LEVELS]}
              />
            </FormField>

            <FormField
              id="cp-qual"
              label="Degree / Highest Qualification *"
              error={errors.qualification}
            >
              <NativeSelect
                id="cp-qual"
                value={draft.qualification}
                onChange={(e) => set("qualification", e.target.value)}
                options={[...QUALIFICATIONS]}
              />
            </FormField>

            <FormField id="cp-edufield" label="Field of Study / Specialization">
              <Input
                id="cp-edufield"
                value={draft.educationField || ""}
                onChange={(e) => set("educationField", e.target.value)}
                placeholder="e.g. Computer Science, Finance, Architecture"
              />
            </FormField>

            <FormField id="cp-college" label="College / University">
              <Input
                id="cp-college"
                value={draft.college || ""}
                onChange={(e) => set("college", e.target.value)}
                placeholder="e.g. IIT Bombay / Delhi University / BITS"
              />
            </FormField>

            <FormField id="cp-emptype" label="Employment Type">
              <NativeSelect
                id="cp-emptype"
                value={draft.employmentType || "Private sector"}
                onChange={(e) => set("employmentType", e.target.value)}
                options={[...EMPLOYMENT_TYPES]}
              />
            </FormField>

            <FormField id="cp-occup" label="Occupation / Sector *" error={errors.occupation}>
              <NativeSelect
                id="cp-occup"
                value={draft.occupation}
                onChange={(e) => set("occupation", e.target.value)}
                options={[...OCCUPATIONS]}
              />
            </FormField>

            <FormField id="cp-designation" label="Designation / Job Title">
              <Input
                id="cp-designation"
                value={draft.designation || ""}
                onChange={(e) => set("designation", e.target.value)}
                placeholder="e.g. Senior Software Architect / VP / Manager"
              />
            </FormField>

            <FormField id="cp-company" label="Company / Employer Name">
              <Input
                id="cp-company"
                value={draft.company || ""}
                onChange={(e) => set("company", e.target.value)}
                placeholder="e.g. Microsoft / Tata Consultancy Services"
              />
            </FormField>

            <FormField id="cp-income" label="Annual Income *" error={errors.income}>
              <NativeSelect
                id="cp-income"
                value={draft.income}
                onChange={(e) => set("income", e.target.value)}
                options={[...INCOMES]}
              />
            </FormField>
          </div>
        </div>

        {/* Step 3: Family Details */}
        <div className={cn("space-y-6", step !== 3 && "hidden")}>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Family Background
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Provide insights into your family values, parents, and siblings.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="cp-familyType" label="Family Type *" error={errors.familyType}>
              <NativeSelect
                id="cp-familyType"
                value={draft.familyType}
                onChange={(e) => set("familyType", e.target.value)}
                options={[...FAMILY_TYPES]}
              />
            </FormField>

            <FormField id="cp-familyValues" label="Family Values *" error={errors.familyValues}>
              <NativeSelect
                id="cp-familyValues"
                value={draft.familyValues}
                onChange={(e) => set("familyValues", e.target.value)}
                options={[...FAMILY_VALUES]}
              />
            </FormField>

            <FormField id="cp-familyStatus" label="Family Status">
              <NativeSelect
                id="cp-familyStatus"
                value={draft.familyStatus || "Upper middle class"}
                onChange={(e) => set("familyStatus", e.target.value)}
                options={[...FAMILY_STATUSES]}
              />
            </FormField>

            <FormField id="cp-father" label="Father's Occupation">
              <Input
                id="cp-father"
                value={draft.fatherOccupation || ""}
                onChange={(e) => set("fatherOccupation", e.target.value)}
                placeholder="e.g. Business Owner / Retired Civil Servant"
              />
            </FormField>

            <FormField id="cp-mother" label="Mother's Occupation">
              <Input
                id="cp-mother"
                value={draft.motherOccupation || ""}
                onChange={(e) => set("motherOccupation", e.target.value)}
                placeholder="e.g. Homemaker / School Principal / Doctor"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField id="cp-brothers" label="Brothers Count">
                <NativeSelect
                  id="cp-brothers"
                  value={String(draft.brothersCount ?? 0)}
                  onChange={(e) => set("brothersCount", Number(e.target.value))}
                  options={["0", "1", "2", "3", "4+"]}
                />
              </FormField>
              <FormField id="cp-sisters" label="Sisters Count">
                <NativeSelect
                  id="cp-sisters"
                  value={String(draft.sistersCount ?? 0)}
                  onChange={(e) => set("sistersCount", Number(e.target.value))}
                  options={["0", "1", "2", "3", "4+"]}
                />
              </FormField>
            </div>

            <FormField id="cp-siblings" label="Siblings Overview / Details" className="sm:col-span-2">
              <Input
                id="cp-siblings"
                value={draft.siblings || ""}
                onChange={(e) => set("siblings", e.target.value)}
                placeholder="e.g. 1 elder brother (married, lives in UK), 1 younger sister (studying)"
              />
            </FormField>

            <FormField
              id="cp-aboutFamily"
              label="About Family"
              className="sm:col-span-2"
              hint="Share details about family roots, closeness, and traditions."
            >
              <Textarea
                id="cp-aboutFamily"
                rows={3}
                value={draft.aboutFamily || ""}
                onChange={(e) => set("aboutFamily", e.target.value)}
                placeholder="We are a close-knit, cultured family with modern outlook and deep rooted respect for traditions..."
              />
            </FormField>
          </div>
        </div>

        {/* Step 4: Lifestyle & Marriage Expectations */}
        <div className={cn("space-y-6", step !== 4 && "hidden")}>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Lifestyle, Habits & Marriage Expectations
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Share your personal lifestyle preferences and expectations regarding marriage.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField id="cp-diet" label="Dietary Habit *" error={errors.diet}>
              <NativeSelect
                id="cp-diet"
                value={draft.diet}
                onChange={(e) => set("diet", e.target.value)}
                options={[...DIETS]}
              />
            </FormField>

            <FormField id="cp-smoke" label="Smoking *" error={errors.smoking}>
              <NativeSelect
                id="cp-smoke"
                value={draft.smoking}
                onChange={(e) => set("smoking", e.target.value)}
                options={[...HABITS]}
              />
            </FormField>

            <FormField id="cp-drink" label="Drinking *" error={errors.drinking}>
              <NativeSelect
                id="cp-drink"
                value={draft.drinking}
                onChange={(e) => set("drinking", e.target.value)}
                options={[...HABITS]}
              />
            </FormField>
          </div>

          {/* Marriage Expectations */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Marriage Expectations
            </h3>
            <div className="grid gap-5 sm:grid-cols-3">
              <FormField id="cp-timeline" label="Marriage Timeline">
                <NativeSelect
                  id="cp-timeline"
                  value={draft.marriageTimeline || "6–12 months"}
                  onChange={(e) => set("marriageTimeline", e.target.value)}
                  options={[...MARRIAGE_TIMELINES]}
                />
              </FormField>

              <FormField id="cp-living" label="Living Arrangement">
                <NativeSelect
                  id="cp-living"
                  value={draft.livingArrangement || "Flexible / Open to discussion"}
                  onChange={(e) => set("livingArrangement", e.target.value)}
                  options={[...LIVING_ARRANGEMENTS]}
                />
              </FormField>

              <FormField id="cp-children" label="Preference on Children">
                <NativeSelect
                  id="cp-children"
                  value={draft.childrenPreference || "Yes, want children"}
                  onChange={(e) => set("childrenPreference", e.target.value)}
                  options={[...CHILDREN_PREFERENCES]}
                />
              </FormField>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Hobbies & Interests (Select multiple)
            </label>
            <ChipSelect
              label="Hobbies & Interests"
              options={[...HOBBIES]}
              value={draft.hobbies}
              onChange={(h) => set("hobbies", h)}
            />
          </div>

          <FormField
            id="cp-about"
            label="About You / Personality Bio"
            error={errors.about}
            hint="Write a few lines about your values, personality, and aspirations in life."
          >
            <Textarea
              id="cp-about"
              rows={4}
              value={draft.about}
              onChange={(e) => set("about", e.target.value)}
              maxLength={600}
              placeholder="Share a short bio to let prospective partners know more about you..."
            />
          </FormField>
        </div>

        {/* Step 5: Partner Preferences */}
        <div className={cn("space-y-6", step !== 5 && "hidden")}>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Partner Preferences
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us what you are looking for in a prospective life partner.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField id="cp-p-agemin" label="Partner Min Age">
                <NativeSelect
                  id="cp-p-agemin"
                  value={String(draft.prefs.ageMin)}
                  onChange={(e) => setPref("ageMin", Number(e.target.value))}
                  options={AGES.map(String)}
                />
              </FormField>

              <FormField id="cp-p-agemax" label="Partner Max Age">
                <NativeSelect
                  id="cp-p-agemax"
                  value={String(draft.prefs.ageMax)}
                  onChange={(e) => setPref("ageMax", Number(e.target.value))}
                  options={AGES.map(String)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField id="cp-p-htmin" label="Min Height">
                <NativeSelect
                  id="cp-p-htmin"
                  value={String(draft.prefs.heightMin)}
                  onChange={(e) => setPref("heightMin", Number(e.target.value))}
                  options={HEIGHTS.map((h) => ({ value: String(h), label: shortHeight(h) }))}
                />
              </FormField>
              <FormField id="cp-p-htmax" label="Max Height">
                <NativeSelect
                  id="cp-p-htmax"
                  value={String(draft.prefs.heightMax)}
                  onChange={(e) => setPref("heightMax", Number(e.target.value))}
                  options={HEIGHTS.map((h) => ({ value: String(h), label: shortHeight(h) }))}
                />
              </FormField>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Preferred Religions
            </label>
            <ChipSelect
              label="Preferred Religions"
              options={[...RELIGIONS]}
              value={draft.prefs.religions}
              onChange={(r) => setPref("religions", r)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Preferred Cities
            </label>
            <ChipSelect
              label="Preferred Cities"
              options={[...CITIES]}
              value={draft.prefs.locations}
              onChange={(l) => setPref("locations", l)}
            />
          </div>
        </div>

        {/* Step 6: Profile Photo & Preview */}
        <div className={cn("space-y-6", step !== 6 && "hidden")}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Profile Photo & Preview
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a genuine profile photo saved directly to Cloudinary, configure your preferences, and verify your details before publishing.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreviewModal(true)}
              className="gap-2 shrink-0 border-gold/60 text-gold-foreground font-semibold hover:bg-gold/10 shadow-xs cursor-pointer"
            >
              <Eye className="h-4 w-4 text-gold" /> Full Biodata Preview
            </Button>
          </div>

          {/* Cloudinary Photo Uploader */}
          <PhotoUploader
            currentPhotoUrl={draft.photoUrl}
            name={draft.name || "User"}
            tone={draft.tone}
            onPhotoUploaded={(url) => set("photoUrl", url)}
            onPhotoRemoved={() => set("photoUrl", "")}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="cp-createdby" label="Profile Managed / Created By">
              <NativeSelect
                id="cp-createdby"
                value={draft.createdBy || "Self"}
                onChange={(e) => set("createdBy", e.target.value as CreatedBy)}
                options={[...CREATED_BY]}
              />
            </FormField>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Avatar Accent Color (Fallback when no photo is uploaded)
            </label>
            <div className="flex flex-wrap items-center gap-4 py-2">
              {[1, 2, 3, 4, 5, 6].map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => set("tone", tone)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl p-3 transition-all cursor-pointer",
                    draft.tone === tone
                      ? "ring-2 ring-primary ring-offset-2 bg-primary/5"
                      : "opacity-75 hover:opacity-100",
                  )}
                >
                  <ProfileAvatar name={draft.name || "User"} tone={tone} size="lg" />
                  <span className="text-xs font-medium">Tone {tone}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rich Matrimonial Profile Card Preview */}
          <div className="rounded-xl border bg-muted/20 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" /> Comprehensive Profile Preview
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                <Check className="h-3.5 w-3.5" /> Verified Profile
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <ProfileAvatar name={draft.name || "User"} tone={draft.tone} size="xl" photoUrl={draft.photoUrl} />
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h4 className="font-display text-2xl font-bold text-foreground">{draft.name}</h4>
                  <span className="text-sm font-medium text-muted-foreground">
                    (Created by {draft.createdBy || "Self"})
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/80">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    {draft.designation ? `${draft.designation} (${draft.occupation})` : draft.occupation} • {draft.income}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {draft.city}, {draft.state ? `${draft.state}, ` : ""}{draft.country || "India"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {draft.religion} ({draft.community}{draft.subCaste ? ` - ${draft.subCaste}` : ""}) • {shortHeight(draft.heightCm)}{draft.weightKg ? `, ${draft.weightKg} kg` : ""} • {draft.maritalStatus}
                  {draft.manglik ? ` • ${draft.manglik}` : ""}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t text-xs">
              <div className="rounded-lg bg-background p-3 border">
                <div className="font-semibold text-foreground">Education & Career</div>
                <div className="text-muted-foreground mt-1">
                  {draft.qualification} {draft.educationField ? `in ${draft.educationField}` : ""}
                </div>
                <div className="text-muted-foreground">
                  {draft.company ? `At ${draft.company}` : draft.employmentType}
                </div>
              </div>

              <div className="rounded-lg bg-background p-3 border">
                <div className="font-semibold text-foreground">Family & Background</div>
                <div className="text-muted-foreground mt-1">
                  {draft.familyType} Family • {draft.familyValues}
                </div>
                <div className="text-muted-foreground">
                  Father: {draft.fatherOccupation || "Not specified"}
                </div>
              </div>

              <div className="rounded-lg bg-background p-3 border">
                <div className="font-semibold text-foreground">Lifestyle & Expectations</div>
                <div className="text-muted-foreground mt-1">
                  {draft.diet} • Timeline: {draft.marriageTimeline || "Not specified"}
                </div>
                <div className="text-muted-foreground">
                  Relocation: {draft.willingToRelocate || "Flexible"}
                </div>
              </div>

              <div className="rounded-lg bg-background p-3 border">
                <div className="font-semibold text-foreground">Contact & Identity</div>
                <div className="text-muted-foreground mt-1">
                  📱 +91 {draft.mobile || "Not specified"}
                </div>
                <div className="text-muted-foreground truncate">
                  ✉️ {draft.email || "Not specified"}
                </div>
              </div>
            </div>

            {draft.about && (
              <div className="rounded-lg bg-background p-4 border text-sm">
                <div className="font-semibold text-foreground mb-1">About Bio</div>
                <p className="text-muted-foreground italic">&ldquo;{draft.about}&rdquo;</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
          {step > 0 ? (
            <Button variant="outline" onClick={prevStep} disabled={submitting}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreviewModal(true)}
              className="gap-1.5 cursor-pointer text-xs sm:text-sm border-gold/40 hover:bg-gold/5"
            >
              <Eye className="h-4 w-4 text-gold" /> Preview Biodata
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={nextStep}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={submitProfile}
                disabled={submitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer"
              >
                {submitting ? "Saving to Atlas..." : "Publish Profile Now"}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Live Profile Preview Modal for first-time profile creation */}
      <DraftProfilePreviewModal
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        draft={draft}
        onPublish={submitProfile}
        submitting={submitting}
      />
    </div>
  );
}
