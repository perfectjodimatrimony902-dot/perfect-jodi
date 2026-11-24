"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { BadgeCheck, Briefcase, GraduationCap, Heart, MapPin, Ruler, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProfileAvatar } from "./ProfileAvatar";
import { MembershipBadge } from "@/components/common/StatusBadge";
import { useSession } from "@/hooks/use-demo";
import { toggleShortlist } from "@/lib/actions";
import { ageFromDob, profileCompletion, shortHeight } from "@/lib/matching";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProfileCard({
  profile,
  layout = "grid",
  compat,
  footer,
}: {
  profile: Profile;
  layout?: "grid" | "list";
  compat?: number;
  footer?: React.ReactNode;
}) {
  const { state, account } = useSession();
  const navigate = useNavigate();
  const owner = state.accounts.find((a) => a.id === profile.ownerId);
  const shortlisted = account ? (state.shortlists[account.id] ?? []).includes(profile.id) : false;
  const completion = profileCompletion(profile);
  const isMine = account?.profileId === profile.id;

  const onShortlist = () => {
    if (!account) {
      toast.info("Please log in to shortlist profiles.");
      navigate({ to: "/login", search: { redirect: "/profiles" } });
      return;
    }
    const r = toggleShortlist(profile.id);
    if (r.ok)
      toast.success(
        r.added
          ? `${profile.name} added to your shortlist`
          : `${profile.name} removed from shortlist`,
      );
    else toast.error(r.error);
  };

  const facts = [
    { icon: Ruler, text: `${ageFromDob(profile.dob)} yrs · ${shortHeight(profile.heightCm)}` },
    { icon: MapPin, text: profile.city || "—" },
    { icon: GraduationCap, text: profile.qualification || "—" },
    { icon: Briefcase, text: profile.occupation || "—" },
  ];

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-2xl hover:-translate-y-1.5",
        layout === "grid" ? "flex-col" : "flex-col sm:flex-row",
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center bg-gradient-to-br from-primary/15 via-secondary to-secondary/80 overflow-hidden",
          layout === "grid" ? "h-40" : "h-40 sm:h-auto sm:w-52",
        )}
      >
        <div className="transition-transform duration-300 group-hover:scale-105">
          <ProfileAvatar name={profile.name} tone={profile.tone} size="lg" photoUrl={profile.photoUrl} />
        </div>

        {typeof compat === "number" && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-primary shadow-md border border-primary/20 backdrop-blur-xs">
            <Sparkles className="h-3 w-3 text-gold" />
            {compat}% Match
          </span>
        )}

        {!isMine && (
          <button
            type="button"
            onClick={onShortlist}
            aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
            className={cn(
              "absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-card/95 shadow-md border border-border/60 transition-all hover:scale-110",
              shortlisted
                ? "text-primary border-primary/30"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            <Heart className={cn("h-4 w-4", shortlisted && "fill-primary text-primary")} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 truncate text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
              <span className="truncate">{profile.name}</span>
              {profile.verified && (
                <BadgeCheck
                  className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-label="Verified"
                />
              )}
            </h3>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {profile.religion || "—"}
              {profile.community ? ` · ${profile.community}` : ""}
            </p>
          </div>
          {owner && owner.membership !== "free" && <MembershipBadge tier={owner.membership} />}
        </div>

        <ul
          className={cn(
            "mt-4 grid gap-2 text-xs sm:text-sm",
            layout === "list" && "sm:grid-cols-2",
          )}
        >
          {facts.map(({ icon: Icon, text }, i) => (
            <li key={i} className="flex items-center gap-2 text-foreground/80">
              <Icon className="h-4 w-4 shrink-0 text-gold" />
              <span className="truncate font-medium">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-3 border-t border-border/60">
          <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground font-medium">
            <span>Profile Completeness</span>
            <span className="text-gold-foreground font-semibold">{completion}%</span>
          </div>
          <Progress value={completion} className="h-1.5 bg-muted rounded-full" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 pt-1">
          <Button
            asChild
            size="default"
            className="flex-1 font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm cursor-pointer"
          >
            <Link to="/profiles/$id" params={{ id: profile.id }}>
              View Profile
            </Link>
          </Button>
          {footer}
        </div>
      </div>
    </article>
  );
}
