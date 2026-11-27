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
  ArrowRight,
  Moon,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { NativeSelect } from "@/components/common/NativeSelect";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { MatchCompatibilityDialog } from "@/components/profile/MatchCompatibilityDialog";
import { useSession } from "@/hooks/use-demo";
import { sendInterest, toggleShortlist, syncAllProfilesFromDb } from "@/lib/actions";
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

export default function MatchesPage() {
  const { state, profile, account } = useSession();
  const navigate = useNavigate();

  const [tab, setTab] = useState<MatchTab>("daily");
  const [minScore, setMinScore] = useState<string>("0");
  const [selectedMatch, setSelectedMatch] = useState<{
    profile: Profile;
    compat: Compatibility;
    defaultTab?: "overview" | "kundali";
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync latest live profiles from MongoDB Atlas on mount
  useEffect(() => {
    syncAllProfilesFromDb();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncAllProfilesFromDb();
    setIsRefreshing(false);
    toast.success("Profiles and match recommendations updated.");
  };

  const all = state.profiles;

  // Calculate Matches Based on Selected Strategy Tab
  const rawMatches = useMemo(() => {
    if (!profile) return [];
    switch (tab) {
      case "daily":
        return getDailyMatches(profile, all);
      case "mutual":
        return getMutualMatches(profile, all);
      case "near_me":
        return getNearMeMatches(profile, all);
      case "kundali":
        return getKundaliMatches(profile, all);
      case "reverse":
        return getReverseMatches(profile, all);
      default:
        return recommendedMatches(profile, all);
    }
  }, [profile, all, tab]);

  // Apply Score Filter
  const matches = useMemo(() => {
    const min = parseInt(minScore, 10) || 0;
    if (min === 0) return rawMatches;
    return rawMatches.filter((m) => m.compat.score >= min);
  }, [rawMatches, minScore]);

  if (!profile) {
    return (
      <div className="container-page py-10">
        <EmptyState
          icon={User}
          title="Create your profile to see AI & Kundali Matches"
          text="To see your personalized AI recommendations, 2-way mutual matches, and Kundali Milan scores, please create your matrimonial profile."
          action={
            <Button asChild>
              <Link to="/my-profile">Complete Profile</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const handleSendInterest = (targetId: string) => {
    sendInterest(profile.id, targetId);
    toast.success("Interest sent successfully!");
  };

  const hasSentInterest = (targetId: string) => {
    return state.interests.some(
      (i) => i.fromProfileId === profile.id && i.toProfileId === targetId,
    );
  };

  return (
    <div className="container-page py-8 space-y-6">
      {/* Page Header */}
      <MemberPageTitle
        title="AI Matchmaking & Vedic Kundali"
        text="Real-time bidirectional 2-way matching based on partner preferences, lifestyle, and Vedic Kundali Milan."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-xl border-border/80 gap-1.5 shadow-xs"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh Matches</span>
            </Button>

            <div className="w-36">
              <NativeSelect
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

      {/* DEDICATED SECTION: KUNDALI MILAN MATCH CENTER FOR BOTH */}
      {tab === "kundali" && (
        <div className="rounded-2xl border border-gold/40 bg-gradient-to-r from-primary/10 via-gold/10 to-primary/10 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <h3 className="font-bold text-base sm:text-lg text-foreground font-display">
                  Vedic Kundali Milan Center (वर-वधू पत्रिका मिलान)
                </h3>
                <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] px-2.5 py-0.5 font-bold">
                  18+ Gunas Auspicious
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time 36-Guna Ashtakoot Milan and Manglik compatibility between your birth chart and potential partners.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-gold/50 text-foreground hover:bg-gold/10 gap-1.5 shrink-0 text-xs"
            >
              <Link to="/my-profile">
                <span>Update Your Astro Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* User's own Kundali Snapshot */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
            <span className="font-semibold text-foreground">Your Birth Chart:</span>
            <span className="rounded-md bg-background px-2.5 py-1 border text-muted-foreground">
              Rashi (Moon): <strong className="text-foreground">{profile.rashi || "Not specified"}</strong>
            </span>
            <span className="rounded-md bg-background px-2.5 py-1 border text-muted-foreground">
              Nakshatra: <strong className="text-foreground">{profile.nakshatra || "Not specified"}</strong>
            </span>
            <span className="rounded-md bg-background px-2.5 py-1 border text-muted-foreground">
              Manglik: <strong className="text-foreground">{profile.manglik || "Non-Manglik"}</strong>
            </span>
            <span className="rounded-md bg-background px-2.5 py-1 border text-muted-foreground">
              Birth City: <strong className="text-foreground">{profile.birthPlace || profile.city}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Info Context Bar for other tabs */}
      {tab !== "kundali" && (
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
            {tab === "reverse" && (
              <span>
                <strong>Members Looking for You:</strong> Profiles whose search criteria specifically match your age ({ageFromDob(profile.dob)}), height, and background.
              </span>
            )}
          </div>
        </div>
      )}

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
          {matches.map(({ profile: p, compat }) => (
            <div key={p.id} className="relative flex flex-col">
              {tab === "kundali" && (
                <div className="rounded-t-2xl bg-gradient-to-r from-amber-500/15 via-gold/20 to-amber-500/15 border-t border-x border-gold/40 px-3.5 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    <span className="font-bold text-foreground">
                      {compat.kundali.totalScore} / 36 Gunas
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      ({compat.kundali.verdict.split(" ")[0]})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMatch({
                        profile: p,
                        compat,
                        defaultTab: "kundali",
                      })
                    }
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View Both Kundalis</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div className={cn(tab === "kundali" && "rounded-b-2xl [&>div]:rounded-t-none")}>
                <ProfileCard
                  profile={p}
                  compat={compat.score}
                  highlights={compat.highlights}
                  onCompare={() =>
                    setSelectedMatch({
                      profile: p,
                      compat,
                      defaultTab: tab === "kundali" ? "kundali" : "overview",
                    })
                  }
                />
              </div>
            </div>
          ))}
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
          defaultTab={selectedMatch.defaultTab || (tab === "kundali" ? "kundali" : "overview")}
          onSendInterest={() => handleSendInterest(selectedMatch.profile.id)}
          interestSent={hasSentInterest(selectedMatch.profile.id)}
        />
      )}
    </div>
  );
}
