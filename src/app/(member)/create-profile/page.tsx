"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ChipSelect } from "@/components/common/ChipSelect";
import { FormField } from "@/components/common/FormField";
import { NativeSelect } from "@/components/common/NativeSelect";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";
import { AVATAR_TONE_CLASSES, ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useSession } from "@/hooks/use-demo";
import { syncMongoSession } from "@/lib/actions";
import {
  AGES,
  CITIES,
  COMMUNITIES,
  DIETS,
  FAMILY_TYPES,
  FAMILY_VALUES,
  HABITS,
  HEIGHTS,
  HOBBIES,
  INCOMES,
  MARITAL_STATUSES,
  MOTHER_TONGUES,
  OCCUPATIONS,
  QUALIFICATIONS,
  RELIGIONS,
} from "@/lib/options";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  "Personal",
  "Education & Career",
  "Family Details",
  "Lifestyle & Habits",
  "Partner Preferences",
  "Profile Photo",
];

type Errors = Record<string, string>;

export default function CreateProfilePage() {
  const { account, profile } = useSession();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const [draft, setDraft] = useState<Profile>({
    id: profile?.id || "",
    ownerId: account?.id || "",
    name: profile?.name || account?.name || "",
    gender: (profile?.gender as any) || account?.gender || "male",
    dob: profile?.dob || account?.dob || "1996-05-15",
    heightCm: profile?.heightCm || 170,
    maritalStatus: profile?.maritalStatus || "Never Married",
    religion: profile?.religion || "Hindu",
    community: profile?.community || "Brahmin",
    motherTongue: profile?.motherTongue || "Hindi",
    city: profile?.city || "Mumbai",
    qualification: profile?.qualification || "B.Tech",
    college: profile?.college || "",
    occupation: profile?.occupation || "Software Professional",
    company: profile?.company || "",
    income: profile?.income || "15-20 Lakhs",
    familyType: profile?.familyType || "Nuclear",
    familyValues: profile?.familyValues || "Moderate",
    fatherOccupation: profile?.fatherOccupation || "",
    motherOccupation: profile?.motherOccupation || "",
    siblings: profile?.siblings || "",
    diet: profile?.diet || "Vegetarian",
    smoking: profile?.smoking || "No",
    drinking: profile?.drinking || "No",
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
  });

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
      req("dob", "Date of birth is required");
      req("heightCm", "Select height");
      req("maritalStatus", "Select marital status");
      req("religion", "Select religion");
      req("community", "Select community");
      req("motherTongue", "Select mother tongue");
      req("city", "Select city");
    }
    if (s === 1) {
      req("qualification", "Select qualification");
      req("occupation", "Select occupation");
      req("income", "Select income range");
    }
    if (s === 2) {
      req("familyType", "Select family type");
      req("familyValues", "Select family values");
    }
    if (s === 3) {
      req("diet", "Select diet");
      req("smoking", "Select smoking habit");
      req("drinking", "Select drinking habit");
      if (draft.about.length > 600) e.about = "Bio must be under 600 characters";
    }
    if (s === 4) {
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
          createdBy: account?.createdBy || "Self",
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

      toast.success("Congratulations! Your matrimonial profile is created & active.");
      navigate({ to: "/dashboard" });
    } catch {
      setSubmitting(false);
      // Fallback
      if (account) {
        syncMongoSession(account, draft, token);
      }
      toast.success("Profile saved!");
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="space-y-6">
      <MemberPageTitle
        title="Create Your Matrimonial Profile"
        text="A complete and genuine profile gets 5x more relevant responses from suitable matches."
      />

      {/* Steps indicator */}
      <div className="surface p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}:{" "}
            <strong className="text-foreground">{STEPS[step]}</strong>
          </span>
          <span>{Math.round(((step + 1) / STEPS.length) * 100)}% Complete</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-2.5 h-2 bg-muted" />

        <ol className="mt-4 hidden grid-cols-6 gap-2 sm:grid">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-1.5 text-center text-xs transition-colors",
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
              {label}
            </li>
          ))}
        </ol>
      </div>

      <div className="surface p-6 md:p-8">
        {/* Step 0: Personal */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Basic & Personal Details
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="cp-name" label="Full Name" error={errors.name}>
                <Input
                  id="cp-name"
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                />
              </FormField>

              <FormField id="cp-gender" label="Gender">
                <NativeSelect
                  id="cp-gender"
                  value={draft.gender}
                  onChange={(e) => set("gender", e.target.value as any)}
                  options={["female", "male"]}
                />
              </FormField>

              <FormField id="cp-dob" label="Date of Birth" error={errors.dob}>
                <Input
                  id="cp-dob"
                  type="date"
                  value={draft.dob}
                  onChange={(e) => set("dob", e.target.value)}
                />
              </FormField>

              <FormField id="cp-height" label="Height" error={errors.heightCm}>
                <NativeSelect
                  id="cp-height"
                  value={String(draft.heightCm)}
                  onChange={(e) => set("heightCm", Number(e.target.value))}
                  options={HEIGHTS.map(String)}
                />
              </FormField>

              <FormField id="cp-marital" label="Marital Status" error={errors.maritalStatus}>
                <NativeSelect
                  id="cp-marital"
                  value={draft.maritalStatus}
                  onChange={(e) => set("maritalStatus", e.target.value)}
                  options={[...MARITAL_STATUSES]}
                />
              </FormField>

              <FormField id="cp-religion" label="Religion" error={errors.religion}>
                <NativeSelect
                  id="cp-religion"
                  value={draft.religion}
                  onChange={(e) => set("religion", e.target.value)}
                  options={[...RELIGIONS]}
                />
              </FormField>

              <FormField id="cp-community" label="Community / Caste" error={errors.community}>
                <NativeSelect
                  id="cp-community"
                  value={draft.community}
                  onChange={(e) => set("community", e.target.value)}
                  options={[...COMMUNITIES]}
                />
              </FormField>

              <FormField id="cp-motherTongue" label="Mother Tongue" error={errors.motherTongue}>
                <NativeSelect
                  id="cp-motherTongue"
                  value={draft.motherTongue}
                  onChange={(e) => set("motherTongue", e.target.value)}
                  options={[...MOTHER_TONGUES]}
                />
              </FormField>

              <FormField id="cp-city" label="Current City" error={errors.city}>
                <NativeSelect
                  id="cp-city"
                  value={draft.city}
                  onChange={(e) => set("city", e.target.value)}
                  options={[...CITIES]}
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Step 1: Education & Career */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Education & Career
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="cp-qual"
                label="Highest Qualification"
                error={errors.qualification}
              >
                <NativeSelect
                  id="cp-qual"
                  value={draft.qualification}
                  onChange={(e) => set("qualification", e.target.value)}
                  options={[...QUALIFICATIONS]}
                />
              </FormField>

              <FormField id="cp-college" label="College / University">
                <Input
                  id="cp-college"
                  value={draft.college || ""}
                  onChange={(e) => set("college", e.target.value)}
                  placeholder="e.g. IIT Bombay / Delhi University"
                />
              </FormField>

              <FormField id="cp-occup" label="Occupation" error={errors.occupation}>
                <NativeSelect
                  id="cp-occup"
                  value={draft.occupation}
                  onChange={(e) => set("occupation", e.target.value)}
                  options={[...OCCUPATIONS]}
                />
              </FormField>

              <FormField id="cp-company" label="Company / Employer">
                <Input
                  id="cp-company"
                  value={draft.company || ""}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="e.g. TCS / Google / Self-employed"
                />
              </FormField>

              <FormField id="cp-income" label="Annual Income" error={errors.income}>
                <NativeSelect
                  id="cp-income"
                  value={draft.income}
                  onChange={(e) => set("income", e.target.value)}
                  options={[...INCOMES]}
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Step 2: Family */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Family Background
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="cp-familyType" label="Family Type" error={errors.familyType}>
                <NativeSelect
                  id="cp-familyType"
                  value={draft.familyType}
                  onChange={(e) => set("familyType", e.target.value)}
                  options={[...FAMILY_TYPES]}
                />
              </FormField>

              <FormField id="cp-familyValues" label="Family Values" error={errors.familyValues}>
                <NativeSelect
                  id="cp-familyValues"
                  value={draft.familyValues}
                  onChange={(e) => set("familyValues", e.target.value)}
                  options={[...FAMILY_VALUES]}
                />
              </FormField>

              <FormField id="cp-father" label="Father's Occupation">
                <Input
                  id="cp-father"
                  value={draft.fatherOccupation || ""}
                  onChange={(e) => set("fatherOccupation", e.target.value)}
                  placeholder="e.g. Business / Retired Government Officer"
                />
              </FormField>

              <FormField id="cp-mother" label="Mother's Occupation">
                <Input
                  id="cp-mother"
                  value={draft.motherOccupation || ""}
                  onChange={(e) => set("motherOccupation", e.target.value)}
                  placeholder="e.g. Homemaker / Teacher"
                />
              </FormField>

              <FormField id="cp-siblings" label="Siblings (if any)">
                <Input
                  id="cp-siblings"
                  value={draft.siblings || ""}
                  onChange={(e) => set("siblings", e.target.value)}
                  placeholder="e.g. 1 Elder Brother (Married), 1 Younger Sister"
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Step 3: Lifestyle & Bio */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Lifestyle, Habits & About
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              <FormField id="cp-diet" label="Dietary Habit" error={errors.diet}>
                <NativeSelect
                  id="cp-diet"
                  value={draft.diet}
                  onChange={(e) => set("diet", e.target.value)}
                  options={[...DIETS]}
                />
              </FormField>

              <FormField id="cp-smoke" label="Smoking" error={errors.smoking}>
                <NativeSelect
                  id="cp-smoke"
                  value={draft.smoking}
                  onChange={(e) => set("smoking", e.target.value)}
                  options={[...HABITS]}
                />
              </FormField>

              <FormField id="cp-drink" label="Drinking" error={errors.drinking}>
                <NativeSelect
                  id="cp-drink"
                  value={draft.drinking}
                  onChange={(e) => set("drinking", e.target.value)}
                  options={[...HABITS]}
                />
              </FormField>
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
              label="About You / Personality"
              error={errors.about}
              hint="Write a few lines about your values, aspirations, and what brings you joy."
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
        )}

        {/* Step 4: Partner Preferences */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Partner Preferences
            </h2>
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
                    options={HEIGHTS.map(String)}
                  />
                </FormField>
                <FormField id="cp-p-htmax" label="Max Height">
                  <NativeSelect
                    id="cp-p-htmax"
                    value={String(draft.prefs.heightMax)}
                    onChange={(e) => setPref("heightMax", Number(e.target.value))}
                    options={HEIGHTS.map(String)}
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
        )}

        {/* Step 5: Profile Photo & Tone */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Choose Profile Avatar & Preview
            </h2>
            <p className="text-sm text-muted-foreground">
              Select an avatar color scheme for your matrimony profile. Verified member badges will be
              automatically displayed.
            </p>

            <div className="flex flex-wrap items-center gap-4 py-4">
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

            <div className="rounded-xl border bg-muted/30 p-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" /> Profile Card Preview
              </h3>
              <div className="flex items-center gap-4">
                <ProfileAvatar name={draft.name || "User"} tone={draft.tone} size="lg" />
                <div>
                  <h4 className="font-display text-xl font-bold text-foreground">{draft.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {draft.occupation} • {draft.city} • {draft.religion} ({draft.community})
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-semibold text-success">
                    <Check className="h-3 w-3" /> Verified Member
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          {step > 0 ? (
            <Button variant="outline" onClick={prevStep} disabled={submitting}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button onClick={nextStep}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submitProfile}
              disabled={submitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? "Saving to Atlas..." : "Publish Profile Now"}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
