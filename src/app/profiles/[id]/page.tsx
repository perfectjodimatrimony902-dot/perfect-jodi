"use client";

import { Link, useNavigate, Route } from "@/lib/navigation";
import { useHydrated } from "@/lib/navigation";
import {
  BadgeCheck,
  ChevronRight,
  Flag,
  Heart,
  HeartOff,
  Info,
  Lock,
  MessageCircle,
  Pencil,
  Send,
  Sparkles,
  UserX,
  Undo2,
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



function Section({ title, rows }: { title: string; rows: [string, string | undefined][] }) {
  return (
    <section className="surface p-6">
      <h2 className="text-2xl text-primary">{title}</h2>
      <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between gap-3 border-b border-dashed pb-2 text-sm sm:block sm:border-0 sm:pb-0"
          >
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium sm:mt-0.5">{v || "Not specified"}</dd>
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

  if (!hydrated) return <PageLoader label="Loading profile…" />;

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

  return (
    <div className="pb-6">
      <div className="border-b bg-secondary/60">
        <div className="container-page py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-1 text-xs text-muted-foreground"
          >
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/profiles" className="hover:text-primary">
              Browse Profiles
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{profile.name}</span>
          </nav>
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <ProfileAvatar name={profile.name} tone={profile.tone} size="xl" photoUrl={profile.photoUrl} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-4xl text-primary md:text-5xl">{profile.name}</h1>
                {profile.verified && (
                  <BadgeCheck className="h-6 w-6 text-success" aria-label="Verified" />
                )}
              </div>
              <p className="mt-1 text-foreground/80">
                {ageFromDob(profile.dob)} yrs · {shortHeight(profile.heightCm)} ·{" "}
                {profile.city || "—"} · {profile.religion}
                {profile.community ? `, ${profile.community}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <VerifiedBadge verified={profile.verified} />
                {owner && <MembershipBadge tier={owner.membership} />}
                {(isMine || isAdmin) && <ProfileStatusBadge status={profile.status} />}
                {interest && <InterestStatusBadge status={interest.status} />}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Profile created by {profile.createdBy} · Member since{" "}
                {formatDate(profile.createdAt)}
              </p>
            </div>
            <div className="flex flex-col gap-2 md:w-60">
              {isMine ? (
                <Button asChild>
                  <Link to="/my-profile">
                    <Pencil className="h-4 w-4" /> Edit my profile
                  </Link>
                </Button>
              ) : (
                <>
                  {!active && (
                    <Button onClick={onInterest}>
                      <Send className="h-4 w-4" /> Send interest
                    </Button>
                  )}
                  {interest?.status === "pending" && sentByMe && (
                    <Button variant="outline" onClick={() => onRespond("withdrawn")}>
                      <Undo2 className="h-4 w-4" /> Withdraw interest
                    </Button>
                  )}
                  {interest?.status === "pending" && !sentByMe && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => onRespond("accepted")}>Accept</Button>
                      <Button variant="outline" onClick={() => onRespond("declined")}>
                        Decline
                      </Button>
                    </div>
                  )}
                  {interest?.status === "accepted" && (
                    <Button asChild>
                      <Link to="/messages" search={{ with: profile.id }}>
                        <MessageCircle className="h-4 w-4" /> Message
                      </Link>
                    </Button>
                  )}
                  <Button variant={shortlisted ? "soft" : "outline"} onClick={onShortlist}>
                    {shortlisted ? (
                      <>
                        <HeartOff className="h-4 w-4" /> Remove shortlist
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4" /> Shortlist
                      </>
                    )}
                  </Button>
                  {compat && (
                    <Button
                      variant="outline"
                      onClick={() => setMatchDialogOpen(true)}
                      className="border-gold/50 text-foreground hover:bg-gold/10"
                    >
                      <Sparkles className="h-4 w-4 mr-1.5 text-gold" /> Match Kundali & Compare
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() =>
                      account
                        ? setReportOpen(true)
                        : requireLogin("Please log in to report a profile.")
                    }
                  >
                    <Flag className="h-3.5 w-3.5" /> Report profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {profile.status === "rejected" && profile.rejectionReason && (isMine || isAdmin) && (
            <p className="rounded-lg bg-destructive-soft p-4 text-sm text-destructive">
              Rejected: {profile.rejectionReason}
            </p>
          )}
          <section className="surface p-6">
            <h2 className="text-2xl text-primary">About {profile.name.split(" ")[0]}</h2>
            <p className="mt-3 leading-relaxed text-foreground/85">
              {profile.about || "This member hasn't written an introduction yet."}
            </p>
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
        <aside className="space-y-6">
          {compat && (
            <section className="surface p-6">
              <h2 className="text-xl">Compatibility estimate</h2>
              <p className="mt-2 font-display text-5xl font-semibold text-primary">
                {compat.score}%
              </p>
              <Progress value={compat.score} className="mt-3 h-2 bg-muted" />
              <ul className="mt-4 space-y-1 text-sm">
                {compat.matched.map((m) => (
                  <li key={m} className="text-success">
                    ✓ {m}
                  </li>
                ))}
                {compat.unmatched.map((m) => (
                  <li key={m} className="text-muted-foreground">
                    ✗ {m}
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                <Info className="h-4 w-4 shrink-0" /> Real-time 2-way compatibility based on your partner preferences, background, and Vedic Kundali Milan.
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
          <section className="surface p-6">
            <h2 className="text-xl">Verification</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Mobile number</span>
                <span className="font-medium text-success">Verified</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Profile review</span>
                <span
                  className={
                    profile.verified ? "font-medium text-success" : "font-medium text-warning"
                  }
                >
                  {profile.verified ? "Verified by team" : "Not yet verified"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Completeness</span>
                <span className="font-medium">{completion}%</span>
              </li>
            </ul>
          </section>
          <section className="surface p-6">
            <h2 className="flex items-center gap-2 text-xl">
              <Lock className="h-4 w-4 text-gold" /> Contact details
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Phone numbers and email addresses are never shown on public profiles. Connect by
              sending an interest; once accepted, you can message each other.
            </p>
          </section>
        </aside>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Report {profile.name}</DialogTitle>
            <DialogDescription>
              Reports are confidential. Our moderation team reviews every report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FormField id="rep-reason" label="Reason">
              <NativeSelect
                id="rep-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={REPORT_REASONS}
              />
            </FormField>
            <FormField id="rep-details" label="Details (optional)">
              <Textarea
                id="rep-details"
                rows={4}
                maxLength={500}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onReport}>
              Submit report
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
