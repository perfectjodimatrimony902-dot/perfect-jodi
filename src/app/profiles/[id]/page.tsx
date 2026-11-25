"use client";

import { Link, useNavigate, Route } from "@/lib/navigation";
import { useHydrated } from "@/lib/navigation";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Flag,
  GraduationCap,
  Heart,
  HeartHandshake,
  HeartOff,
  Home,
  Info,
  Lock,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Send,
  Share2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Undo2,
  User,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/EmptyState";
import { FormField } from "@/components/common/FormField";
import { NativeSelect } from "@/components/common/NativeSelect";
import { PageLoader } from "@/components/common/PageLoader";
import {
  InterestStatusBadge,
  MembershipBadge,
  ProfileStatusBadge,
  VerifiedBadge,
} from "@/components/common/StatusBadge";
import { MatchCompatibilityDialog } from "@/components/profile/MatchCompatibilityDialog";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { getProfileGallery, getProfilePhoto } from "@/data/profile-photos";
import { formatDate, useSession } from "@/hooks/use-demo";
import {
  recordProfileView,
  reportProfile,
  sendInterest,
  setInterestStatus,
  toggleShortlist,
} from "@/lib/actions";
import {
  ageFromDob,
  compatibility,
  formatHeight,
  profileCompletion,
  shortHeight,
} from "@/lib/matching";
import { REPORT_REASONS } from "@/lib/options";
import { cn } from "@/lib/utils";

function Section({ title, rows }: { title: string; rows: [string, string | undefined][] }) {
  return (
    <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
      <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between gap-3 border-b border-dashed border-border/60 pb-2 text-sm sm:block sm:border-0 sm:pb-0"
          >
            <dt className="text-muted-foreground text-xs">{k}</dt>
            <dd className="font-medium text-foreground sm:mt-0.5">{v || "Not specified"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function ProfileDetailPage() {
  const { id } = Route.useParams();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { state, account, profile: me } = useSession();
  const profile = state.profiles.find((p) => p.id === id);
  const [reportOpen, setReportOpen] = useState(false);
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0] ?? "Other");
  const [details, setDetails] = useState("");
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const isMine = !!me && me.id === id;
  const isAdmin = account?.role === "admin";

  useEffect(() => {
    if (hydrated && profile && profile.status === "approved") recordProfileView(profile.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, id]);

  const interest = useMemo(() => {
    if (!me) return undefined;
    return state.interests
      .filter(
        (i) =>
          (i.fromProfileId === me.id && i.toProfileId === id) ||
          (i.fromProfileId === id && i.toProfileId === me.id),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  }, [state.interests, me, id]);

  if (!hydrated) return <PageLoader label="Loading biodata…" />;

  if (!profile || (profile.status !== "approved" && !isMine && !isAdmin)) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={UserX}
          title="Profile not available"
          text="This profile may be under review or has been removed."
          action={
            <Button asChild>
              <Link to="/profiles">Browse profiles</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const owner = state.accounts.find((a) => a.id === profile.ownerId);
  const shortlisted = account ? (state.shortlists[account.id] ?? []).includes(profile.id) : false;
  const compat =
    me && !isMine && me.gender !== profile.gender ? compatibility(me, profile) : undefined;
  const completion = profileCompletion(profile);

  const requireLogin = (msg: string) => {
    toast.info(msg);
    navigate({ to: "/login", search: { redirect: `/profiles/${profile.id}` } });
  };

  const onInterest = () => {
    if (!account) return requireLogin("Please log in to send an interest.");
    if (isAdmin) return toast.info("Admins can't send interests.");
    const r = sendInterest(profile.id);
    if (r.ok) toast.success(`Interest sent to ${profile.name}.`);
    else toast.error(r.error);
  };

  const onShortlist = () => {
    if (!account) return requireLogin("Please log in to shortlist profiles.");
    const r = toggleShortlist(profile.id);
    if (r.ok) toast.success(r.added ? "Added to shortlist." : "Removed from shortlist.");
    else toast.error(r.error);
  };

  const onShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Biodata link copied to clipboard! Ready to share with family.");
    }
  };

  const onRespond = (status: "accepted" | "declined" | "withdrawn") => {
    if (!interest) return;
    const r = setInterestStatus(interest.id, status);
    if (r.ok)
      toast.success(
        status === "accepted"
          ? "Interest accepted — you can now message each other."
          : status === "declined"
            ? "Interest declined."
            : "Interest withdrawn.",
      );
    else toast.error(r.error);
  };

  const onReport = () => {
    const r = reportProfile(profile.id, reason, details.trim());
    if (r.ok) {
      toast.success("Thank you. Our team will review this profile.");
      setReportOpen(false);
      setDetails("");
    } else toast.error(r.error);
  };

  const sentByMe = interest && me && interest.fromProfileId === me.id;
  const active = interest && (interest.status === "pending" || interest.status === "accepted");

  const gallery =
    profile.photos && profile.photos.length > 0 ? profile.photos : getProfileGallery(profile.id);
  const currentPhoto = activePhoto || profile.photoUrl || gallery[0] || getProfilePhoto(profile);

  return (
    <div className="pb-16 bg-background">
      {/* Top Breadcrumb & Hero Showcase */}
      <div className="border-b border-border/80 bg-gradient-to-b from-card via-secondary/20 to-card pt-6 pb-10">
        <div className="container-page">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground font-medium"
          >
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/profiles" className="hover:text-primary transition-colors">
              Browse Profiles
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">{profile.name}</span>
          </nav>

          {/* Elevated Biodata Hero Card */}
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Photo Showcase & Thumbnail Strip */}
                    <div className="flex flex-col items-center sm:items-start gap-3.5 shrink-0 w-full sm:w-auto">
                      <div className="relative h-80 w-64 sm:h-96 sm:w-72 overflow-hidden rounded-3xl border-2 border-gold/40 shadow-xl bg-stone-900 group mx-auto sm:mx-0">
                        <img
                          src={currentPhoto}
                          alt={profile.name}
                          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getProfilePhoto({
                              id: profile.id,
                              gender: profile.gender,
                            });
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

                        {/* Trust Hologram Stamp */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-stone-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>ID Verified</span>
                        </div>

                        {/* Photo Counter */}
                        <span className="absolute bottom-3 left-3 rounded-full bg-stone-950/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/95 border border-white/15">
                          📷 {gallery.length} Verified Photos
                        </span>
                      </div>

                      {/* Thumbnail Strip */}
                      {gallery.length > 1 && (
                        <div className="flex gap-2.5 justify-center sm:justify-start w-full">
                          {gallery.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActivePhoto(img)}
                              className={cn(
                                "h-16 w-16 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer shadow-xs",
                                currentPhoto === img
                                  ? "border-primary ring-2 ring-gold/60 scale-105"
                                  : "border-border/70 opacity-70 hover:opacity-100",
                              )}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Main Candidate Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight flex items-center gap-2">
                          <span>{profile.name}</span>
                          {profile.verified && (
                            <BadgeCheck
                              className="h-7 w-7 text-emerald-600 shrink-0"
                              aria-label="Verified Candidate"
                            />
                          )}
                        </h1>
                      </div>

                      {/* Primary Tagline */}
                      <p className="mt-2 text-base sm:text-lg text-foreground/80 font-medium">
                        {ageFromDob(profile.dob)} Yrs · {formatHeight(profile.heightCm)} ·{" "}
                        {profile.city || "Pune, MH"}
                      </p>

                      {/* Status Badges Row */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-2">
                        <VerifiedBadge verified={profile.verified} />
                        {owner && <MembershipBadge tier={owner.membership} />}
                        {(isMine || isAdmin) && <ProfileStatusBadge status={profile.status} />}
                        {interest && <InterestStatusBadge status={interest.status} />}
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground border border-border/70">
                          <User className="h-3 w-3 text-gold" /> Managed by {profile.createdBy}
                        </span>
                      </div>

                      {/* Matrimonial Quick-Highlights Pill Matrix */}
                      <div className="mt-6 flex flex-wrap gap-2 text-xs sm:text-sm">
                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/80 px-3 py-1.5 font-medium border border-border/70 text-foreground">
                          <Briefcase className="h-4 w-4 text-gold shrink-0" />
                          <span>
                            {profile.occupation || "Professional"}
                            {profile.company ? ` at ${profile.company}` : ""}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/80 px-3 py-1.5 font-medium border border-border/70 text-foreground">
                          <GraduationCap className="h-4 w-4 text-gold shrink-0" />
                          <span>
                            {profile.qualification || "Graduate"}
                            {profile.college ? ` (${profile.college})` : ""}
                          </span>
                        </div>

                        {profile.income && (
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-gold/10 px-3 py-1.5 font-bold border border-gold/30 text-gold-foreground">
                            <span>₹</span>
                            <span>Earns {profile.income}</span>
                          </div>
                        )}

                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/80 px-3 py-1.5 font-medium border border-border/70 text-foreground">
                          <Compass className="h-4 w-4 text-gold shrink-0" />
                          <span>
                            {profile.religion}
                            {profile.community ? ` · ${profile.community}` : ""}
                          </span>
                        </div>

                        {profile.motherTongue && (
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/80 px-3 py-1.5 font-medium border border-border/70 text-foreground">
                            <span>🗣️</span>
                            <span>{profile.motherTongue}</span>
                          </div>
                        )}

                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/80 px-3 py-1.5 font-medium border border-border/70 text-foreground">
                          <span>💍</span>
                          <span>{profile.maritalStatus}</span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/80 px-3 py-1.5 font-medium border border-border/70 text-foreground">
                          <span>🌱</span>
                          <span>{profile.diet}</span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/80 px-3 py-1.5 font-medium border border-border/70 text-foreground">
                          <MapPin className="h-4 w-4 text-gold shrink-0" />
                          <span>Lives in {profile.city || "India"}</span>
                        </div>
                      </div>

                      {/* High-Impact Action Toolbar */}
                      <div className="mt-8 pt-6 border-t border-border/70 flex flex-wrap items-center gap-3">
                        {isMine ? (
                          <Button
                            asChild
                            size="xl"
                            className="rounded-2xl shadow-md font-semibold cursor-pointer"
                          >
                            <Link to="/my-profile">
                              <Pencil className="h-4 w-4 mr-2" /> Edit My Profile
                            </Link>
                          </Button>
                        ) : (
                          <>
                            {!active && (
                              <Button
                                onClick={onInterest}
                                size="xl"
                                className="rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 font-bold cursor-pointer gap-2 px-8"
                              >
                                <Send className="h-4 w-4" /> Connect with {profile.name.split(" ")[0]}
                              </Button>
                            )}

                            {interest?.status === "pending" && sentByMe && (
                              <Button
                                variant="outline"
                                size="xl"
                                className="rounded-2xl border-primary/40 text-primary font-semibold cursor-pointer"
                                onClick={() => onRespond("withdrawn")}
                              >
                                <Undo2 className="h-4 w-4 mr-1.5" /> Withdraw Interest
                              </Button>
                            )}

                            {interest?.status === "pending" && !sentByMe && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="xl"
                                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                                  onClick={() => onRespond("accepted")}
                                >
                                  <Check className="h-4 w-4 mr-1.5" /> Accept Interest
                                </Button>
                                <Button
                                  variant="outline"
                                  size="xl"
                                  className="rounded-2xl cursor-pointer font-semibold"
                                  onClick={() => onRespond("declined")}
                                >
                                  Decline
                                </Button>
                              </div>
                            )}

                            {interest?.status === "accepted" && (
                              <Button
                                asChild
                                size="xl"
                                className="rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 font-bold cursor-pointer"
                              >
                                <Link to="/messages" search={{ with: profile.id }}>
                                  <MessageCircle className="h-4 w-4 mr-2" /> Send Message
                                </Link>
                              </Button>
                            )}

                            <Button
                              variant={shortlisted ? "soft" : "outline"}
                              size="xl"
                              className="rounded-2xl border-gold/40 hover:bg-gold/10 font-semibold cursor-pointer"
                              onClick={onShortlist}
                            >
                              {shortlisted ? (
                                <>
                                  <HeartOff className="h-4 w-4 mr-1.5 text-rose-500" /> Shortlisted ❤️
                                </>
                              ) : (
                                <>
                                  <Heart className="h-4 w-4 mr-1.5 text-gold" /> Add to Shortlist
                                </>
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              size="xl"
                              className="rounded-2xl border-border/80 hover:bg-secondary font-semibold cursor-pointer gap-1.5"
                              onClick={onShare}
                            >
                              <Share2 className="h-4 w-4 text-gold" /> Share Biodata
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-destructive cursor-pointer ml-auto"
                              onClick={() =>
                                account
                                  ? setReportOpen(true)
                                  : requireLogin("Please log in to report a profile.")
                              }
                            >
                              <Flag className="h-3.5 w-3.5 mr-1" /> Report profile
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Main Biodata Content Grid */}
          <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
            {/* Left Column: Rich Matrimonial Details */}
            <div className="space-y-8">
              {profile.status === "rejected" && profile.rejectionReason && (isMine || isAdmin) && (
                <div className="rounded-2xl bg-destructive-soft p-5 text-sm text-destructive border border-destructive/20 font-medium">
                  Profile Review Status: Rejected — {profile.rejectionReason}
                </div>
              )}

              {/* 1. About Me (Personal Introduction) */}
              <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-foreground">
                      Personal Voice
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      About {profile.name.split(" ")[0]}
                    </h2>
                  </div>
                </div>

                <div className="rounded-2xl bg-secondary/35 border-l-4 border-gold p-5 text-base sm:text-lg leading-relaxed text-foreground/90 font-normal">
                  “{profile.about || "This member hasn't written an introduction yet."}”
                </div>

                {/* Hobbies & Passions Tag Cloud */}
                {profile.hobbies && profile.hobbies.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-border/60">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                      Interests & Passions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.hobbies.map((h, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3.5 py-1 text-xs font-semibold text-foreground/90 border border-border/70"
                        >
                          <Sparkles className="h-3 w-3 text-gold" />
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* 2. Personal & Horoscope Details (Vedic Kundali) */}
              <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/15 border border-gold/30 text-gold">
                    <Compass className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-foreground">
                      Cultural Roots & Vedic Harmony
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      Personal & Horoscope Details
                    </h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-2">
                      Astrological & Vedic Info
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Religion:</span>
                        <span className="font-semibold text-foreground">{profile.religion}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Community / Caste:</span>
                        <span className="font-semibold text-foreground">
                          {profile.community || "Open to all"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Mother Tongue:</span>
                        <span className="font-semibold text-foreground">
                          {profile.motherTongue || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Manglik Status:</span>
                        <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs">
                          Non-Manglik / Nirdosh
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Horoscope Match:</span>
                        <span className="font-semibold text-foreground">Available on Request</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-2">
                      Personal Attributes
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Age:</span>
                        <span className="font-semibold text-foreground">
                          {ageFromDob(profile.dob)} years
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Height:</span>
                        <span className="font-semibold text-foreground">
                          {formatHeight(profile.heightCm)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Marital Status:</span>
                        <span className="font-semibold text-foreground">{profile.maritalStatus}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Current City:</span>
                        <span className="font-semibold text-foreground">
                          {profile.city || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Residential Status:</span>
                        <span className="font-semibold text-foreground">Citizen / Resident</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Education & Career Journey */}
              <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      Professional Credentials
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      Education & Career
                    </h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Career Box */}
                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-5 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                      <Briefcase className="h-4 w-4 text-gold" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Career & Profession
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground block">Designation / Role:</span>
                        <span className="font-semibold text-foreground text-base">
                          {profile.occupation || "Working Professional"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Organization / Company:
                        </span>
                        <span className="font-semibold text-foreground">
                          {profile.company || "Reputed Company"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Annual Income:</span>
                        <span className="font-bold text-primary text-base">
                          {profile.income || "Confidential / Disclosed to mutual matches"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Education Box */}
                  <div className="rounded-2xl border border-border/70 bg-secondary/25 p-5 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                      <GraduationCap className="h-4 w-4 text-gold" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Educational Qualifications
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Highest Qualification:
                        </span>
                        <span className="font-semibold text-foreground text-base">
                          {profile.qualification || "Graduate"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          College / University:
                        </span>
                        <span className="font-semibold text-foreground">
                          {profile.college || "Recognized Institute"}
                        </span>
                      </div>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          <Check className="h-3 w-3" /> Degree Authenticated
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. Family Heritage & Background (Khandaan) */}
              <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Respectable Heritage
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      Family Background & Values
                    </h2>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-5">
                  <div className="grid gap-y-4 gap-x-8 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Family Structure:</span>
                      <span className="font-semibold text-foreground">{profile.familyType} Family</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Family Ethos:</span>
                      <span className="font-semibold text-foreground">
                        {profile.familyValues} Values
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Father's Profession:</span>
                      <span className="font-semibold text-foreground">
                        {profile.fatherOccupation || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Mother's Profession:</span>
                      <span className="font-semibold text-foreground">
                        {profile.motherOccupation || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Siblings:</span>
                      <span className="font-semibold text-foreground">
                        {profile.siblings || "None"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Native Place:</span>
                      <span className="font-semibold text-foreground">{profile.city || "India"}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                    <Home className="h-4 w-4 text-gold shrink-0" />
                    <span>
                      Cultured family with strong ethics, mutual respect, and warm hospitality.
                    </span>
                  </div>
                </div>
              </section>

              {/* 5. Lifestyle & Daily Habits */}
              <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600">
                    <Heart className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                      Habits & Wellness
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      Lifestyle & Choices
                    </h2>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 text-sm">
                  <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                    <span className="text-xs text-muted-foreground block mb-1">Dietary Habit:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                      🌱 {profile.diet}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                    <span className="text-xs text-muted-foreground block mb-1">Smoking:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      🚭 {profile.smoking}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                    <span className="text-xs text-muted-foreground block mb-1">Drinking:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      🍷 {profile.drinking}
                    </span>
                  </div>
                </div>
              </section>

              {/* 6. Partner Preferences (Mutual Compatibility Expectations) */}
              <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      Mutual Alignment
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      Partner Expectations
                    </h2>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-5">
                  <div className="grid gap-y-4 gap-x-8 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Preferred Age:</span>
                      <span className="font-semibold text-foreground">
                        {profile.prefs.ageMin} – {profile.prefs.ageMax} years
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Preferred Height:</span>
                      <span className="font-semibold text-foreground">
                        {shortHeight(profile.prefs.heightMin)} – {shortHeight(profile.prefs.heightMax)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Religion & Community:</span>
                      <span className="font-semibold text-foreground">
                        {profile.prefs.religions.join(", ") || "Open to all religions"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Preferred Locations:</span>
                      <span className="font-semibold text-foreground">
                        {profile.prefs.locations.join(", ") || "Anywhere in India & Abroad"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Education Expectation:
                      </span>
                      <span className="font-semibold text-foreground">
                        {profile.prefs.education || "Graduate / Post Graduate"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Profession & Career:</span>
                      <span className="font-semibold text-foreground">
                        {profile.prefs.occupation || "Working Professional"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Marital Status:</span>
                      <span className="font-semibold text-foreground">
                        {profile.prefs.maritalStatus.join(", ") || "Never Married"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
              <Section
                title="Personal information"
                rows={[
                  ["Age", `${ageFromDob(profile.dob)} years`],
                  ["Height", formatHeight(profile.heightCm)],
                  ["Weight", profile.weightKg ? `${profile.weightKg} kg` : undefined],
                  ["Marital status", profile.maritalStatus],
                  ["Religion", profile.religion],
                  ["Community", profile.community],
                  ["Mother tongue", profile.motherTongue],
                  ["Lives in", profile.city],
                  ["Languages known", profile.languages?.length ? profile.languages.join(", ") : undefined],
                  ["Physical disability", profile.disability && profile.disability !== "None" ? profile.disability : "None"],
                ]}
              />
              <Section
                title="Religious & horoscope details"
                rows={[
                  ["Religion", profile.religion],
                  ["Community / Caste", profile.community],
                  ["Sub-caste", profile.subCaste],
                  ["Gotra", profile.gotra],
                  ["Manglik status", profile.manglik],
                  ["Rashi (Moon sign)", profile.rashi],
                  ["Nakshatra", profile.nakshatra],
                  ["Time of birth", profile.birthTime],
                  ["Place of birth", profile.birthPlace],
                ]}
              />
              <Section
                title="Location & relocation"
                rows={[
                  ["Current city", profile.city],
                  ["State", profile.state],
                  ["Country", profile.country || "India"],
                  ["Native place / Hometown", profile.nativePlace],
                  ["Willingness to relocate", profile.willingToRelocate],
                ]}
              />
              <Section
                title="Education & career"
                rows={[
                  ["Education level", profile.educationLevel],
                  ["Highest qualification", profile.qualification],
                  ["Field of study", profile.educationField],
                  ["College / University", profile.college],
                  ["Employment type", profile.employmentType],
                  ["Occupation", profile.occupation],
                  ["Designation / Role", profile.designation],
                  ["Company / Organisation", profile.company],
                  ["Annual income", profile.income],
                ]}
              />
              <Section
                title="Family details"
                rows={[
                  ["Family type", profile.familyType],
                  ["Family values", profile.familyValues],
                  ["Family status", profile.familyStatus],
                  ["Father's occupation", profile.fatherOccupation],
                  ["Mother's occupation", profile.motherOccupation],
                  ["Brothers", profile.brothersCount !== undefined ? String(profile.brothersCount) : undefined],
                  ["Sisters", profile.sistersCount !== undefined ? String(profile.sistersCount) : undefined],
                  ["Siblings overview", profile.siblings],
                  ["About family", profile.aboutFamily],
                ]}
              />
              <Section
                title="Lifestyle & marriage expectations"
                rows={[
                  ["Diet", profile.diet],
                  ["Smoking", profile.smoking],
                  ["Drinking", profile.drinking],
                  ["Hobbies", profile.hobbies?.join(", ")],
                  ["Marriage timeline", profile.marriageTimeline],
                  ["Living arrangement", profile.livingArrangement],
                  ["Preference on children", profile.childrenPreference],
                ]}
              />
              <Section
                title="Partner preferences"
                rows={[
                  ["Age", `${profile.prefs.ageMin} – ${profile.prefs.ageMax} years`],
                  [
                    "Height",
                    `${shortHeight(profile.prefs.heightMin)} – ${shortHeight(profile.prefs.heightMax)}`,
                  ],
                  ["Religion", profile.prefs.religions.join(", ") || "Open to all"],
                  ["Location", profile.prefs.locations.join(", ") || "Anywhere"],
                  ["Education", profile.prefs.education || "Any"],
                  ["Occupation", profile.prefs.occupation || "Any"],
                  ["Marital status", profile.prefs.maritalStatus.join(", ") || "Any"],
                ]}
              />
            </div>

            {/* Right Sidebar: Compatibility, Verification & Privacy */}
            <aside className="space-y-6">
              {/* Compatibility Meter Card */}
              {compat && (
                <section className="rounded-3xl border border-gold/40 bg-card p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-foreground">
                      Match Intelligence
                    </span>
                    <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-gold-foreground border border-gold/30">
                      {compat.score}% Score
                    </span>
                  </div>

                  <div className="mt-4 text-center">
                    <span className="text-5xl font-bold text-primary">{compat.score}%</span>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">
                      Overall Compatibility
                    </p>
                    <Progress value={compat.score} className="mt-3.5 h-2.5 bg-muted" />
                  </div>

                  <div className="mt-6 space-y-2 border-t border-border/70 pt-4 text-xs font-medium">
                    {compat.matched.map((m) => (
                      <div
                        key={m}
                        className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>Matches: {m}</span>
                      </div>
                    ))}
                    {compat.unmatched.map((m) => (
                      <div key={m} className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-4 w-4 shrink-0 text-center font-bold">·</span>
                        <span>Preference: {m}</span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 flex gap-2 rounded-xl bg-secondary/60 p-3 text-[11px] text-muted-foreground">
                    <Info className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                    Real-time 2-way compatibility based on your partner preferences, background, and Vedic Kundali Milan.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMatchDialogOpen(true)}
                    className="mt-3 w-full border-gold/40 text-xs text-foreground hover:bg-gold/10"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-gold" /> View 36 Gunas & Detailed Match
                  </Button>
                </section>
              )}

              {/* Verification Trust Shield */}
              <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-foreground">Verified Trust Shield</h2>
                </div>

                <ul className="space-y-2.5 text-xs font-medium">
                  <li className="flex justify-between items-center p-2 rounded-xl bg-secondary/40">
                    <span className="text-muted-foreground">Government ID</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Verified
                    </span>
                  </li>
                  <li className="flex justify-between items-center p-2 rounded-xl bg-secondary/40">
                    <span className="text-muted-foreground">Mobile OTP</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Authenticated
                    </span>
                  </li>
                  <li className="flex justify-between items-center p-2 rounded-xl bg-secondary/40">
                    <span className="text-muted-foreground">Human Screening</span>
                    <span
                      className={cn(
                        "font-bold flex items-center gap-1",
                        profile.verified ? "text-emerald-600" : "text-amber-600",
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {profile.verified ? "Passed" : "In Review"}
                    </span>
                  </li>
                  <li className="flex justify-between items-center p-2 rounded-xl bg-secondary/40">
                    <span className="text-muted-foreground">Biodata Completeness</span>
                    <span className="font-bold text-primary">{completion}%</span>
                  </li>
                </ul>
              </section>

              {/* Contact Details & Privacy Notice */}
              <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Lock className="h-4 w-4 text-gold" />
                  <h2 className="text-base font-bold text-foreground">Parda & Contact Privacy</h2>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Phone numbers, email addresses, and private contact channels are never shown publicly.
                  Express interest to connect; once mutually accepted by both families, contact details
                  unlock automatically.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold-foreground border border-gold/25">
                    <Lock className="h-3 w-3 text-gold" /> 100% Confidential
                  </span>
                </div>
              </section>

              {/* Family Share Card */}
              <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" /> Family Co-Pilot
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Discuss this candidate with parents and family members. Share the link directly on
                  WhatsApp or copy to shortlist.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl border-primary/30 hover:bg-primary/5 text-primary font-semibold cursor-pointer"
                  onClick={onShare}
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" /> Copy Biodata Link
                </Button>
              </section>
            </aside>
          </div>

          {/* Report Profile Modal */}
          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Report {profile.name}</DialogTitle>
                <DialogDescription>
                  Reports are 100% confidential. Our safety and moderation team reviews every report
                  within 24 hours.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FormField id="rep-reason" label="Reason for report">
                  <NativeSelect
                    id="rep-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    options={REPORT_REASONS}
                  />
                </FormField>
                <FormField id="rep-details" label="Additional Details (optional)">
                  <Textarea
                    id="rep-details"
                    rows={4}
                    maxLength={500}
                    placeholder="Please share any context to help our family care team evaluate this report."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </FormField>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={() => setReportOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="rounded-xl" onClick={onReport}>
                  Submit Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {compat && me && (
            <MatchCompatibilityDialog
              open={matchDialogOpen}
              onOpenChange={setMatchDialogOpen}
              me={me}
              other={profile}
              compat={compat}
              onSendInterest={onInterest}
              interestSent={sentByMe}
            />
          )}
        </div>
        );
}
