"use client";

import { useState, useEffect } from "react";
import { Link } from "@/lib/navigation";
import {
  Sparkles,
  Heart,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Printer,
  Compass,
  Zap,
  User,
  Moon,
  Sun,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProfileAvatar } from "./ProfileAvatar";
import { ageFromDob, formatHeight, type Compatibility } from "@/lib/matching";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MatchCompatibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  me: Profile;
  other: Profile;
  compat: Compatibility;
  defaultTab?: "overview" | "kundali";
  onSendInterest?: () => void;
  interestSent?: boolean;
}

export function MatchCompatibilityDialog({
  open,
  onOpenChange,
  me,
  other,
  compat,
  defaultTab = "overview",
  onSendInterest,
  interestSent,
}: MatchCompatibilityDialogProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "kundali">(defaultTab);
  const [liveKundali, setLiveKundali] = useState<any>(null);
  const [loadingKundali, setLoadingKundali] = useState(false);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, open]);

  // Fetch Live Kundali Milan via FreeAstrologyAPI
  const fetchLiveMatch = () => {
    setLoadingKundali(true);
    const boy = me.gender === "male" ? me : other;
    const girl = me.gender === "female" ? me : other;

    fetch("/api/kundali/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boy, girl }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setLiveKundali(data);
        }
      })
      .catch((err) => {
        console.warn("Live kundali match error:", err);
      })
      .finally(() => {
        setLoadingKundali(false);
      });
  };

  useEffect(() => {
    if (open) {
      fetchLiveMatch();
    }
  }, [open, me.id, other.id]);

  const kundali = liveKundali || compat.kundali;
  const isAuspicious = kundali?.isAuspicious ?? false;
  const totalScore = kundali?.totalScore ?? 0;
  const astro = liveKundali?.astroProfiles;

  const comparisonRows = [
    { label: "Age", valMe: `${ageFromDob(me.dob)} yrs`, valOther: `${ageFromDob(other.dob)} yrs` },
    { label: "Height", valMe: formatHeight(me.heightCm), valOther: formatHeight(other.heightCm) },
    { label: "Religion", valMe: me.religion, valOther: other.religion },
    { label: "Community / Caste", valMe: me.community, valOther: other.community },
    { label: "Sub-Caste", valMe: me.subCaste || "—", valOther: other.subCaste || "—" },
    { label: "Manglik Status", valMe: me.manglik || "Non-Manglik", valOther: other.manglik || "Non-Manglik" },
    { label: "Rashi (Moon Sign)", valMe: me.rashi || "—", valOther: other.rashi || "—" },
    { label: "Birth Place / City", valMe: me.birthPlace || me.city, valOther: other.birthPlace || other.city },
    { label: "Birth Time", valMe: me.birthTime || "Not Specified", valOther: other.birthTime || "Not Specified" },
    { label: "Qualification", valMe: me.qualification, valOther: other.qualification },
    { label: "Occupation", valMe: me.occupation, valOther: other.occupation },
    { label: "Dietary Habit", valMe: me.diet, valOther: other.diet },
  ];

  const boyProfile = me.gender === "male" ? me : other;
  const girlProfile = me.gender === "female" ? me : other;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 print:p-0 print:border-none print:shadow-none">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-display font-bold">
              <Sparkles className="h-5 w-5 text-gold" />
              2-Way Match Compatibility & Vedic Milan
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Profiles Header Comparison */}
        <div className="relative mt-2 rounded-2xl bg-gradient-to-r from-primary/10 via-gold/10 to-primary/10 p-4 sm:p-5 border border-gold/30">
          <div className="flex items-center justify-between gap-4">
            {/* User A */}
            <div className="flex flex-col items-center text-center flex-1">
              <ProfileAvatar name={me.name} tone={me.tone} size="md" photoUrl={me.photoUrl} />
              <span className="font-semibold text-sm mt-1.5 text-foreground line-clamp-1">
                {me.name} (You)
              </span>
              <span className="text-xs text-muted-foreground">{me.city}</span>
            </div>

            {/* Score Center Dial */}
            <div className="flex flex-col items-center shrink-0 px-2 sm:px-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-gold shadow-md">
                <span className="font-display text-lg font-bold text-primary">
                  {compat.score}%
                </span>
              </div>
              <span className="text-[11px] font-semibold text-primary mt-1">
                {compat.score >= 80 ? "High Match" : compat.score >= 65 ? "Good Match" : "Moderate Match"}
              </span>
            </div>

            {/* User B */}
            <div className="flex flex-col items-center text-center flex-1">
              <ProfileAvatar name={other.name} tone={other.tone} size="md" photoUrl={other.photoUrl} />
              <span className="font-semibold text-sm mt-1.5 text-foreground line-clamp-1">
                {other.name}
              </span>
              <span className="text-xs text-muted-foreground">{other.city}</span>
            </div>
          </div>

          {/* Highlights Pills */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 pt-3 border-t border-border/60">
            {compat.highlights.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-0.5 text-[11px] font-medium text-foreground border shadow-xs"
              >
                <CheckCircle2 className="h-3 w-3 text-success" />
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs: Overview vs Kundali Milan */}
        <div className="flex items-center justify-between border-b pt-2 print:hidden">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer",
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Mutual Compatibility Grid
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kundali")}
              className={cn(
                "flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer",
                activeTab === "kundali"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span>Vedic Kundali Milan</span>
              <span className={cn(
                "rounded-full px-2 py-0.2 text-[10px] font-bold",
                totalScore >= 18 ? "bg-emerald-500/20 text-emerald-800" : "bg-amber-500/20 text-amber-800"
              )}>
                {totalScore}/36 Gunas
              </span>
            </button>
          </div>

          {activeTab === "kundali" && (
            <div className="flex items-center gap-1.5 pb-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchLiveMatch}
                disabled={loadingKundali}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
                title="Recalculate with live planetary ephemeris"
              >
                <RefreshCw className={cn("h-3 w-3", loadingKundali && "animate-spin text-primary")} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          )}
        </div>

        {/* Tab 1: Mutual Overview Comparison */}
        {activeTab === "overview" && (
          <div className="space-y-4 pt-2">
            {/* Category Score Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Preferences (2-Way)</span>
                  <span className="font-bold text-foreground">{compat.categories.preferences}/25</span>
                </div>
                <Progress value={(compat.categories.preferences / 25) * 100} className="mt-1.5 h-1.5 bg-muted" />
              </div>

              <div className="rounded-lg border bg-muted/30 p-2.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Religion & Caste</span>
                  <span className="font-bold text-foreground">{compat.categories.community}/20</span>
                </div>
                <Progress value={(compat.categories.community / 20) * 100} className="mt-1.5 h-1.5 bg-muted" />
              </div>

              <div className="rounded-lg border bg-muted/30 p-2.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Location & City</span>
                  <span className="font-bold text-foreground">{compat.categories.location}/15</span>
                </div>
                <Progress value={(compat.categories.location / 15) * 100} className="mt-1.5 h-1.5 bg-muted" />
              </div>

              <div className="rounded-lg border bg-muted/30 p-2.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Education & Career</span>
                  <span className="font-bold text-foreground">{compat.categories.education}/15</span>
                </div>
                <Progress value={(compat.categories.education / 15) * 100} className="mt-1.5 h-1.5 bg-muted" />
              </div>

              <div className="rounded-lg border bg-muted/30 p-2.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Lifestyle & Diet</span>
                  <span className="font-bold text-foreground">{compat.categories.lifestyle}/15</span>
                </div>
                <Progress value={(compat.categories.lifestyle / 15) * 100} className="mt-1.5 h-1.5 bg-muted" />
              </div>

              <div className="rounded-lg border bg-muted/30 p-2.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Astrology / Kundali</span>
                  <span className="font-bold text-foreground">{compat.categories.astrology}/10</span>
                </div>
                <Progress value={(compat.categories.astrology / 10) * 100} className="mt-1.5 h-1.5 bg-muted" />
              </div>
            </div>

            {/* Side-by-Side Detailed Table */}
            <div className="rounded-xl border overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="py-2 px-3">Criteria</th>
                    <th className="py-2 px-3">{me.name.split(" ")[0]} (You)</th>
                    <th className="py-2 px-3">{other.name.split(" ")[0]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {comparisonRows.map((r) => (
                    <tr key={r.label} className="hover:bg-muted/20">
                      <td className="py-2 px-3 font-medium text-muted-foreground">{r.label}</td>
                      <td className="py-2 px-3 font-medium text-foreground">{r.valMe}</td>
                      <td className="py-2 px-3 font-medium text-foreground">{r.valOther}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Vedic Kundali Milan 36 Gunas (Pro Mode) */}
        {activeTab === "kundali" && (
          <div className="space-y-4 pt-1">
            {/* API Live Source Indicator & Print Button */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5 border">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Vedic Astrology Engine: <strong>{liveKundali?.source || "FreeAstrologyAPI (Ephemeris Sync)"}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline cursor-pointer"
              >
                <Printer className="h-3 w-3" />
                <span>Print Report</span>
              </button>
            </div>

            {/* Score & Verdict Banner */}
            <div className={cn(
              "rounded-xl p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs",
              isAuspicious
                ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-200"
                : "bg-amber-50/80 border-amber-300 text-amber-950 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-200"
            )}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider",
                    isAuspicious ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  )}>
                    {kundali.verdict}
                  </span>
                  <span className="text-xs font-semibold opacity-80">
                    {totalScore >= 28 ? "Highly Recommended Match" : totalScore >= 18 ? "Approved for Marriage" : "Astrological Remedial Review"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium leading-relaxed mt-1 opacity-90">
                  {kundali.summary}
                </p>
              </div>

              <div className="shrink-0 flex items-baseline gap-1 bg-white/70 dark:bg-black/30 border border-current/20 rounded-xl px-4 py-2 self-end sm:self-center shadow-xs">
                <span className="font-display text-3xl font-extrabold text-primary">
                  {totalScore}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">/ 36 Gunas</span>
              </div>
            </div>

            {/* SECTION 1: SEPARATE SECTION FOR BOTH KUNDALIS (वर व वधू जन्म पत्रिका) */}
            <div className="rounded-xl border bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Moon className="h-4 w-4 text-gold" />
                  Kundali Profiles of Both (वर व वधू पत्रिका तपशील)
                </h4>
                <span className="text-[11px] text-muted-foreground font-medium">Side-by-Side Astrology Chart</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Groom's Kundali Card */}
                <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                    <div className="flex items-center gap-2">
                      <ProfileAvatar name={boyProfile.name} tone={boyProfile.tone} size="sm" photoUrl={boyProfile.photoUrl} />
                      <div>
                        <div className="font-bold text-foreground text-xs leading-none">{boyProfile.name}</div>
                        <span className="text-[10px] text-primary font-semibold">Groom (वर पत्रिका)</span>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      (boyProfile.manglik || "").toLowerCase().includes("non") ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-800"
                    )}>
                      {boyProfile.manglik || "Non-Manglik"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Rashi (Moon): </span>
                      <strong className="text-foreground">{astro?.groom?.rashi || boyProfile.rashi || "Mesh"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nakshatra: </span>
                      <strong className="text-foreground">{astro?.groom?.nakshatra || boyProfile.nakshatra || "Ashwini"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gana: </span>
                      <strong className="text-foreground">{astro?.groom?.gana || "Deva"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Yoni: </span>
                      <strong className="text-foreground">{astro?.groom?.yoni || "Ashwa"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nadi: </span>
                      <strong className="text-foreground">{astro?.groom?.nadi || "Adi"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Varna: </span>
                      <strong className="text-foreground">{astro?.groom?.varna || "Kshatriya"}</strong>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
                      <span>Born: {boyProfile.dob} · {boyProfile.birthTime || "12:00"} ({boyProfile.birthPlace || boyProfile.city})</span>
                    </div>
                  </div>
                </div>

                {/* Bride's Kundali Card */}
                <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                    <div className="flex items-center gap-2">
                      <ProfileAvatar name={girlProfile.name} tone={girlProfile.tone} size="sm" photoUrl={girlProfile.photoUrl} />
                      <div>
                        <div className="font-bold text-foreground text-xs leading-none">{girlProfile.name}</div>
                        <span className="text-[10px] text-gold font-bold">Bride (वधू पत्रिका)</span>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      (girlProfile.manglik || "").toLowerCase().includes("non") ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-800"
                    )}>
                      {girlProfile.manglik || "Non-Manglik"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Rashi (Moon): </span>
                      <strong className="text-foreground">{astro?.bride?.rashi || girlProfile.rashi || "Kanya"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nakshatra: </span>
                      <strong className="text-foreground">{astro?.bride?.nakshatra || girlProfile.nakshatra || "Hasta"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gana: </span>
                      <strong className="text-foreground">{astro?.bride?.gana || "Deva"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Yoni: </span>
                      <strong className="text-foreground">{astro?.bride?.yoni || "Mahisha"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nadi: </span>
                      <strong className="text-foreground">{astro?.bride?.nadi || "Madhya"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Varna: </span>
                      <strong className="text-foreground">{astro?.bride?.varna || "Vaishya"}</strong>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
                      <span>Born: {girlProfile.dob} · {girlProfile.birthTime || "12:00"} ({girlProfile.birthPlace || girlProfile.city})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Manglik Compatibility Card */}
            <div className="rounded-xl border bg-muted/20 p-3.5 text-xs flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <span>Manglik Compatibility:</span>
                  <span className={cn(
                    "text-[11px] px-2 py-0.2 rounded-full font-semibold",
                    kundali.manglikStatus?.isCompatible ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-800"
                  )}>
                    {kundali.manglikStatus?.isCompatible ? "Harmonious" : "Dosha Attention"}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {kundali.manglikStatus?.remark}
                </p>
              </div>
            </div>

            {/* SECTION 3: Dosha & Remedial Guidance (Pro Feature) */}
            {liveKundali?.doshas && (liveKundali.doshas.nadiDosha || liveKundali.doshas.bhakootDosha || liveKundali.doshas.manglikDosha) && (
              <div className="rounded-xl border border-amber-300/80 bg-amber-500/10 p-3.5 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Vedic Astrological Observations & Suggested Remedies:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {liveKundali.doshas.nadiDosha && (
                    <span className="rounded-md bg-amber-200/80 text-amber-900 px-2 py-0.5 font-semibold text-[11px]">
                      Nadi Dosha Detected
                    </span>
                  )}
                  {liveKundali.doshas.bhakootDosha && (
                    <span className="rounded-md bg-amber-200/80 text-amber-900 px-2 py-0.5 font-semibold text-[11px]">
                      Bhakoot Dosha Detected
                    </span>
                  )}
                  {liveKundali.doshas.manglikDosha && (
                    <span className="rounded-md bg-amber-200/80 text-amber-900 px-2 py-0.5 font-semibold text-[11px]">
                      Mangal Dosha Variance
                    </span>
                  )}
                </div>
                {liveKundali.remedies && liveKundali.remedies.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground pt-1 pl-1">
                    {liveKundali.remedies.map((rem: string, idx: number) => (
                      <li key={idx} className="text-[11px] leading-relaxed">
                        <strong className="text-foreground">{rem.split(":")[0]}:</strong>
                        <span>{rem.split(":")[1] || ""}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* SECTION 4: Ashtakoot 8-Guna Breakdown Table (Pro Layout) */}
            <div className="rounded-xl border overflow-hidden text-xs shadow-xs">
              <div className="bg-muted/70 px-3.5 py-2.5 font-bold text-foreground border-b flex items-center justify-between">
                <span>Ashtakoot 8-Factor Breakdown (अष्टकूट मिलान)</span>
                <span className="text-[11px] text-muted-foreground font-normal">Max: 36 Points</span>
              </div>
              <div className="divide-y">
                {kundali.kootas?.map((k: any) => (
                  <div key={k.name} className="p-3 hover:bg-muted/20 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">
                          {k.name}
                        </span>
                        <span className="text-muted-foreground text-xs font-semibold">
                          ({k.hindiName})
                        </span>
                      </div>
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 font-bold text-xs tracking-tight",
                        k.score === k.maxScore
                          ? "bg-emerald-500/15 text-emerald-700"
                          : k.score > 0
                          ? "bg-amber-500/15 text-amber-800"
                          : "bg-rose-500/15 text-rose-700"
                      )}>
                        {k.score} / {k.maxScore} Pts
                      </span>
                    </div>

                    {/* Specific Astrological Sign / Star / Attribute details */}
                    {k.details && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground bg-muted/30 rounded-md px-2.5 py-1">
                        <span><strong>Groom:</strong> {k.details.groom}</span>
                        <span><strong>Bride:</strong> {k.details.bride}</span>
                      </div>
                    )}

                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {k.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 border-t pt-4 print:hidden">
          <Button variant="outline" asChild size="sm">
            <Link to="/profiles/$id" params={{ id: other.id }}>
              View Full Profile <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>

          {onSendInterest && (
            <Button
              onClick={onSendInterest}
              disabled={interestSent}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Heart className={cn("mr-1.5 h-4 w-4", interestSent && "fill-white")} />
              {interestSent ? "Interest Sent" : "Send Interest"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
