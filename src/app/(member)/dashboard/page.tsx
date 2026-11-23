"use client";

import { Link } from "@/lib/navigation";
import { ArrowRight, Bell, Eye, Heart, Inbox, Send, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/common/EmptyState";
import {
  InterestStatusBadge,
  MembershipBadge,
  ProfileStatusBadge,
} from "@/components/common/StatusBadge";
import { MiniProfileRow } from "@/components/member/MiniProfileRow";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { formatDate, formatDateTime, useSession } from "@/hooks/use-demo";
import { profileCompletion, recommendedMatches } from "@/lib/matching";



function Panel({
  title,
  link,
  children,
}: {
  title: string;
  link?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="surface overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-xl">{title}</h2>
        {link}
      </div>
      {children}
    </section>
  );
}

function Dashboard() {
  const { state, account, profile } = useSession();
  const byId = useMemo(() => new Map(state.profiles.map((p) => [p.id, p])), [state.profiles]);

  const data = useMemo(() => {
    if (!profile || !account) return null;
    const received = state.interests.filter((i) => i.toProfileId === profile.id);
    const sent = state.interests.filter((i) => i.fromProfileId === profile.id);
    const shortlist = state.shortlists[account.id] ?? [];
    const views = state.views.filter((v) => v.profileId === profile.id);
    const notifications = state.notifications.filter((n) => n.accountId === account.id);
    const recs = recommendedMatches(profile, state.profiles);
    const newMatches = state.profiles
      .filter((p) => p.status === "approved" && p.gender !== profile.gender)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4);
    const recent = (state.recentlyViewed[account.id] ?? [])
      .map((id) => byId.get(id))
      .filter((p) => p && p.status === "approved")
      .slice(0, 6);
    return { received, sent, shortlist, views, notifications, recs, newMatches, recent };
  }, [state, account, profile, byId]);

  if (!profile || !account || !data) return null;
  const completion = profileCompletion(profile);
  const pendingReceived = data.received.filter((i) => i.status === "pending");

  const stats = [
    {
      label: "Interests received",
      value: data.received.length,
      sub: `${pendingReceived.length} awaiting reply`,
      icon: Inbox,
      to: "/interests/received" as const,
    },
    {
      label: "Interests sent",
      value: data.sent.length,
      sub: `${data.sent.filter((i) => i.status === "accepted").length} accepted`,
      icon: Send,
      to: "/interests/sent" as const,
    },
    {
      label: "Shortlisted",
      value: data.shortlist.length,
      sub: "Saved profiles",
      icon: Heart,
      to: "/shortlist" as const,
    },
    { label: "Profile views", value: data.views.length, sub: "All time", icon: Eye, to: undefined },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section className="hero-panel flex flex-col gap-6 rounded-2xl p-6 md:flex-row md:items-center md:p-8">
        <ProfileAvatar
          name={profile.name}
          tone={profile.tone}
          size="lg"
          className="ring-offset-primary"
        />
        <div className="flex-1">
          <p className="text-sm text-primary-foreground/70">Namaste,</p>
          <h1 className="text-4xl">{account.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <MembershipBadge tier={account.membership} />
            <ProfileStatusBadge status={profile.status} />
          </div>
        </div>
        <div className="w-full rounded-xl bg-primary-foreground/10 p-4 md:w-64">
          <div className="flex justify-between text-sm">
            <span>Profile completion</span>
            <strong>{completion}%</strong>
          </div>
          <Progress
            value={completion}
            className="mt-2 h-2 bg-primary-foreground/20 [&>div]:bg-gold"
          />
          <Button asChild size="sm" variant="gold" className="mt-3 w-full">
            <Link to="/my-profile">{completion < 100 ? "Complete profile" : "Edit profile"}</Link>
          </Button>
        </div>
      </section>

      {profile.status === "pending" && (
        <p className="rounded-lg border border-warning/40 bg-warning-soft p-4 text-sm text-warning">
          Your profile is awaiting review. It will appear in search once approved by our team (try
          the demo admin to approve it).
        </p>
      )}
      {profile.status === "rejected" && (
        <p className="rounded-lg bg-destructive-soft p-4 text-sm text-destructive">
          Your profile needs changes: {profile.rejectionReason}.{" "}
          <Link to="/my-profile" className="font-semibold underline">
            Update and resubmit
          </Link>
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, to }) => {
          const body = (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className="h-4 w-4 text-gold" />
              </div>
              <p className="mt-2 font-display text-4xl font-semibold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </>
          );
          return to ? (
            <Link key={label} to={to} className="surface p-5 transition-shadow hover:shadow-lift">
              {body}
            </Link>
          ) : (
            <div key={label} className="surface p-5">
              {body}
            </div>
          );
        })}
      </div>

      {/* Recommended */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl">Recommended matches</h2>
            <p className="text-xs text-muted-foreground">
              *Match % is a demo estimate based on your partner preferences, not a scientific
              assessment.
            </p>
          </div>
          <Button asChild variant="link" className="px-0">
            <Link to="/matches">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {data.recs.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No recommendations yet"
            text="Add partner preferences to see matches."
            action={
              <Button asChild>
                <Link to="/my-profile">Set preferences</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.recs.slice(0, 3).map(({ profile: p, compat }) => (
              <ProfileCard key={p.id} profile={p} compat={compat.score} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Interests received"
          link={
            <Link
              to="/interests/received"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          }
        >
          {data.received.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No interests received yet.</p>
          ) : (
            <div className="divide-y">
              {data.received.slice(0, 3).map((i) => {
                const p = byId.get(i.fromProfileId);
                return p ? (
                  <MiniProfileRow
                    key={i.id}
                    profile={p}
                    meta={formatDate(i.createdAt)}
                    actions={<InterestStatusBadge status={i.status} />}
                  />
                ) : null;
              })}
            </div>
          )}
        </Panel>
        <Panel
          title="Interests sent"
          link={
            <Link to="/interests/sent" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          }
        >
          {data.sent.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">You haven't sent any interests yet.</p>
          ) : (
            <div className="divide-y">
              {data.sent.slice(0, 3).map((i) => {
                const p = byId.get(i.toProfileId);
                return p ? (
                  <MiniProfileRow
                    key={i.id}
                    profile={p}
                    meta={formatDate(i.createdAt)}
                    actions={<InterestStatusBadge status={i.status} />}
                  />
                ) : null;
              })}
            </div>
          )}
        </Panel>
        <Panel
          title="New matches"
          link={
            <Link to="/profiles" className="text-sm font-medium text-primary hover:underline">
              Browse
            </Link>
          }
        >
          <div className="divide-y">
            {data.newMatches.map((p) => (
              <MiniProfileRow key={p.id} profile={p} meta={`Joined ${formatDate(p.createdAt)}`} />
            ))}
          </div>
        </Panel>
        <Panel
          title="Shortlisted profiles"
          link={
            <Link to="/shortlist" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          }
        >
          {data.shortlist.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">
              Tap the heart on any profile to save it here.
            </p>
          ) : (
            <div className="divide-y">
              {data.shortlist.slice(0, 3).map((id) => {
                const p = byId.get(id);
                return p ? <MiniProfileRow key={id} profile={p} /> : null;
              })}
            </div>
          )}
        </Panel>
        <Panel title="Who viewed your profile">
          {data.views.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No profile views yet.</p>
          ) : (
            <div className="divide-y">
              {data.views.slice(0, 4).map((v, idx) => {
                const p = byId.get(v.viewerProfileId);
                return p ? (
                  <MiniProfileRow key={idx} profile={p} meta={`Viewed ${formatDateTime(v.at)}`} />
                ) : null;
              })}
            </div>
          )}
        </Panel>
        <Panel
          title="Notifications"
          link={
            <Link to="/notifications" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          }
        >
          {data.notifications.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">You're all caught up.</p>
          ) : (
            <ul className="divide-y">
              {data.notifications.slice(0, 4).map((n) => (
                <li key={n.id} className="flex gap-3 p-4 text-sm">
                  <Bell
                    className={
                      n.read
                        ? "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                        : "mt-0.5 h-4 w-4 shrink-0 text-primary"
                    }
                  />
                  <div>
                    <p className={n.read ? "text-foreground/75" : "font-medium"}>{n.text}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(n.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <section>
        <h2 className="mb-4 text-2xl">Recently viewed</h2>
        {data.recent.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nothing viewed yet"
            text="Profiles you open will appear here."
            action={
              <Button asChild variant="outline">
                <Link to="/profiles">Browse profiles</Link>
              </Button>
            }
          />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.recent.map(
              (p) =>
                p && (
                  <Link
                    key={p.id}
                    to="/profiles/$id"
                    params={{ id: p.id }}
                    className="surface flex w-40 shrink-0 flex-col items-center p-4 text-center transition-shadow hover:shadow-lift"
                  >
                    <ProfileAvatar name={p.name} tone={p.tone} size="md" />
                    <span className="mt-3 line-clamp-1 text-sm font-semibold">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.city}</span>
                  </Link>
                ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
