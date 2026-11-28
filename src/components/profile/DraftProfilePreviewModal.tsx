"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ageFromDob, formatHeight, shortHeight } from "@/lib/matching";
import type { Profile } from "@/lib/types";
import {
  Sparkles,
  Check,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  Heart,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  Compass,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";

interface DraftProfilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: Profile;
  onPublish?: () => void;
  submitting?: boolean;
}

export function DraftProfilePreviewModal({
  open,
  onOpenChange,
  draft,
  onPublish,
  submitting = false,
}: DraftProfilePreviewModalProps) {
  const age = draft.dob ? ageFromDob(draft.dob) : 26;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl bg-background border border-border shadow-2xl">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-primary/15 via-gold/15 to-secondary/30 p-5 sm:p-6 border-b border-border">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                Live Matrimonial Biodata Preview
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" /> ID Verified Candidate
              </span>
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-display font-bold text-foreground pt-2">
              {draft.name || "Candidate Name"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              This preview reflects exactly how prospective life partners and their families will see your profile on Perfect Jodi.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          {/* Candidate Hero Card */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <ProfileAvatar
                name={draft.name || "User"}
                tone={draft.tone}
                size="xl"
                photoUrl={draft.photoUrl}
                className="ring-4 ring-gold/40 shadow-md shrink-0"
              />

              <div className="space-y-2.5 text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    {draft.name || "Your Name"}
                  </h3>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                    Profile created by {draft.createdBy || "Self"}
                  </span>
                </div>

                {/* Primary Tagline */}
                <p className="text-sm sm:text-base font-medium text-foreground/90">
                  {age} Years • {formatHeight(draft.heightCm || 165)} • {draft.maritalStatus}
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-foreground/80">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                    {draft.designation ? `${draft.designation} (${draft.occupation})` : draft.occupation} • {draft.income}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    {draft.city}, {draft.state ? `${draft.state}, ` : ""}{draft.country || "India"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {draft.religion} ({draft.community}{draft.subCaste ? ` - ${draft.subCaste}` : ""}) • {draft.manglik || "Non-Manglik"} • {draft.motherTongue}
                </p>
              </div>
            </div>
          </div>

          {/* About Bio Section */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" /> About {draft.name?.split(" ")[0] || "Candidate"}
            </h4>
            <div className="rounded-xl bg-secondary/30 p-4 text-sm sm:text-base italic leading-relaxed text-foreground/90 border-l-4 border-gold">
              &ldquo;{draft.about || "Warm, ambitious professional looking for a life partner who values family, growth, and companionship."}&rdquo;
            </div>

            {/* Hobbies */}
            {draft.hobbies && draft.hobbies.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-muted-foreground block mb-2">
                  Interests & Passions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {draft.hobbies.map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-3 py-0.5 text-xs font-medium text-foreground border"
                    >
                      • {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Direct Contact Details Block */}
          <div className="rounded-2xl border border-gold/40 bg-gold/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gold-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-gold" /> Dedicated Profile Contact Details
              </h4>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-foreground bg-gold/15 px-2.5 py-0.5 rounded-full border border-gold/30">
                🔒 Parda Privacy Protected
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              These are the dedicated contact details you provided for match communications. In accordance with matrimonial privacy, prospective matches unlock access to these contact details only after mutual connection.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-1 text-xs">
              <div className="rounded-xl bg-background p-3 border flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Candidate Mobile Number</span>
                  <span className="font-bold text-foreground text-sm">
                    {draft.mobile ? `+91 ${draft.mobile}` : "Not specified"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-background p-3 border flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block font-medium">Candidate Contact Email</span>
                  <span className="font-bold text-foreground text-sm truncate block">
                    {draft.email || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Structured Biodata Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* 1. Vedic Kundali & Horoscope */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 text-xs">
              <h5 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
                <Compass className="h-4 w-4 text-gold" /> Personal & Vedic Horoscope
              </h5>
              <div className="space-y-1.5 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Religion & Caste:</span>
                  <strong className="text-foreground">{draft.religion} ({draft.community})</strong>
                </div>
                {draft.subCaste && (
                  <div className="flex justify-between">
                    <span>Sub-Caste:</span>
                    <strong className="text-foreground">{draft.subCaste}</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Gotra:</span>
                  <strong className="text-foreground">{draft.gotra || "Not specified"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Manglik Status:</span>
                  <strong className="text-foreground">{draft.manglik || "Non-Manglik"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Rashi (Moon Sign):</span>
                  <strong className="text-foreground">{draft.rashi || "Not specified"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Nakshatra:</span>
                  <strong className="text-foreground">{draft.nakshatra || "Not specified"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Birth Time & Place:</span>
                  <strong className="text-foreground">
                    {draft.birthTime || "N/A"} • {draft.birthPlace || "N/A"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Mother Tongue:</span>
                  <strong className="text-foreground">{draft.motherTongue}</strong>
                </div>
              </div>
            </div>

            {/* 2. Education & Career */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 text-xs">
              <h5 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Education & Career
              </h5>
              <div className="space-y-1.5 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Highest Qualification:</span>
                  <strong className="text-foreground">{draft.qualification}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Education Level:</span>
                  <strong className="text-foreground">{draft.educationLevel || "Bachelor's"}</strong>
                </div>
                {draft.educationField && (
                  <div className="flex justify-between">
                    <span>Field of Study:</span>
                    <strong className="text-foreground">{draft.educationField}</strong>
                  </div>
                )}
                {draft.college && (
                  <div className="flex justify-between">
                    <span>College / University:</span>
                    <strong className="text-foreground">{draft.college}</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Profession / Role:</span>
                  <strong className="text-foreground">
                    {draft.designation ? `${draft.designation} (${draft.occupation})` : draft.occupation}
                  </strong>
                </div>
                {draft.company && (
                  <div className="flex justify-between">
                    <span>Company:</span>
                    <strong className="text-foreground">{draft.company}</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Employment Sector:</span>
                  <strong className="text-foreground">{draft.employmentType || "Private sector"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Annual Income:</span>
                  <strong className="text-emerald-600 font-bold">{draft.income}</strong>
                </div>
              </div>
            </div>

            {/* 3. Family Background */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 text-xs">
              <h5 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
                <Users className="h-4 w-4 text-primary" /> Family Details
              </h5>
              <div className="space-y-1.5 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Family Type & Values:</span>
                  <strong className="text-foreground">{draft.familyType} • {draft.familyValues}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Family Status:</span>
                  <strong className="text-foreground">{draft.familyStatus || "Middle class"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Father's Occupation:</span>
                  <strong className="text-foreground">{draft.fatherOccupation || "Not specified"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Mother's Occupation:</span>
                  <strong className="text-foreground">{draft.motherOccupation || "Not specified"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Brothers & Sisters:</span>
                  <strong className="text-foreground">
                    {draft.brothersCount ?? 0} Brothers • {draft.sistersCount ?? 0} Sisters
                  </strong>
                </div>
                {draft.siblings && (
                  <div className="flex justify-between">
                    <span>Siblings Details:</span>
                    <strong className="text-foreground">{draft.siblings}</strong>
                  </div>
                )}
                {draft.aboutFamily && (
                  <p className="text-[11px] text-muted-foreground pt-1 border-t italic">
                    &ldquo;{draft.aboutFamily}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* 4. Lifestyle & Expectations */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 text-xs">
              <h5 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
                <Heart className="h-4 w-4 text-rose-500" /> Lifestyle & Expectations
              </h5>
              <div className="space-y-1.5 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Dietary Habit:</span>
                  <strong className="text-foreground">🌱 {draft.diet}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Smoking & Drinking:</span>
                  <strong className="text-foreground">🚭 {draft.smoking} • 🍷 {draft.drinking}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Marriage Timeline:</span>
                  <strong className="text-foreground">{draft.marriageTimeline || "6–12 months"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Living Arrangement:</span>
                  <strong className="text-foreground">{draft.livingArrangement || "Flexible"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Children Preference:</span>
                  <strong className="text-foreground">{draft.childrenPreference || "Yes"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Willingness to Relocate:</span>
                  <strong className="text-foreground">{draft.willingToRelocate || "Flexible"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Partner Preferences Summary */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 text-xs">
            <h5 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Preferred Partner Profile
            </h5>
            <div className="grid gap-2 sm:grid-cols-2 text-muted-foreground">
              <div>
                <span>Preferred Age Range: </span>
                <strong className="text-foreground">
                  {draft.prefs?.ageMin || 21} – {draft.prefs?.ageMax || 32} years
                </strong>
              </div>
              <div>
                <span>Preferred Height Range: </span>
                <strong className="text-foreground">
                  {shortHeight(draft.prefs?.heightMin || 155)} – {shortHeight(draft.prefs?.heightMax || 185)}
                </strong>
              </div>
              <div>
                <span>Preferred Religions: </span>
                <strong className="text-foreground">
                  {draft.prefs?.religions?.join(", ") || "Open to all"}
                </strong>
              </div>
              <div>
                <span>Preferred Locations: </span>
                <strong className="text-foreground">
                  {draft.prefs?.locations?.join(", ") || "Any location"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-muted/40 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Close & Continue Editing
          </Button>

          {onPublish && (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onPublish();
              }}
              disabled={submitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer"
            >
              {submitting ? "Saving..." : "Looks Great! Publish Profile Now"}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
