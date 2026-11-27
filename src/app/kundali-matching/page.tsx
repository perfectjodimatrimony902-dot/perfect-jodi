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
} from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/common/NativeSelect";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/hooks/use-demo";
import { cn } from "@/lib/utils";

interface BirthInput {
  name: string;
  dob: string;
  birthTime: string;
  city: string;
  manglik: string;
}

const SAMPLE_BOY: BirthInput = {
  name: "Aditya Sharma",
  dob: "1994-08-25",
  birthTime: "10:30",
  city: "Mumbai",
  manglik: "Non-Manglik",
};

const SAMPLE_GIRL: BirthInput = {
  name: "Pooja Kulkarni",
  dob: "1996-04-12",
  birthTime: "14:15",
  city: "Pune",
  manglik: "Non-Manglik",
};

const EMPTY_INPUT: BirthInput = {
  name: "",
  dob: "",
  birthTime: "12:00",
  city: "",
  manglik: "Non-Manglik",
};

export default function KundaliMatchingPage() {
  const { profile } = useSession();

  const [boy, setBoy] = useState<BirthInput>(EMPTY_INPUT);
  const [girl, setGirl] = useState<BirthInput>(EMPTY_INPUT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fillSample = () => {
    setBoy(SAMPLE_BOY);
    setGirl(SAMPLE_GIRL);
    toast.info("Sample Vedic birth details loaded. Click 'Calculate Kundali Milan' to test.");
  };

  const fillMyDetails = () => {
    if (!profile) {
      toast.error("Please log in to auto-fill your profile details.");
      return;
    }
    const myData: BirthInput = {
      name: profile.name,
      dob: profile.dob,
      birthTime: profile.birthTime || "12:00",
      city: profile.birthPlace || profile.city,
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

  const handleReset = () => {
    setBoy(EMPTY_INPUT);
    setGirl(EMPTY_INPUT);
    setResult(null);
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boy.dob) {
      toast.error("Please enter the Groom's Date of Birth.");
      return;
    }
    if (!girl.dob) {
      toast.error("Please enter the Bride's Date of Birth.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/kundali/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boy: {
            name: boy.name || "Groom",
            gender: "male",
            dob: boy.dob,
            birthTime: boy.birthTime || "12:00",
            city: boy.city || "Mumbai",
            manglik: boy.manglik,
          },
          girl: {
            name: girl.name || "Bride",
            gender: "female",
            dob: girl.dob,
            birthTime: girl.birthTime || "12:00",
            city: girl.city || "Pune",
            manglik: girl.manglik,
          },
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.ok) {
        toast.error(data.error || "Failed to calculate Kundali Milan. Please check inputs.");
        return;
      }

      setResult(data);
      toast.success(`Kundali Milan complete: ${data.totalScore}/36 Gunas matched!`);

      // Scroll smoothly to result
      setTimeout(() => {
        document.getElementById("kundali-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setLoading(false);
      toast.error("Error communicating with Kundali match service. Please retry.");
    }
  };

  const astro = result?.astroProfiles;
  const isAuspicious = result?.isAuspicious ?? false;
  const totalScore = result?.totalScore ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <PageHero
        title="Vedic Kundali Matching (कुंडली मिलान)"
        subtitle="Free 36-Guna Ashtakoot Horoscope Milan for Bride & Groom. Powered by high-precision Vedic Astrology & live planetary calculations."
        crumb="Kundali Matching"
      />

      <div className="container-page py-10 space-y-10">
        {/* Intro Badge & Convenience Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/40 p-4 rounded-2xl border border-border/80">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground/90 font-medium">
            <ShieldCheck className="h-5 w-5 text-gold shrink-0" />
            <span>Open & Free for All Users · No Registration Required for Basic Match</span>
          </div>

          <div className="flex items-center gap-2">
            {profile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillMyDetails}
                className="text-xs gap-1.5 border-gold/40 hover:bg-gold/10"
              >
                <User className="h-3.5 w-3.5 text-gold" />
                <span>Fill My Details</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillSample}
              className="text-xs gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>Use Sample Details</span>
            </Button>
          </div>
        </div>

        {/* Input Form Cards */}
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GROOM (वर) DETAILS CARD */}
            <div className="rounded-2xl border border-primary/30 bg-card p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground font-display">
                      Groom's Details (वर जन्म विवरण)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Boy's birth date, time & place</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  Male / वर
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-medium text-foreground block mb-1">
                    Groom's Name (वराचे नाव)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Aditya Sharma"
                    value={boy.name}
                    onChange={(e) => setBoy({ ...boy, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Date of Birth (जन्म दिनांक) *
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        required
                        value={boy.dob}
                        onChange={(e) => setBoy({ ...boy, dob: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Time of Birth (जन्म वेळ)
                    </label>
                    <div className="relative">
                      <Input
                        type="time"
                        value={boy.birthTime}
                        onChange={(e) => setBoy({ ...boy, birthTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Birth Place / City (जन्म शहर)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Mumbai, Pune, Delhi"
                      value={boy.city}
                      onChange={(e) => setBoy({ ...boy, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Manglik Status (मांगलिक स्थिती)
                    </label>
                    <NativeSelect
                      value={boy.manglik}
                      onChange={(e) => setBoy({ ...boy, manglik: e.target.value })}
                      options={[
                        { value: "Non-Manglik", label: "Non-Manglik (अमांगलिक)" },
                        { value: "Manglik", label: "Manglik (मांगलिक)" },
                        { value: "Anshik Manglik", label: "Anshik / Partial Manglik" },
                        { value: "Don't Know", label: "Don't Know (माहित नाही)" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BRIDE (वधू) DETAILS CARD */}
            <div className="rounded-2xl border border-gold/40 bg-card p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-amber-800 dark:text-gold border border-gold/30">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground font-display">
                      Bride's Details (वधू जन्म विवरण)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Girl's birth date, time & place</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-amber-800 dark:text-gold px-2.5 py-1 rounded-full">
                  Female / वधू
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-medium text-foreground block mb-1">
                    Bride's Name (वधूचे नाव)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Pooja Kulkarni"
                    value={girl.name}
                    onChange={(e) => setGirl({ ...girl, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Date of Birth (जन्म दिनांक) *
                    </label>
                    <Input
                      type="date"
                      required
                      value={girl.dob}
                      onChange={(e) => setGirl({ ...girl, dob: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Time of Birth (जन्म वेळ)
                    </label>
                    <Input
                      type="time"
                      value={girl.birthTime}
                      onChange={(e) => setGirl({ ...girl, birthTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Birth Place / City (जन्म शहर)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Pune, Nagpur, Nashik"
                      value={girl.city}
                      onChange={(e) => setGirl({ ...girl, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Manglik Status (मांगलिक स्थिती)
                    </label>
                    <NativeSelect
                      value={girl.manglik}
                      onChange={(e) => setGirl({ ...girl, manglik: e.target.value })}
                      options={[
                        { value: "Non-Manglik", label: "Non-Manglik (अमांगलिक)" },
                        { value: "Manglik", label: "Manglik (मांगलिक)" },
                        { value: "Anshik Manglik", label: "Anshik / Partial Manglik" },
                        { value: "Don't Know", label: "Don't Know (माहित नाही)" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-6 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-md gap-2"
            >
              <Sparkles className={cn("h-5 w-5 text-gold", loading && "animate-spin")} />
              <span>{loading ? "Matching Kundalis via Ephemeris..." : "Calculate Kundali Milan (कुंडली मिलान करा)"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-6 text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset Form
            </Button>
          </div>
        </form>

        {/* LOADING ANIMATION */}
        {loading && (
          <div className="rounded-2xl border border-gold/40 bg-card p-10 text-center space-y-4 shadow-sm animate-pulse">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-gold text-primary">
              <Sparkles className="h-8 w-8 text-gold animate-spin" />
            </div>
            <h3 className="text-xl font-bold font-display text-primary">
              Computing 36-Guna Ashtakoot Milan...
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Analyzing planetary Moon signs, Nakshatra deities, animal Yonis, and vital Nadis through Vedic Astrological Ephemeris.
            </p>
          </div>
        )}

        {/* RESULT SECTION (PRO REPORT) */}
        {result && (
          <div id="kundali-result" className="space-y-6 pt-4 scroll-mt-6">
            {/* Header Result Card */}
            <div className="rounded-2xl border border-gold/50 bg-card p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Calculation Engine: <strong>{result.source || "FreeAstrologyAPI (Live Astrological Ephemeris)"}</strong>
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground mt-1">
                    Kundali Milan Score: {totalScore} / 36 Gunas
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="gap-1.5 border-border shadow-xs"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Report</span>
                  </Button>
                </div>
              </div>

              {/* Big Verdict Banner */}
              <div className={cn(
                "rounded-xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
                isAuspicious
                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-200"
                  : "bg-amber-50/80 border-amber-300 text-amber-950 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-200"
              )}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                      isAuspicious ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                    )}>
                      {result.verdict}
                    </span>
                    <span className="text-xs font-semibold opacity-85">
                      {totalScore >= 28 ? "Uttam (Highly Auspicious Union)" : totalScore >= 18 ? "Madhyam (Approved for Marriage)" : "Remedies Advised"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed mt-1 opacity-95">
                    {result.summary}
                  </p>
                </div>

                <div className="shrink-0 flex items-baseline gap-1 bg-white/70 dark:bg-black/30 border border-current/20 rounded-xl px-5 py-3 self-end sm:self-center shadow-xs">
                  <span className="font-display text-4xl font-extrabold text-primary">
                    {totalScore}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">/ 36 Gunas</span>
                </div>
              </div>

              {/* SEPARATE SECTION: KUNDALI PROFILES FOR BOTH */}
              <div className="rounded-xl border border-border/80 bg-muted/15 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Moon className="h-4 w-4 text-gold" />
                    Kundali Profiles of Both (वर व वधू जन्म पत्रिका विवरण)
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-medium">Side-by-Side Astro Chart</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* GROOM CARD */}
                  <div className="rounded-xl border border-primary/20 bg-card p-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-bold text-sm text-foreground">{astro?.groom?.name || boy.name || "Groom"}</div>
                        <span className="text-[11px] font-semibold text-primary">Groom (वर पत्रिका)</span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        (astro?.groom?.manglik || boy.manglik || "").toLowerCase().includes("non") ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-800"
                      )}>
                        {astro?.groom?.manglik || boy.manglik || "Non-Manglik"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                      <div>
                        <span className="text-muted-foreground">Rashi (Moon): </span>
                        <strong className="text-foreground">{astro?.groom?.rashi || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nakshatra: </span>
                        <strong className="text-foreground">{astro?.groom?.nakshatra || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rashi Lord: </span>
                        <strong className="text-foreground">{astro?.groom?.rashiLord || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gana (गण): </span>
                        <strong className="text-foreground">{astro?.groom?.gana || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Yoni (योनि): </span>
                        <strong className="text-foreground">{astro?.groom?.yoni || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nadi (नाडी): </span>
                        <strong className="text-foreground">{astro?.groom?.nadi || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Varna (वर्ण): </span>
                        <strong className="text-foreground">{astro?.groom?.varna || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vashya (वश्य): </span>
                        <strong className="text-foreground">{astro?.groom?.vashya || "—"}</strong>
                      </div>
                    </div>
                    <div className="pt-2 border-t text-[10px] text-muted-foreground">
                      <span>Born: {boy.dob} · {boy.birthTime || "12:00"} ({boy.city || "India"})</span>
                    </div>
                  </div>

                  {/* BRIDE CARD */}
                  <div className="rounded-xl border border-gold/30 bg-card p-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-bold text-sm text-foreground">{astro?.bride?.name || girl.name || "Bride"}</div>
                        <span className="text-[11px] font-bold text-gold">Bride (वधू पत्रिका)</span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        (astro?.bride?.manglik || girl.manglik || "").toLowerCase().includes("non") ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-800"
                      )}>
                        {astro?.bride?.manglik || girl.manglik || "Non-Manglik"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                      <div>
                        <span className="text-muted-foreground">Rashi (Moon): </span>
                        <strong className="text-foreground">{astro?.bride?.rashi || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nakshatra: </span>
                        <strong className="text-foreground">{astro?.bride?.nakshatra || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rashi Lord: </span>
                        <strong className="text-foreground">{astro?.bride?.rashiLord || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gana (गण): </span>
                        <strong className="text-foreground">{astro?.bride?.gana || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Yoni (योनि): </span>
                        <strong className="text-foreground">{astro?.bride?.yoni || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nadi (नाडी): </span>
                        <strong className="text-foreground">{astro?.bride?.nadi || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Varna (वर्ण): </span>
                        <strong className="text-foreground">{astro?.bride?.varna || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vashya (वश्य): </span>
                        <strong className="text-foreground">{astro?.bride?.vashya || "—"}</strong>
                      </div>
                    </div>
                    <div className="pt-2 border-t text-[10px] text-muted-foreground">
                      <span>Born: {girl.dob} · {girl.birthTime || "12:00"} ({girl.city || "India"})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manglik Compatibility Card */}
              <div className="rounded-xl border bg-muted/20 p-4 text-xs flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-foreground text-sm flex items-center gap-2">
                    <span>Manglik Compatibility:</span>
                    <span className={cn(
                      "text-[11px] px-2.5 py-0.5 rounded-full font-semibold",
                      result.manglikStatus?.isCompatible ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-800"
                    )}>
                      {result.manglikStatus?.isCompatible ? "Harmonious" : "Dosha Variance"}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {result.manglikStatus?.remark}
                  </p>
                </div>
              </div>

              {/* Doshas & Remedies */}
              {result.doshas && (result.doshas.nadiDosha || result.doshas.bhakootDosha || result.doshas.manglikDosha) && (
                <div className="rounded-xl border border-amber-300/80 bg-amber-500/10 p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Vedic Astrological Observations & Suggested Remedies:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {result.doshas.nadiDosha && (
                      <span className="rounded-md bg-amber-200/80 text-amber-900 px-2 py-0.5 font-semibold text-[11px]">
                        Nadi Dosha Detected
                      </span>
                    )}
                    {result.doshas.bhakootDosha && (
                      <span className="rounded-md bg-amber-200/80 text-amber-900 px-2 py-0.5 font-semibold text-[11px]">
                        Bhakoot Dosha Detected
                      </span>
                    )}
                    {result.doshas.manglikDosha && (
                      <span className="rounded-md bg-amber-200/80 text-amber-900 px-2 py-0.5 font-semibold text-[11px]">
                        Mangal Dosha Variance
                      </span>
                    )}
                  </div>
                  {result.remedies && result.remedies.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pt-1 pl-1">
                      {result.remedies.map((rem: string, idx: number) => (
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
                  {result.kootas?.map((k: any) => (
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
                  className="w-full sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Check Another Match
                </Button>

                <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground gap-1.5">
                  <Link to="/profiles">
                    <span>Find Auspicious Matches on Perfect Jodi</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
