"use client";

import { useState } from "react";
import { Link } from "@/lib/navigation";
import {
  Sparkles,
  Heart,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  User,
  Star,
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
  onSendInterest?: () => void;
  interestSent?: boolean;
}

export function MatchCompatibilityDialog({
  open,
  onOpenChange,
  me,
  other,
  compat,
  onSendInterest,
  interestSent,
}: MatchCompatibilityDialogProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "kundali">("overview");

  const comparisonRows = [
    { label: "Age", valMe: `${ageFromDob(me.dob)} yrs`, valOther: `${ageFromDob(other.dob)} yrs` },
    { label: "Height", valMe: formatHeight(me.heightCm), valOther: formatHeight(other.heightCm) },
    { label: "Religion", valMe: me.religion, valOther: other.religion },
    { label: "Community / Caste", valMe: me.community, valOther: other.community },
    { label: "Sub-Caste", valMe: me.subCaste || "—", valOther: other.subCaste || "—" },
    { label: "Manglik Status", valMe: me.manglik || "Non-Manglik", valOther: other.manglik || "Non-Manglik" },
    { label: "Rashi (Moon Sign)", valMe: me.rashi || "—", valOther: other.rashi || "—" },
    { label: "Current City", valMe: me.city, valOther: other.city },
    { label: "Qualification", valMe: me.qualification, valOther: other.qualification },
    { label: "Occupation", valMe: me.occupation, valOther: other.occupation },
    { label: "Annual Income", valMe: me.income, valOther: other.income },
    { label: "Dietary Habit", valMe: me.diet, valOther: other.diet },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display font-bold">
            <Sparkles className="h-5 w-5 text-gold" />
            2-Way Match Compatibility & Kundali Milan
          </DialogTitle>
        </DialogHeader>

        {/* Profiles Header Comparison */}
        <div className="relative mt-3 rounded-2xl bg-gradient-to-r from-primary/10 via-gold/10 to-primary/10 p-5 border border-gold/30">
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
            <div className="flex flex-col items-center shrink-0 px-3">
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
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 pt-3 border-t border-border/60">
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
        <div className="flex gap-2 border-b pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer",
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
              "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer",
              activeTab === "kundali"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <span>Vedic Kundali Milan</span>
            <span className="rounded-full bg-gold/20 px-2 py-0.2 text-[10px] text-amber-700 font-bold">
              {compat.kundali.totalScore}/36
            </span>
          </button>
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

        {/* Tab 2: Vedic Kundali Milan 36 Gunas */}
        {activeTab === "kundali" && (
          <div className="space-y-4 pt-2">
            <div className={cn(
              "rounded-xl p-4 border flex items-center justify-between",
              compat.kundali.isAuspicious
                ? "bg-success-soft/30 border-success/30 text-success"
                : "bg-amber-500/10 border-amber-500/30 text-amber-800"
            )}>
              <div>
                <h4 className="font-semibold text-sm">
                  Verdict: {compat.kundali.verdict}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {compat.kundali.summary}
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-bold">
                  {compat.kundali.totalScore}
                </span>
                <span className="text-xs text-muted-foreground font-medium"> / 36 Gunas</span>
              </div>
            </div>

            {/* Manglik Status Banner */}
            <div className="rounded-lg border bg-muted/30 p-3 text-xs flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <div>
                <strong>Manglik Compatibility: </strong>
                <span>{compat.kundali.manglikStatus.remark}</span>
              </div>
            </div>

            {/* 8 Kootas Table */}
            <div className="rounded-xl border overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="py-2 px-3">Koota</th>
                    <th className="py-2 px-3">Score</th>
                    <th className="py-2 px-3">Description / Effect</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {compat.kundali.kootas.map((k) => (
                    <tr key={k.name} className="hover:bg-muted/20">
                      <td className="py-2 px-3 font-medium">
                        {k.name} <span className="text-muted-foreground text-[10px]">({k.hindiName})</span>
                      </td>
                      <td className="py-2 px-3 font-bold">
                        <span className={cn(
                          k.score === k.maxScore ? "text-success" : k.score > 0 ? "text-amber-600" : "text-destructive"
                        )}>
                          {k.score} / {k.maxScore}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {k.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 border-t pt-4">
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
