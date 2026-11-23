"use client";

import { Link } from "@/lib/navigation";
import {
  BadgeCheck,
  Crown,
  Flag,
  Inbox,
  ShieldAlert,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminTitle } from "@/components/admin/AdminTitle";
import { MembershipBadge, ProfileStatusBadge } from "@/components/common/StatusBadge";
import { formatDate, useSession } from "@/hooks/use-demo";



function AdminOverview() {
  const { state } = useSession();
  const members = state.accounts.filter((a) => a.role === "member");
  const stats = [
    { label: "Total users", value: members.length, icon: Users, to: "/admin" as const },
    {
      label: "Bride profiles",
      value: state.profiles.filter((p) => p.gender === "female").length,
      icon: UserRound,
      to: "/admin" as const,
    },
    {
      label: "Groom profiles",
      value: state.profiles.filter((p) => p.gender === "male").length,
      icon: UsersRound,
      to: "/admin" as const,
    },
    {
      label: "Pending approvals",
      value: state.profiles.filter((p) => p.status === "pending").length,
      icon: ShieldAlert,
      to: "/admin" as const,
      alert: true,
    },
    {
      label: "Verified profiles",
      value: state.profiles.filter((p) => p.verified).length,
      icon: BadgeCheck,
      to: "/admin" as const,
    },
    {
      label: "Premium memberships",
      value: members.filter((a) => a.membership !== "free").length,
      icon: Crown,
      to: "/admin" as const,
    },
    {
      label: "Open reports",
      value: state.reports.filter((r) => r.status === "open").length,
      icon: Flag,
      to: "/admin" as const,
      alert: true,
    },
    {
      label: "New enquiries",
      value: state.enquiries.filter((e) => e.status === "new").length,
      icon: Inbox,
      to: "/admin" as const,
    },
  ];
  const recent = [...members].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const pending = state.profiles.filter((p) => p.status === "pending").slice(0, 5);
  const tiers = (["free", "gold", "premium"] as const).map((t) => ({
    t,
    n: members.filter((a) => a.membership === t).length,
  }));

  return (
    <div className="space-y-8">
      <AdminTitle title="Overview" text="Live figures from the demo data stored in this browser." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, to, alert }) => (
          <Link key={label} to={to} className="surface p-5 transition-shadow hover:shadow-lift">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon
                className={alert && value > 0 ? "h-4 w-4 text-destructive" : "h-4 w-4 text-gold"}
              />
            </div>
            <p className="mt-2 font-display text-4xl font-semibold text-primary">{value}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="surface overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-xl">Recent registrations</h2>
            <Link to="/admin" className="text-sm font-medium text-primary hover:underline">
              All users
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Created by</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Profile</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((a) => {
                  const p = state.profiles.find((x) => x.id === a.profileId);
                  return (
                    <tr key={a.id}>
                      <td className="p-3 font-medium">{a.name}</td>
                      <td className="p-3">{a.createdBy}</td>
                      <td className="p-3">
                        <MembershipBadge tier={a.membership} />
                      </td>
                      <td className="p-3">{p ? <ProfileStatusBadge status={p.status} /> : "—"}</td>
                      <td className="p-3 text-muted-foreground">{formatDate(a.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <div className="space-y-6">
          <section className="surface p-5">
            <h2 className="text-xl">Membership mix</h2>
            <ul className="mt-4 space-y-3">
              {tiers.map(({ t, n }) => (
                <li key={t}>
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{t}</span>
                    <span className="font-semibold">{n}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={
                        t === "free"
                          ? "h-full bg-muted-foreground/40"
                          : t === "gold"
                            ? "h-full bg-gold"
                            : "h-full bg-primary"
                      }
                      style={{ width: `${members.length ? (n / members.length) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Awaiting approval</h2>
              <Button asChild size="sm" variant="soft">
                <Link to="/admin">Review</Link>
              </Button>
            </div>
            {pending.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Nothing pending. 🎉</p>
            ) : (
              <ul className="mt-3 divide-y text-sm">
                {pending.map((p) => (
                  <li key={p.id} className="flex justify-between py-2">
                    <span>{p.name}</span>
                    <span className="text-muted-foreground">{formatDate(p.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
