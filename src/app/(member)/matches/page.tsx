"use client";

import { Link, useNavigate } from "@/lib/navigation";
import {
  Compass,
  Heart,
  Info,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { NativeSelect } from "@/components/common/NativeSelect";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { MatchCompatibilityDialog } from "@/components/profile/MatchCompatibilityDialog";
import { useSession } from "@/hooks/use-demo";
import { sendInterest, toggleShortlist } from "@/lib/actions";
import {
  ageFromDob,
  compatibility,
  formatHeight,
  getDailyMatches,
  getKundaliMatches,
  getMutualMatches,
  getNearMeMatches,
  getReverseMatches,
  recommendedMatches,
  type Compatibility,
} from "@/lib/matching";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

type MatchTab = "daily" | "mutual" | "near_me" | "kundali" | "reverse";
import { recommendedMatches } from "@/lib/matching";

export default function MatchesPage() {
  const { state, profile, account } = useSession();
  const navigate = useNavigate();

  const [tab, setTab] = useState<MatchTab>("daily");
  const [minScore, setMinScore] = useState<string>("0");
  const [selectedMatch, setSelectedMatch] = useState<{ profile: Profile; compat: Compatibility } | null>(null);

  // Derive matches based on selected real-world tab
  const rawMatches = useMemo(() => {
    if (!profile) return [];
    const all = state.profiles;
    switch (tab) {
      case "mutual":
        return getMutualMatches(profile, all);
      case "near_me":
        return getNearMeMatches(profile, all);
      case "kundali":
        return getKundaliMatches(profile, all);
      case "reverse":
        return getReverseMatches(profile, all);
      case "daily":
      default:
        return recommendedMatches(profile, all);
    }
  }, [profile, state.profiles, tab]);

  // Filter by minimum score
  const matches = useMemo(() => {
    const min = Number(minScore) || 0;
    return rawMatches.filter((m) => m.compat.score >= min);
  }, [rawMatches, minScore]);

  if (!profile) {
    return (
      <div className="surface mx-auto max-w-xl space-y-4 p-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <User className="h-8 w-8" />
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold">Complete Your Profile First</h2>
        <p className="text-sm text-muted-foreground">
          To see your personalized AI recommendations, 2-way mutual matches, and Kundali Milan scores, please create your matrimonial profile.
        </p>
        <div className="pt-2">
          <Button asChild size="lg">
            <Link to="/create-profile">Create Profile Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSendInterest = (targetId: string) => {
    const res = sendInterest(targetId);
    if (res.ok) {
      toast.success("Interest sent successfully! The member has been notified.");
    } else {
      toast.info(res.error || "Interest already active.");
    }
  };

  const hasSentInterest = (targetId: string) => {
    return state.interests.some(
      (i) => i.fromProfileId === profile.id && i.toProfileId === targetId && i.status !== "withdrawn",
    );
  };

  return (
    <div className="space-y-6">
      <MemberPageTitle
        title="Automated Matches & Recommendations"
        text="Real-time bidirectional 2-way matching based on partner preferences, lifestyle, and Vedic Kundali Milan."
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Min Match:</span>
            <div className="w-36">
              <NativeSelect
                aria-label="Minimum match score"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                options={[
                  { value: "0", label: "All scores" },
                  { value: "60", label: "60% & above" },
                  { value: "75", label: "75% & above" },
                  { value: "85", label: "85% & above" },
                ]}
              />
            </div>
          </div>
        }
      />

      {/* Tabs Bar */}
      <div className="surface p-2 flex flex-wrap gap-1.5 overflow-x-auto text-sm">
        <button
          type="button"
          onClick={() => setTab("daily")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all cursor-pointer whitespace-nowrap",
            tab === "daily"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Sparkles className="h-4 w-4 text-gold" />
          Daily Top Recommendations
        </button>

        <button
          type="button"
          onClick={() => setTab("mutual")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all cursor-pointer whitespace-nowrap",
            tab === "mutual"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Users className="h-4 w-4" />
          2-Way Mutual Matches
        </button>

        <button
          type="button"
          onClick={() => setTab("near_me")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all cursor-pointer whitespace-nowrap",
            tab === "near_me"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <MapPin className="h-4 w-4" />
          Near You ({profile.city})
        </button>

        <button
          type="button"
          onClick={() => setTab("kundali")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all cursor-pointer whitespace-nowrap",
            tab === "kundali"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <ShieldCheck className="h-4 w-4 text-gold" />
          Kundali Auspicious (18+ Gunas)
        </button>

        <button
          type="button"
          onClick={() => setTab("reverse")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all cursor-pointer whitespace-nowrap",
            tab === "reverse"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Compass className="h-4 w-4" />
          Looking for You
        </button>
      </div>

      {/* Info Context Bar */}
      <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold-soft/50 p-4 text-xs leading-relaxed text-foreground/90">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <div>
          {tab === "daily" && (
            <span>
              <strong>Daily Recommendations:</strong> Top profiles matching your religion, community, education, and location. Click on <em>&ldquo;Compare Match&rdquo;</em> on any card to see full side-by-side compatibility and 36 Gunas.
            </span>
          )}
          {tab === "mutual" && (
            <span>
              <strong>2-Way Mutual Matches:</strong> These members meet your partner preferences, and <em>you also meet their exact partner preferences</em>. Responses on mutual matches are 3x higher.
            </span>
          )}
          {tab === "near_me" && (
            <span>
              <strong>Near You:</strong> Filtered for members residing in <strong>{profile.city}</strong> or within <strong>{profile.state || "your state"}</strong>.
            </span>
          )}
          {tab === "kundali" && (
            <span>
              <strong>Vedic Kundali Matches:</strong> Filtered for matches with <strong>18+ Ashtakoot Gunas</strong> and harmonious Manglik status.
            </span>
          )}
          {tab === "reverse" && (
            <span>
              <strong>Members Looking for You:</strong> Profiles whose search criteria specifically match your age ({ageFromDob(profile.dob)}), height, and background.
            </span>
          )}
        </div>
      </div>

      {/* Matches Grid */}
      {matches.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No profiles match this specific tab yet"
          text="Try adjusting your partner preferences or checking the 'Daily Top Recommendations' tab."
          action={
            <Button onClick={() => setTab("daily")}>View Daily Recommendations</Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map(({ profile: p, compat }) => {
            const interestSent = hasSentInterest(p.id);

            return (
              <div key={p.id} className="flex flex-col">
                <ProfileCard
                  profile={p}
                  compat={compat.score}
                  footer={
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {/* Highlight Chips */}
                      <div className="flex flex-wrap gap-1.5 min-h-[48px]">
                        {compat.highlights.slice(0, 3).map((h) => (
                          <span
                            key={h}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                          >
                            <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                            <span className="truncate max-w-[140px]">{h}</span>
                          </span>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setSelectedMatch({ profile: p, compat })}
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-1 text-gold" />
                          Compare
                        </Button>

                        <Button
                          size="sm"
                          className={cn(
                            "w-full text-xs",
                            interestSent
                              ? "bg-muted text-muted-foreground hover:bg-muted"
                              : "bg-primary text-primary-foreground hover:bg-primary/90",
                          )}
                          disabled={interestSent}
                          onClick={() => handleSendInterest(p.id)}
                        >
                          <Heart className={cn("h-3.5 w-3.5 mr-1", interestSent && "fill-muted-foreground")} />
                          {interestSent ? "Interest Sent" : "Connect"}
                        </Button>
                      </div>
                    </div>
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Side-by-Side Comparison Dialog */}
      {selectedMatch && (
        <MatchCompatibilityDialog
          open={Boolean(selectedMatch)}
          onOpenChange={(open) => !open && setSelectedMatch(null)}
          me={profile}
          other={selectedMatch.profile}
          compat={selectedMatch.compat}
          onSendInterest={() => handleSendInterest(selectedMatch.profile.id)}
          interestSent={hasSentInterest(selectedMatch.profile.id)}
        />
      )}
    </div>
  );
}
