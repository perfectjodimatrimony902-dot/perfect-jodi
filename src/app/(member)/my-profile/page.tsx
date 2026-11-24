"use client";

import { Link } from "@/lib/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ChipSelect } from "@/components/common/ChipSelect";
import { FormField } from "@/components/common/FormField";
import { NativeSelect } from "@/components/common/NativeSelect";
import { ProfileStatusBadge } from "@/components/common/StatusBadge";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";
import { AVATAR_TONE_CLASSES, ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { PhotoUploader } from "@/components/profile/PhotoUploader";
import { getProfilePhoto } from "@/data/profile-photos";
import { useSession } from "@/hooks/use-demo";
import { saveMyProfile } from "@/lib/actions";
import { profileCompletion, shortHeight } from "@/lib/matching";
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
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  "Personal & Horoscope",
  "Location & Relocation",
  "Education & Career",
  "Family Background",
  "Lifestyle & Marriage",
  "Partner Preferences",
  "Profile Photo",
];

type Draft = Profile;
type Errors = Record<string, string>;

function validate(step: number, d: Draft): Errors {
  const e: Errors = {};
  const req = (k: keyof Draft, msg: string) => {
    const v = d[k];
    if (typeof v === "number" ? !v : !String(v ?? "").trim()) e[k as string] = msg;
  };
  if (step === 0) {
    if (d.name.trim().length < 3) e.name = "Enter the full name";
    req("dob", "Date of birth is required");
    req("heightCm", "Select height");
    req("maritalStatus", "Select marital status");
    req("religion", "Select religion");
    req("community", "Select community");
    req("motherTongue", "Select mother tongue");
  }
  if (step === 1) {
    req("country", "Select country");
    req("city", "City is required");
  }
  if (step === 2) {
    req("qualification", "Select qualification");
    req("occupation", "Select occupation");
    req("income", "Select income range");
  }
  if (step === 3) {
    req("familyType", "Select family type");
    req("familyValues", "Select family values");
  }
  if (step === 4) {
    req("diet", "Select diet");
    req("smoking", "Select an option");
    req("drinking", "Select an option");
    if (d.about.length > 600) e.about = "Please keep it under 600 characters";
  }
  if (step === 5) {
    if (d.prefs.ageMin > d.prefs.ageMax) e["prefs.age"] = "Minimum age can't be above maximum";
    if (d.prefs.heightMin > d.prefs.heightMax)
      e["prefs.height"] = "Minimum height can't be above maximum";
  }
  return e;
}

function ProfileWizard() {
  const { account, profile } = useSession();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft | null>(profile ?? null);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  if (!profile) {
    return (
      <div className="surface mx-auto max-w-xl space-y-4 p-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <User className="h-8 w-8" />
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold">No Profile Created Yet</h2>
        <p className="text-sm text-muted-foreground">
          Welcome, {account?.name || "Member"}! Create your matrimony profile to start exploring and receiving matches.
        </p>
        <div className="pt-2">
          <Button asChild size="lg">
            <Link to="/create-profile">Create Profile Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!draft) return null;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v });
  const setPref = <K extends keyof Draft["prefs"]>(k: K, v: Draft["prefs"][K]) =>
    setDraft({ ...draft, prefs: { ...draft.prefs, [k]: v } });

  const sel = (k: keyof Draft, label: string, options: string[]) => (
    <FormField id={`w-${k}`} label={label} error={errors[k as string]}>
      <NativeSelect
        id={`w-${k}`}
        value={String(draft[k] ?? "")}
        onChange={(e) => set(k, e.target.value as never)}
        placeholder="Select"
        options={options}
      />
    </FormField>
  );

  const txt = (k: keyof Draft, label: string, placeholder?: string) => (
    <FormField id={`w-${k}`} label={label} error={errors[k as string]}>
      <Input
        id={`w-${k}`}
        value={String(draft[k] ?? "")}
        placeholder={placeholder}
        maxLength={120}
        onChange={(e) => set(k, e.target.value as never)}
      />
    </FormField>
  );

  const go = async (next: number, submit = false) => {
    if (next > step || submit) {
      const e = validate(step, draft);
      setErrors(e);
      if (Object.keys(e).length) {
        toast.error("Please complete the required fields.");
        return;
      }
    } else setErrors({});

    setSaving(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("pj_jwt_token") || "" : "";

    // Persist to MongoDB Atlas if logged in
    if (token) {
      try {
        await fetch("/api/profile/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...draft,
            ownerId: account?.id,
            createdBy: draft.createdBy || account?.createdBy || "Self",
          }),
        });
      } catch (err) {
        console.error("Atlas sync failed:", err);
      }
    }

    const r = saveMyProfile(draft, submit);
    setSaving(false);
    if (!r.ok) return toast.error(r.error);

    if (submit)
      toast.success(
        profile.status === "approved"
          ? "Profile updated and synced to database."
          : "Profile submitted for review. We'll notify you once approved.",
      );
    else {
      toast.success("Progress saved");
      setStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const completion = profileCompletion(draft);
  const ages = AGES.map((a) => ({ value: String(a), label: `${a}` }));
  const heights = HEIGHTS.map((h) => ({ value: String(h), label: shortHeight(h) }));
  const weights = WEIGHTS.map((w) => ({ value: String(w), label: `${w} kg` }));

  return (
    <div>
      <MemberPageTitle
        title="My profile"
        text="A complete profile receives far more interest from suitable families."
        action={
          <div className="flex items-center gap-2">
            <ProfileStatusBadge status={profile.status} />
            <Button asChild variant="outline" size="sm">
              <Link to="/profiles/$id" params={{ id: profile.id }}>
                <Eye className="h-4 w-4" /> Preview
              </Link>
            </Button>
          </div>
        }
      />
      {profile.status === "rejected" && (
        <p className="mb-4 rounded-lg bg-destructive-soft p-4 text-sm text-destructive">
          Changes requested: {profile.rejectionReason}. Update your details and resubmit.
        </p>
      )}

      <div className="surface p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </span>
          <span className="text-muted-foreground">{completion}% complete</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5 bg-muted" />
        <ol className="mt-4 hidden grid-cols-7 gap-2 md:grid">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => (i < step ? go(i) : undefined)}
                disabled={i >= step}
                className={cn(
                  "flex w-full items-center gap-2 text-left text-xs",
                  i === step
                    ? "font-semibold text-primary"
                    : i < step
                      ? "cursor-pointer text-foreground hover:text-primary"
                      : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                    i < step && "border-success bg-success text-primary-foreground",
                    i === step && "border-primary text-primary",
                  )}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="truncate">{s}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="surface mt-6 p-5 md:p-8">
        {/* Step 0: Personal & Horoscope */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {txt("name", "Full name *")}
              <FormField id="w-dob" label="Date of birth *" error={errors.dob}>
                <Input
                  id="w-dob"
                  type="date"
                  value={draft.dob}
                  onChange={(e) => set("dob", e.target.value)}
                />
              </FormField>
              <FormField id="w-gender" label="Gender">
                <NativeSelect
                  id="w-gender"
                  value={draft.gender}
                  disabled
                  options={[
                    { value: "female", label: "Female" },
                    { value: "male", label: "Male" },
                  ]}
                />
              </FormField>
              <FormField id="w-height" label="Height *" error={errors.heightCm}>
                <NativeSelect
                  id="w-height"
                  value={draft.heightCm ? String(draft.heightCm) : ""}
                  onChange={(e) => set("heightCm", Number(e.target.value))}
                  placeholder="Select"
                  options={heights}
                />
              </FormField>
              <FormField id="w-weight" label="Weight">
                <NativeSelect
                  id="w-weight"
                  value={draft.weightKg ? String(draft.weightKg) : "68"}
                  onChange={(e) => set("weightKg", Number(e.target.value))}
                  options={weights}
                />
              </FormField>
              {sel("maritalStatus", "Marital status *", MARITAL_STATUSES)}
              {sel("disability", "Physical disability", DISABILITIES)}
              {sel("motherTongue", "Mother tongue *", MOTHER_TONGUES)}

              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-medium">Languages known</p>
                <ChipSelect
                  label="Languages"
                  options={LANGUAGES_KNOWN}
                  value={draft.languages || []}
                  onChange={(v) => set("languages", v)}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-base mb-3">Religion & Horoscope Details</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                {sel("religion", "Religion *", RELIGIONS)}
                {sel("community", "Community / Caste *", COMMUNITIES)}
                {txt("subCaste", "Sub-caste", "e.g. Kanyakubja")}
                {txt("gotra", "Gotra", "e.g. Kashyap")}
                {sel("manglik", "Manglik status", MANGLIK_STATUSES)}
                {sel("rashi", "Rashi (Moon sign)", RASHIS)}
                <FormField id="w-birthtime" label="Time of birth">
                  <Input
                    id="w-birthtime"
                    type="time"
                    value={draft.birthTime || ""}
                    onChange={(e) => set("birthTime", e.target.value)}
                  />
                </FormField>
                {txt("birthPlace", "Place of birth", "e.g. Lucknow, UP")}
                {txt("nakshatra", "Nakshatra", "e.g. Rohini")}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Location & Relocation */}
        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {sel("country", "Country of residence *", COUNTRIES)}
            {sel("state", "State", STATES)}
            {sel("city", "Current city *", CITIES)}
            {txt("nativePlace", "Native place / Hometown", "e.g. Varanasi, UP")}
            {sel("willingToRelocate", "Willingness to relocate", RELOCATION_OPTIONS)}
          </div>
        )}

        {/* Step 2: Education & Career */}
        {step === 2 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {sel("educationLevel", "Education level", EDUCATION_LEVELS)}
            {sel("qualification", "Highest qualification *", QUALIFICATIONS)}
            {txt("educationField", "Field of study / Specialization", "e.g. Computer Science")}
            {txt("college", "College / University")}
            {sel("employmentType", "Employment type", EMPLOYMENT_TYPES)}
            {sel("occupation", "Occupation *", OCCUPATIONS)}
            {txt("designation", "Designation / Role", "e.g. Senior Software Architect")}
            {txt("company", "Company / Organisation")}
            {sel("income", "Annual income *", INCOMES)}
          </div>
        )}

        {/* Step 3: Family Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {sel("familyType", "Family type *", FAMILY_TYPES)}
              {sel("familyValues", "Family values *", FAMILY_VALUES)}
              {sel("familyStatus", "Family status", FAMILY_STATUSES)}
              {txt("fatherOccupation", "Father's occupation", "e.g. Retired bank manager")}
              {txt("motherOccupation", "Mother's occupation", "e.g. Homemaker")}
              <FormField id="w-brothers" label="Brothers count">
                <NativeSelect
                  id="w-brothers"
                  value={String(draft.brothersCount ?? 0)}
                  onChange={(e) => set("brothersCount", Number(e.target.value))}
                  options={["0", "1", "2", "3", "4+"]}
                />
              </FormField>
              <FormField id="w-sisters" label="Sisters count">
                <NativeSelect
                  id="w-sisters"
                  value={String(draft.sistersCount ?? 0)}
                  onChange={(e) => set("sistersCount", Number(e.target.value))}
                  options={["0", "1", "2", "3", "4+"]}
                />
              </FormField>
              <div className="sm:col-span-2">
                {txt("siblings", "Siblings details", "e.g. 1 elder brother (married)")}
              </div>
              <FormField
                id="w-aboutFamily"
                label="About family"
                className="sm:col-span-2"
                hint="Share details about family roots and traditions."
              >
                <Textarea
                  id="w-aboutFamily"
                  rows={3}
                  value={draft.aboutFamily || ""}
                  onChange={(e) => set("aboutFamily", e.target.value)}
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Step 4: Lifestyle & Marriage */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-3">
              {sel("diet", "Food habits *", DIETS)}
              {sel("smoking", "Smoking *", HABITS)}
              {sel("drinking", "Drinking *", HABITS)}
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-base mb-3">Marriage Expectations</h3>
              <div className="grid gap-5 sm:grid-cols-3">
                {sel("marriageTimeline", "Marriage timeline", MARRIAGE_TIMELINES)}
                {sel("livingArrangement", "Living arrangement", LIVING_ARRANGEMENTS)}
                {sel("childrenPreference", "Preference on children", CHILDREN_PREFERENCES)}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Hobbies & interests</p>
              <ChipSelect
                label="Hobbies"
                options={HOBBIES}
                value={draft.hobbies}
                onChange={(v) => set("hobbies", v)}
              />
            </div>
            <FormField
              id="w-about"
              label="About me"
              error={errors.about}
              hint={`${draft.about.length}/600 — Do not include phone numbers or email.`}
            >
              <Textarea
                id="w-about"
                rows={5}
                value={draft.about}
                onChange={(e) => set("about", e.target.value)}
              />
            </FormField>
          </div>
        )}

        {/* Step 5: Partner preferences */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="w-age" label="Preferred age" error={errors["prefs.age"]}>
                <div className="grid grid-cols-2 gap-2">
                  <NativeSelect
                    aria-label="Minimum age"
                    value={String(draft.prefs.ageMin)}
                    onChange={(e) => setPref("ageMin", Number(e.target.value))}
                    options={ages}
                  />
                  <NativeSelect
                    aria-label="Maximum age"
                    value={String(draft.prefs.ageMax)}
                    onChange={(e) => setPref("ageMax", Number(e.target.value))}
                    options={ages}
                  />
                </div>
              </FormField>
              <FormField id="w-ph" label="Preferred height" error={errors["prefs.height"]}>
                <div className="grid grid-cols-2 gap-2">
                  <NativeSelect
                    aria-label="Minimum height"
                    value={String(draft.prefs.heightMin)}
                    onChange={(e) => setPref("heightMin", Number(e.target.value))}
                    options={heights}
                  />
                  <NativeSelect
                    aria-label="Maximum height"
                    value={String(draft.prefs.heightMax)}
                    onChange={(e) => setPref("heightMax", Number(e.target.value))}
                    options={heights}
                  />
                </div>
              </FormField>
              <FormField id="w-pedu" label="Preferred education">
                <NativeSelect
                  id="w-pedu"
                  value={draft.prefs.education}
                  onChange={(e) => setPref("education", e.target.value)}
                  placeholder="Any"
                  options={QUALIFICATIONS}
                />
              </FormField>
              <FormField id="w-pocc" label="Preferred occupation">
                <NativeSelect
                  id="w-pocc"
                  value={draft.prefs.occupation}
                  onChange={(e) => setPref("occupation", e.target.value)}
                  placeholder="Any"
                  options={OCCUPATIONS}
                />
              </FormField>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">
                Religion{" "}
                <span className="font-normal text-muted-foreground">
                  (none selected = open to all)
                </span>
              </p>
              <ChipSelect
                label="Preferred religions"
                options={RELIGIONS}
                value={draft.prefs.religions}
                onChange={(v) => setPref("religions", v)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">
                Location{" "}
                <span className="font-normal text-muted-foreground">
                  (none selected = anywhere)
                </span>
              </p>
              <ChipSelect
                label="Preferred locations"
                options={CITIES}
                value={draft.prefs.locations}
                onChange={(v) => setPref("locations", v)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Marital status</p>
              <ChipSelect
                label="Preferred marital status"
                options={MARITAL_STATUSES}
                value={draft.prefs.maritalStatus}
                onChange={(v) => setPref("maritalStatus", v)}
              />
            </div>
          </div>
        )}

        {/* Step 6: Photo & Tone */}
        {step === 6 && (
          <div className="flex flex-col items-center gap-6 text-center">
            <ProfileAvatar
              name={draft.name}
              imageUrl={draft.photoUrl || getProfilePhoto(draft)}
              tone={draft.tone}
              size="xl"
            />
            <div>
              <h2 className="text-2xl font-semibold">Profile Photo & Avatar</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Upload your profile photo. Verified photos increase connection rates by 80%.
              </p>
            </div>

            <PhotoUploader
              currentPhotoUrl={draft.photoUrl}
              name={draft.name}
              tone={draft.tone}
              onPhotoUploaded={(url) => set("photoUrl", url)}
              onPhotoRemoved={() => set("photoUrl", "")}
            />

            <div className="pt-4 border-t text-center sm:text-left">
              <p className="mb-2 text-sm font-medium">Avatar Accent Color (Fallback when photo is not shown)</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3" role="radiogroup" aria-label="Placeholder colour">
                {AVATAR_TONE_CLASSES.map((cls, i) => (
                  <button
                    key={cls}
                    type="button"
                    role="radio"
                    aria-checked={draft.tone === i}
                    aria-label={`Colour ${i + 1}`}
                    onClick={() => set("tone", i)}
                    className={cn(
                      "h-10 w-10 cursor-pointer rounded-full ring-offset-2 ring-offset-card transition",
                      cls,
                      draft.tone === i ? "ring-2 ring-gold" : "hover:scale-105",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t pt-6">
          <Button variant="outline" onClick={() => go(step - 1)} disabled={step === 0 || saving}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => go(step + 1)} disabled={saving}>
              {saving ? (
                "Saving…"
              ) : (
                <>
                  Save & continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => go(step, true)} disabled={saving}>
              {saving
                ? "Saving…"
                : profile.status === "approved"
                  ? "Save profile"
                  : "Submit for review"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileWizard;
