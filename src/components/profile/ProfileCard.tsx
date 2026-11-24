"use client";

import { Link, useNavigate } from "@/lib/navigation";
import {
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Heart,
  MapPin,
  Ruler,
  Send,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MembershipBadge } from "@/components/common/StatusBadge";
import { getProfilePhoto } from "@/data/profile-photos";
import { useSession } from "@/hooks/use-demo";
import { sendInterest, toggleShortlist } from "@/lib/actions";
import { ageFromDob, shortHeight } from "@/lib/matching";
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
  const [sending, setSending] = useState(false);

  const owner = state.accounts.find((a) => a.id === profile.ownerId);
  const shortlisted = account ? (state.shortlists[account.id] ?? []).includes(profile.id) : false;
  const isMine = account?.profileId === profile.id;

  // Check if an interest is already sent or received
  const existingInterest =
    account && account.profileId
      ? state.interests.find(
          (i) =>
            (i.fromProfileId === account.profileId && i.toProfileId === profile.id) ||
            (i.fromProfileId === profile.id && i.toProfileId === account.profileId),
        )
      : undefined;

  const photoUrl = profile.photoUrl || getProfilePhoto(profile);

  const onShortlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!account) {
      toast.info("Please log in to shortlist profiles.");
      navigate({ to: "/login", search: { redirect: "/profiles" } });
      return;
    }
    const r = toggleShortlist(profile.id);
    if (r.ok) {
      toast.success(
        r.added
          ? `${profile.name} added to your shortlist ❤️`
          : `${profile.name} removed from shortlist`,
      );
    } else {
      toast.error(r.error);
    }
  };

  const onSendInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!account) {
      toast.info(`Please log in to connect with ${profile.name}.`);
      navigate({ to: "/login", search: { redirect: `/profiles/${profile.id}` } });
      return;
    }
    if (account.role === "admin") {
      toast.info("Admin accounts cannot send member interests.");
      return;
    }
    setSending(true);
    const r = sendInterest(profile.id);
    setSending(false);
    if (r.ok) {
      toast.success(`Interest sent to ${profile.name}! They will be notified.`);
    } else {
      toast.info(r.error);
    }
  };

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1.5",
        layout === "grid" ? "flex-col" : "flex-col sm:flex-row",
      )}
    >
      {/* Visual Portrait Image Header */}
      <div
        className={cn(
          "relative overflow-hidden bg-stone-900 group",
          layout === "grid" ? "h-68 sm:h-72 w-full" : "h-68 sm:h-auto sm:w-60 shrink-0",
        )}
      >
        <img
          src={photoUrl}
          alt={`Portrait of ${profile.name}`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getProfilePhoto({
              id: profile.id,
              gender: profile.gender,
            });
          }}
        />

        {/* Ambient Dark Gradient Vignette for crisp typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/25 to-transparent pointer-events-none" />

        {/* Top Badges Bar */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between pointer-events-none">
          {typeof compat === "number" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-950/80 px-3 py-1 text-xs font-semibold text-gold shadow-md border border-gold/40 backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-gold" />
              {compat}% Match
            </span>
          ) : profile.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/85 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 shadow-md border border-emerald-500/40 backdrop-blur-md">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
              Verified
            </span>
          ) : (
            <div />
          )}

          {!isMine && (
            <button
              type="button"
              onClick={onShortlist}
              aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
              className={cn(
                "pointer-events-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-stone-950/70 shadow-lg border backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95",
                shortlisted
                  ? "border-rose-400/60 text-rose-500 bg-stone-950/90"
                  : "border-white/20 text-white/80 hover:text-rose-400 hover:border-rose-400/50",
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-transform",
                  shortlisted && "fill-rose-500 text-rose-500 scale-110",
                )}
              />
            </button>
          )}
        </div>

        {/* Bottom Photo Overlay Info */}
        <div className="absolute inset-x-3.5 bottom-3 text-white pointer-events-none">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-md flex items-center gap-1.5 truncate">
              <span className="truncate">{profile.name}</span>
              <span className="text-base font-medium text-white/90">
                , {ageFromDob(profile.dob)}
              </span>
            </h3>
            {owner && owner.membership !== "free" && (
              <span className="shrink-0 scale-90 origin-right">
                <MembershipBadge tier={owner.membership} />
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/90 drop-shadow">
            <span className="inline-flex items-center gap-1 font-medium">
              <MapPin className="h-3 w-3 text-gold shrink-0" /> {profile.city || "India"}
            </span>
            <span>·</span>
            <span className="text-white/80">{shortHeight(profile.heightCm)}</span>
            {profile.createdBy && (
              <>
                <span>·</span>
                <span className="text-[10px] uppercase tracking-wider text-gold font-bold">
                  By {profile.createdBy}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Body Details */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 font-medium text-secondary-foreground border border-border/60">
              {profile.religion || "—"}
              {profile.community ? ` · ${profile.community}` : ""}
            </span>
            {profile.motherTongue && (
              <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-muted-foreground border border-border/50">
                {profile.motherTongue}
              </span>
            )}
          </div>

          {/* Quick Specifications */}
          <div className="mt-3 space-y-1.5 text-xs sm:text-sm text-foreground/85">
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 shrink-0 text-gold" />
              <span className="truncate font-medium">
                {profile.occupation || "Professional"}
                {profile.company ? ` at ${profile.company}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5 shrink-0 text-gold" />
              <span className="truncate font-medium">{profile.qualification || "Graduate"}</span>
            </div>
            {profile.income && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span className="text-gold font-bold">₹</span>
                <span className="font-medium text-foreground/75">Earns {profile.income}</span>
              </div>
            )}
          </div>

          {/* Short About snippet */}
          {profile.about && (
            <p className="mt-3 text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed border-l-2 border-gold/40 pl-2.5">
              “{profile.about}”
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-border/60 flex items-center gap-2">
          {!isMine && (
            <Button
              type="button"
              size="sm"
              onClick={onSendInterest}
              disabled={sending || !!existingInterest}
              className={cn(
                "flex-1 font-semibold rounded-xl text-xs sm:text-sm shadow-xs cursor-pointer transition-all gap-1.5",
                existingInterest
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary border border-border"
                  : "bg-primary hover:bg-primary/90 text-white shadow-primary/20",
              )}
            >
              {existingInterest ? (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-gold" />
                  {existingInterest.status === "accepted" ? "Connected" : "Interest Sent"}
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Connect
                </>
              )}
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 font-semibold rounded-xl text-xs sm:text-sm border-gold/40 hover:bg-gold/10 text-primary shadow-2xs cursor-pointer"
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
