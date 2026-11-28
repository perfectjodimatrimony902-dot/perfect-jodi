"use client";

import { useState } from "react";
import { Link } from "@/lib/navigation";
import {
  Sparkles,
  ShieldCheck,
  Moon,
  Sun,
  Printer,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  Heart,
  ArrowRight,
  Info,
  Compass,
  Gem,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/common/NativeSelect";
import { Progress } from "@/components/ui/progress";
import { TimePickerAmPm } from "@/components/common/TimePickerAmPm";
import { useSession } from "@/hooks/use-demo";
import { cn } from "@/lib/utils";
import {
  calculateSingleKundali,
  type SingleKundaliInput,
  type SingleKundaliResult,
} from "@/lib/kundali";

interface MatchBirthInput {
  name: string;
  dob: string;
  birthTime: string;
  city: string;
  manglik: string;
}

const SAMPLE_BOY: MatchBirthInput = {
  name: "Aditya Sharma",
  dob: "1994-08-25",
  birthTime: "10:30 AM",
  city: "Mumbai",
  manglik: "Non-Manglik",
};

const SAMPLE_GIRL: MatchBirthInput = {
  name: "Pooja Kulkarni",
  dob: "1996-04-12",
  birthTime: "02:15 PM",
  city: "Pune",
  manglik: "Non-Manglik",
};

const SAMPLE_SINGLE: SingleKundaliInput = {
  name: "Rohan Deshpande",
  gender: "male",
  dob: "1995-05-14",
  birthTime: "10:45 AM",
  city: "Pune",
  manglik: "Non-Manglik",
};

const EMPTY_MATCH_INPUT: MatchBirthInput = {
  name: "",
  dob: "",
  birthTime: "10:00 AM",
  city: "",
  manglik: "Non-Manglik",
};

const EMPTY_SINGLE_INPUT: SingleKundaliInput = {
  name: "",
  gender: "male",
  dob: "",
  birthTime: "10:00 AM",
  city: "",
  manglik: "Non-Manglik",
};

const MANGLIK_OPTIONS = [
  "Non-Manglik",
  "Manglik",
  "Anshik Manglik",
  "Don't Know",
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male (वर / Boy)" },
  { value: "female", label: "Female (वधू / Girl)" },
];

export default function KundaliMatchingPage() {
  const { profile } = useSession();

  // Mode: "single" = Single Person Janam Kundali, "match" = 36 Guna Milan
  const [mode, setMode] = useState<"single" | "match">("single");

  // Single person state
  const [single, setSingle] = useState<SingleKundaliInput>(EMPTY_SINGLE_INPUT);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<SingleKundaliResult | null>(null);

  // Match state (Boy & Girl)
  const [boy, setBoy] = useState<MatchBirthInput>(EMPTY_MATCH_INPUT);
  const [girl, setGirl] = useState<MatchBirthInput>(EMPTY_MATCH_INPUT);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  // --- Handlers for Single Mode ---
  const handleSingleFillSample = () => {
    setSingle(SAMPLE_SINGLE);
    toast.info("Sample birth details loaded. Click 'Generate My Kundali' to view horoscope.");
  };

  const handleSingleFillMyDetails = () => {
    if (!profile) {
      toast.error("Please log in to auto-fill your profile details.");
      return;
    }
    setSingle({
      name: profile.name || "",
      gender: profile.gender === "female" ? "female" : "male",
      dob: profile.dob || "",
      birthTime: profile.birthTime || "10:00 AM",
      city: profile.birthPlace || profile.city || "Mumbai",
      manglik: profile.manglik || "Non-Manglik",
      rashi: profile.rashi,
      nakshatra: profile.nakshatra,
    });
    toast.success("Loaded your saved birth details.");
  };

  const handleSingleReset = () => {
    setSingle(EMPTY_SINGLE_INPUT);
    setSingleResult(null);
  };

  const handleSingleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!single.dob) {
      toast.error("Please enter Date of Birth.");
      return;
    }

    setSingleLoading(true);
    setSingleResult(null);

    try {
      const res = await fetch("/api/kundali/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(single),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.result) {
          setSingleResult(data.result);
          toast.success("Janam Kundali generated successfully!");
          setTimeout(() => {
            document.getElementById("single-kundali-result")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
          setSingleLoading(false);
          return;
        }
      }

      const clientResult = calculateSingleKundali(single);
      setSingleResult(clientResult);
      toast.success("Janam Kundali generated successfully!");
      setTimeout(() => {
        document.getElementById("single-kundali-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      const clientResult = calculateSingleKundali(single);
      setSingleResult(clientResult);
      toast.success("Janam Kundali generated successfully!");
      setTimeout(() => {
        document.getElementById("single-kundali-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } finally {
      setSingleLoading(false);
    }
  };

  // --- Handlers for Match Mode ---
  const handleMatchFillSample = () => {
    setBoy(SAMPLE_BOY);
    setGirl(SAMPLE_GIRL);
    toast.info("Sample Vedic birth details loaded. Click 'Calculate Kundali Milan' to test.");
  };

  const handleMatchFillMyDetails = () => {
    if (!profile) {
      toast.error("Please log in to auto-fill your profile details.");
      return;
    }
    const myData: MatchBirthInput = {
      name: profile.name,
      dob: profile.dob,
      birthTime: profile.birthTime || "10:30 AM",
      city: profile.birthPlace || profile.city || "Mumbai",
      manglik: profile.manglik || "Non-Manglik",
    };

    if (profile.gender === "male") {
      setBoy(myData);
      toast.success("Loaded your birth details as Groom (वर).");
    } else {
      setGirl(myData);
      toast.success("Loaded your birth details as Bride (वधू).");
    }
  };

  const handleMatchReset = () => {
    setBoy(EMPTY_MATCH_INPUT);
    setGirl(EMPTY_MATCH_INPUT);
    setMatchResult(null);
  };

  const handleMatchCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boy.dob) {
      toast.error("Please enter the Groom's Date of Birth.");
      return;
    }
    if (!girl.dob) {
      toast.error("Please enter the Bride's Date of Birth.");
      return;
    }

    setMatchLoading(true);
    setMatchResult(null);

    try {
      const res = await fetch("/api/kundali/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boy: {
            name: boy.name || "Groom",
            gender: "male",
            dob: boy.dob,
            birthTime: boy.birthTime || "10:30 AM",
            city: boy.city || "Mumbai",
            manglik: boy.manglik,
          },
          girl: {
            name: girl.name || "Bride",
            gender: "female",
            dob: girl.dob,
            birthTime: girl.birthTime || "02:15 PM",
            city: girl.city || "Pune",
            manglik: girl.manglik,
          },
        }),
      });

      const data = await res.json();
      setMatchLoading(false);

      if (!res.ok || !data.ok) {
        toast.error(data.error || "Failed to calculate Kundali Milan. Please check inputs.");
        return;
      }

      setMatchResult(data);
      toast.success(`Kundali Milan complete: ${data.totalScore}/36 Gunas matched!`);

      setTimeout(() => {
        document.getElementById("match-kundali-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setMatchLoading(false);
      toast.error("Error communicating with Kundali match service. Please retry.");
    }
  };

  const matchAstro = matchResult?.astroProfiles;
  const matchIsAuspicious = matchResult?.isAuspicious ?? false;
  const matchTotalScore = matchResult?.totalScore ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <PageHero
        title="Vedic Kundali & Horoscope (वैदिक जन्म पत्रिका व मिलान)"
        subtitle="Instant free single person Janam Kundali analysis & 36-Guna Ashtakoot Horoscope Milan for Bride & Groom. Powered by high-precision Vedic calculations."
        crumb="Kundali Check"
      />

      <div className="container-page py-10 space-y-8">
        {/* Mode Switcher Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={cn(
              "flex-1 w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm transition-all border shadow-xs",
              mode === "single"
                ? "bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border"
            )}
          >
            <User className="h-4 w-4" />
            <span>Single Person Kundali (एकल जन्म पत्रिका)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("match")}
            className={cn(
              "flex-1 w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm transition-all border shadow-xs",
              mode === "match"
                ? "bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border"
            )}
          >
            <Heart className="h-4 w-4" />
            <span>Kundali Matching (36 गुण मिलान)</span>
          </button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* MODE 1: SINGLE PERSON JANAM KUNDALI                              */}
        {/* ----------------------------------------------------------------- */}
        {mode === "single" && (
          <div className="space-y-8">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span>Calculate your Lagna, Moon sign (Rashi), Nakshatra, Charan, Manglik status & lucky attributes.</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {profile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSingleFillMyDetails}
                    className="flex-1 sm:flex-initial text-xs"
                  >
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    Fill My Details
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSingleFillSample}
                  className="flex-1 sm:flex-initial text-xs"
                >
                  Load Sample
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSingleReset}
                  className="text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Single Kundali Form */}
            <form onSubmit={handleSingleCalculate} className="space-y-6">
              <div className="bg-card rounded-2xl border p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">Personal Birth Details (जन्म तपशील)</h2>
                    <p className="text-xs text-muted-foreground">Enter accurate time and place for precise astrological calculations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Full Name (पूर्ण नाव)</label>
                    <Input
                      placeholder="e.g. Rohan Deshpande"
                      value={single.name}
                      onChange={(e) => setSingle({ ...single, name: e.target.value })}
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Gender (लिंग) *</label>
                    <NativeSelect
                      options={GENDER_OPTIONS}
                      value={single.gender}
                      onChange={(e) => setSingle({ ...single, gender: e.target.value as "male" | "female" })}
                    />
                  </div>

                  {/* DOB */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Date of Birth (जन्म तारीख) *</label>
                    <Input
                      type="date"
                      value={single.dob}
                      onChange={(e) => setSingle({ ...single, dob: e.target.value })}
                      required
                    />
                  </div>

                  {/* Birth Time with AM/PM */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Birth Time (जन्म वेळ - AM / PM) *</label>
                    <TimePickerAmPm
                      value={single.birthTime || "10:00 AM"}
                      onChange={(val) => setSingle({ ...single, birthTime: val })}
                    />
                  </div>

                  {/* Birth City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Birth Place / City (जन्म ठिकाण)</label>
                    <Input
                      placeholder="e.g. Pune, Maharashtra"
                      value={single.city || single.birthPlace || ""}
                      onChange={(e) => setSingle({ ...single, city: e.target.value, birthPlace: e.target.value })}
                    />
                  </div>

                  {/* Manglik Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Known Manglik Status (मांगलिक)</label>
                    <NativeSelect
                      options={MANGLIK_OPTIONS}
                      value={single.manglik || "Non-Manglik"}
                      onChange={(e) => setSingle({ ...single, manglik: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t flex flex-col sm:flex-row items-center justify-end gap-3">
                  <Button
                    type="submit"
                    disabled={singleLoading}
                    size="lg"
                    className="w-full sm:w-auto bg-primary text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    {singleLoading ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Generating Vedic Kundali...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate My Janam Kundali (कुंडली पहा)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Single Kundali Result View */}
            {singleResult && (
              <div id="single-kundali-result" className="bg-card rounded-2xl border shadow-sm p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
                {/* Result Top Bar with Print */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-2">
                      <Sparkles className="h-3.5 w-3.5" />
                      Vedic Janam Kundali Report (जन्म पत्रिका)
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {singleResult.personal.name}&apos;s Horoscope
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      Born on {singleResult.personal.formattedDob} at {singleResult.personal.formattedBirthTime} in {singleResult.personal.birthPlace} ({singleResult.personal.dayOfWeek})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="text-xs"
                    >
                      <Printer className="h-4 w-4 mr-1.5" />
                      Print Kundali Card
                    </Button>
                  </div>
                </div>

                {/* 4 Primary Pillars: Lagna, Rashi, Nakshatra, Sun Sign */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Lagna / Ascendant */}
                  <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                      <span className="text-xs font-bold uppercase tracking-wider">Lagna (लग्न / Ascendant)</span>
                      <Sun className="h-4 w-4" />
                    </div>
                    <p className="text-xl font-black text-foreground">{singleResult.astrology.lagna}</p>
                    <p className="text-xs text-muted-foreground">Lord: <strong className="text-foreground">{singleResult.astrology.lagnaLord}</strong></p>
                  </div>

                  {/* Moon Sign (Rashi) */}
                  <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400">
                      <span className="text-xs font-bold uppercase tracking-wider">Moon Sign (राशी)</span>
                      <Moon className="h-4 w-4" />
                    </div>
                    <p className="text-xl font-black text-foreground">{singleResult.astrology.rashi}</p>
                    <p className="text-xs text-muted-foreground">
                      Lord: <strong className="text-foreground">{singleResult.astrology.rashiLord}</strong> • {singleResult.astrology.rashiElement}
                    </p>
                  </div>

                  {/* Nakshatra & Charan */}
                  <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
                      <span className="text-xs font-bold uppercase tracking-wider">Nakshatra & Charan</span>
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <p className="text-xl font-black text-foreground">{singleResult.astrology.nakshatra}</p>
                    <p className="text-xs text-muted-foreground">
                      Pada/Charan: <strong className="text-foreground">{singleResult.astrology.pada}</strong> • Lord: {singleResult.astrology.nakshatraLord}
                    </p>
                  </div>

                  {/* Sun Sign */}
                  <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                      <span className="text-xs font-bold uppercase tracking-wider">Sun Sign (सूर्य राशी)</span>
                      <Award className="h-4 w-4" />
                    </div>
                    <p className="text-xl font-black text-foreground">{singleResult.astrology.sunSign}</p>
                    <p className="text-xs text-muted-foreground">Solar transit sign at birth</p>
                  </div>
                </div>

                {/* Ashtakoot 5 Pillars + Manglik Card */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ashtakoot Fundamental Attributes */}
                  <div className="rounded-xl border p-5 space-y-4 bg-muted/20">
                    <div className="flex items-center gap-2 border-b pb-3 font-bold text-sm text-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>Ashtakoot Vedic Attributes (अष्टकूट घटक)</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-background rounded-lg border p-2.5">
                        <span className="text-muted-foreground block text-[11px]">Varna (वर्ण)</span>
                        <strong className="text-foreground text-sm">{singleResult.astrology.varna}</strong>
                      </div>
                      <div className="bg-background rounded-lg border p-2.5">
                        <span className="text-muted-foreground block text-[11px]">Vashya (वश्य)</span>
                        <strong className="text-foreground text-sm">{singleResult.astrology.vashya}</strong>
                      </div>
                      <div className="bg-background rounded-lg border p-2.5">
                        <span className="text-muted-foreground block text-[11px]">Yoni (योनी)</span>
                        <strong className="text-foreground text-sm">{singleResult.astrology.yoni}</strong>
                      </div>
                      <div className="bg-background rounded-lg border p-2.5">
                        <span className="text-muted-foreground block text-[11px]">Gana (गण)</span>
                        <strong className="text-foreground text-sm">{singleResult.astrology.gana}</strong>
                      </div>
                      <div className="bg-background rounded-lg border p-2.5">
                        <span className="text-muted-foreground block text-[11px]">Nadi (नाडी)</span>
                        <strong className="text-foreground text-sm">{singleResult.astrology.nadi}</strong>
                      </div>
                      <div className="bg-background rounded-lg border p-2.5">
                        <span className="text-muted-foreground block text-[11px]">Symbol (चिन्ह)</span>
                        <strong className="text-foreground text-sm">{singleResult.astrology.rashiSymbol}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Manglik Analysis */}
                  <div className={cn(
                    "rounded-xl border p-5 space-y-3",
                    singleResult.manglikStatus.isManglik
                      ? "bg-rose-500/5 border-rose-500/30"
                      : singleResult.manglikStatus.isAnshik
                      ? "bg-amber-500/5 border-amber-500/30"
                      : "bg-emerald-500/5 border-emerald-500/30"
                  )}>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        {singleResult.manglikStatus.isManglik ? (
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        )}
                        <span className="font-bold text-sm text-foreground">
                          {singleResult.manglikStatus.title}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[11px] font-bold px-2 py-0.5 rounded-full",
                        singleResult.manglikStatus.isManglik
                          ? "bg-rose-100 text-rose-800"
                          : singleResult.manglikStatus.isAnshik
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      )}>
                        Severity: {singleResult.manglikStatus.severity}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {singleResult.manglikStatus.description}
                    </p>

                    {singleResult.manglikStatus.remedies && singleResult.manglikStatus.remedies.length > 0 && (
                      <div className="pt-2 border-t border-border/50 space-y-1.5">
                        <span className="text-xs font-bold text-foreground">Vedic Remedies (उपाय):</span>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                          {singleResult.manglikStatus.remedies.map((rem, i) => (
                            <li key={i}>{rem}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lucky Attributes & Matrimonial Compatibility */}
                <div className="rounded-xl border p-6 bg-gradient-to-br from-card via-muted/20 to-card space-y-5">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <Compass className="h-5 w-5 text-primary" />
                    <h4 className="font-bold text-base text-foreground">
                      Lucky Matrimonial Attributes & Favorable Factors
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="bg-background rounded-lg border p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Gem className="h-3.5 w-3.5 text-primary" />
                        <span>Lucky Gemstone</span>
                      </div>
                      <p className="font-bold text-sm text-foreground">{singleResult.luckyAttributes.gemstone}</p>
                    </div>

                    <div className="bg-background rounded-lg border p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        <span>Favorable Metal</span>
                      </div>
                      <p className="font-bold text-sm text-foreground">{singleResult.luckyAttributes.metal}</p>
                    </div>

                    <div className="bg-background rounded-lg border p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Auspicious Days</span>
                      </div>
                      <p className="font-bold text-sm text-foreground">{singleResult.luckyAttributes.favorableDays.join(", ")}</p>
                    </div>

                    <div className="bg-background rounded-lg border p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Compass className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Auspicious Direction</span>
                      </div>
                      <p className="font-bold text-sm text-foreground">{singleResult.luckyAttributes.favorableDirection}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                    <div className="bg-background rounded-lg border p-3 space-y-1">
                      <span className="text-muted-foreground">Lucky Colors & Numbers:</span>
                      <p className="font-semibold text-foreground">
                        Colors: {singleResult.luckyAttributes.colors.join(", ")} | Numbers: {singleResult.luckyAttributes.numbers.join(", ")}
                      </p>
                    </div>

                    <div className="bg-background rounded-lg border p-3 space-y-1">
                      <span className="text-muted-foreground">Most Compatible Rashis for Marriage (सुयोग्य राशी):</span>
                      <p className="font-bold text-primary">
                        {singleResult.luckyAttributes.friendlyRashis.join(" • ")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg border border-primary/20 p-4 space-y-1 text-xs">
                    <span className="font-bold text-foreground">Astrological Matrimonial Guidance:</span>
                    <p className="text-muted-foreground leading-relaxed">{singleResult.traits.marriageAdvice}</p>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setMode("match")}
                      className="w-full sm:w-auto text-xs"
                    >
                      <Heart className="h-4 w-4 mr-2 text-rose-500" />
                      Now Compare with a Partner (36 Guna Milan)
                    </Button>

                    <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground gap-1.5 shadow-md">
                      <Link to="/profiles">
                        <span>Find Compatible Matches for {singleResult.astrology.rashi}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* MODE 2: BRIDE & GROOM 36-GUNA ASHTAKOOT MILAN                    */}
        {/* ----------------------------------------------------------------- */}
        {mode === "match" && (
          <div className="space-y-8">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>36 Guna Ashtakoot Horoscope Milan for Groom (वर) & Bride (वधू). Minimum 18 points recommended.</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {profile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleMatchFillMyDetails}
                    className="flex-1 sm:flex-initial text-xs"
                  >
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    Fill My Details
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleMatchFillSample}
                  className="flex-1 sm:flex-initial text-xs"
                >
                  Load Sample
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleMatchReset}
                  className="text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Input Forms: 2 Columns for Groom and Bride */}
            <form onSubmit={handleMatchCalculate} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Groom Card */}
                <div className="bg-card rounded-2xl border p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 border-b pb-3">
                    <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">Groom Details (वर तपशील)</h3>
                      <p className="text-xs text-muted-foreground">Boy&apos;s exact Vedic birth information</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Groom Name (वर नाव)</label>
                      <Input
                        placeholder="e.g. Aditya Sharma"
                        value={boy.name}
                        onChange={(e) => setBoy({ ...boy, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Date of Birth (जन्म तारीख) *</label>
                      <Input
                        type="date"
                        value={boy.dob}
                        onChange={(e) => setBoy({ ...boy, dob: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Birth Time (जन्म वेळ - AM / PM) *</label>
                      <TimePickerAmPm
                        value={boy.birthTime || "10:30 AM"}
                        onChange={(val) => setBoy({ ...boy, birthTime: val })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Birth Place / City (जन्म शहर)</label>
                      <Input
                        placeholder="e.g. Mumbai, Maharashtra"
                        value={boy.city}
                        onChange={(e) => setBoy({ ...boy, city: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Manglik Status (मांगलिक)</label>
                      <NativeSelect
                        options={MANGLIK_OPTIONS}
                        value={boy.manglik}
                        onChange={(e) => setBoy({ ...boy, manglik: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Bride Card */}
                <div className="bg-card rounded-2xl border p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 border-b pb-3">
                    <div className="h-9 w-9 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">Bride Details (वधू तपशील)</h3>
                      <p className="text-xs text-muted-foreground">Girl&apos;s exact Vedic birth information</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Bride Name (वधू नाव)</label>
                      <Input
                        placeholder="e.g. Pooja Kulkarni"
                        value={girl.name}
                        onChange={(e) => setGirl({ ...girl, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Date of Birth (जन्म तारीख) *</label>
                      <Input
                        type="date"
                        value={girl.dob}
                        onChange={(e) => setGirl({ ...girl, dob: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Birth Time (जन्म वेळ - AM / PM) *</label>
                      <TimePickerAmPm
                        value={girl.birthTime || "02:15 PM"}
                        onChange={(val) => setGirl({ ...girl, birthTime: val })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Birth Place / City (जन्म शहर)</label>
                      <Input
                        placeholder="e.g. Pune, Maharashtra"
                        value={girl.city}
                        onChange={(e) => setGirl({ ...girl, city: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Manglik Status (मांगलिक)</label>
                      <NativeSelect
                        options={MANGLIK_OPTIONS}
                        value={girl.manglik}
                        onChange={(e) => setGirl({ ...girl, manglik: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Match CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Button
                  type="submit"
                  disabled={matchLoading}
                  size="lg"
                  className="w-full sm:w-auto px-8 bg-primary text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {matchLoading ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Calculating 36 Guna Ashtakoot Milan...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2 text-rose-300 fill-rose-300" />
                      Calculate Kundali Milan (गुण मिलान करा)
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Match Results View */}
            {matchResult && (
              <div id="match-kundali-result" className="bg-card rounded-2xl border shadow-sm p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
                {/* Result Header & Score Card */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                      <Sparkles className="h-3.5 w-3.5" />
                      Vedic Ashtakoot Match Result
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {boy.name || "Groom"} &amp; {girl.name || "Bride"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Analysis calculated across 8 Vedic Kootas (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi)
                    </p>
                  </div>

                  {/* Score Pill */}
                  <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground uppercase font-bold block">Match Score</span>
                      <div className="flex items-baseline gap-1">
                        <span className={cn(
                          "text-3xl font-black",
                          matchTotalScore >= 24
                            ? "text-emerald-600"
                            : matchTotalScore >= 18
                            ? "text-amber-600"
                            : "text-rose-600"
                        )}>
                          {matchTotalScore}
                        </span>
                        <span className="text-muted-foreground font-bold text-sm">/ 36</span>
                      </div>
                    </div>

                    <div className="h-10 w-px bg-border" />

                    <div>
                      <span className={cn(
                        "inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
                        matchIsAuspicious
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-amber-500/15 text-amber-800"
                      )}>
                        {matchIsAuspicious ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Auspicious Match
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Requires Remedies
                          </>
                        )}
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {matchTotalScore >= 28
                          ? "Uttam (उत्तम - Exceptional)"
                          : matchTotalScore >= 18
                          ? "Madhyam (मध्यम - Auspicious)"
                          : "Adham (अधम - Critical)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Astro Profile Cards Comparison */}
                {matchAstro && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Groom Astro */}
                    <div className="rounded-xl border p-4 bg-blue-500/5 border-blue-500/20 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span className="text-blue-700 dark:text-blue-400">Groom Planetary Profile (वर)</span>
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>Rashi: <strong>{matchAstro.boy.rashi}</strong></div>
                        <div>Lord: <strong>{matchAstro.boy.rashiLord}</strong></div>
                        <div>Nakshatra: <strong>{matchAstro.boy.nakshatra}</strong></div>
                        <div>Charan: <strong>{matchAstro.boy.charan}</strong></div>
                        <div>Manglik: <strong>{matchAstro.boy.manglik}</strong></div>
                        <div>Gana: <strong>{matchAstro.boy.gana}</strong></div>
                      </div>
                    </div>

                    {/* Bride Astro */}
                    <div className="rounded-xl border p-4 bg-rose-500/5 border-rose-500/20 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span className="text-rose-700 dark:text-rose-400">Bride Planetary Profile (वधू)</span>
                        <Heart className="h-4 w-4 text-rose-600" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>Rashi: <strong>{matchAstro.girl.rashi}</strong></div>
                        <div>Lord: <strong>{matchAstro.girl.rashiLord}</strong></div>
                        <div>Nakshatra: <strong>{matchAstro.girl.nakshatra}</strong></div>
                        <div>Charan: <strong>{matchAstro.girl.charan}</strong></div>
                        <div>Manglik: <strong>{matchAstro.girl.manglik}</strong></div>
                        <div>Gana: <strong>{matchAstro.girl.gana}</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dosha Warnings & Remedies */}
                {matchResult.doshas && (matchResult.doshas.nadiDosha || matchResult.doshas.bhakootDosha || matchResult.doshas.manglikDosha) && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Vedic Astrological Observations &amp; Remedies:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {matchResult.doshas.nadiDosha && (
                        <span className="rounded-md bg-amber-200/80 text-amber-900 px-2 py-0.5 font-semibold text-[11px]">
                          Nadi Dosha Detected
                        </span>
                      )}
                      {matchResult.doshas.bhakootDosha && (
                        <span className="rounded-md bg-amber-200/80 text-amber-900 px-2 py-0.5 font-semibold text-[11px]">
                          Bhakoot Dosha Detected
                        </span>
                      )}
                      {matchResult.doshas.manglikDosha && (
                        <span className="rounded-md bg-amber-200/80 text-amber-900 px-2 py-0.5 font-semibold text-[11px]">
                          Mangal Dosha Variance
                        </span>
                      )}
                    </div>
                    {matchResult.remedies && matchResult.remedies.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground pt-1 pl-1">
                        {matchResult.remedies.map((rem: string, idx: number) => (
                          <li key={idx} className="text-[11px] leading-relaxed">
                            <strong className="text-foreground">{rem.split(":")[0]}:</strong>
                            <span>{rem.split(":")[1] || ""}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Ashtakoot 8-Factor Detailed Breakdown */}
                <div className="rounded-xl border overflow-hidden text-xs shadow-xs">
                  <div className="bg-muted/70 px-4 py-3 font-bold text-foreground border-b flex items-center justify-between">
                    <span className="text-sm">Ashtakoot 8-Factor Breakdown (अष्टकूट 36 गुण मिलान)</span>
                    <span className="text-xs text-muted-foreground font-normal">Maximum: 36 Points</span>
                  </div>
                  <div className="divide-y">
                    {matchResult.kootas?.map((k: any) => (
                      <div key={k.name} className="p-3.5 hover:bg-muted/20 transition-colors space-y-1.5">
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
                            "rounded-full px-2.5 py-0.5 font-bold text-xs",
                            k.score === k.maxScore
                              ? "bg-emerald-500/15 text-emerald-700"
                              : k.score > 0
                              ? "bg-amber-500/15 text-amber-800"
                              : "bg-rose-500/15 text-rose-700"
                          )}>
                            {k.score} / {k.maxScore} Pts
                          </span>
                        </div>

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

                {/* Bottom CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto text-xs"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Check Another Match
                  </Button>

                  <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground gap-1.5 shadow-md">
                    <Link to="/profiles">
                      <span>Find Auspicious Matches on Perfect Jodi</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
