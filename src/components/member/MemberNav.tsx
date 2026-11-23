"use client";

import { Link } from "@/lib/navigation";
import {
  Bell,
  Heart,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useSession } from "@/hooks/use-demo";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-profile", label: "My Profile", icon: User },
  { to: "/matches", label: "Matches", icon: Sparkles },
  { to: "/interests/received", label: "Received", icon: Inbox },
  { to: "/interests/sent", label: "Sent", icon: Send },
  { to: "/shortlist", label: "Shortlist", icon: Heart },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/notifications", label: "Notifications", icon: Bell },
] as const;

export function MemberNav() {
  const { state, account, profile } = useSession();
  const pendingReceived = profile
    ? state.interests.filter((i) => i.toProfileId === profile.id && i.status === "pending").length
    : 0;
  const unread = account
    ? state.notifications.filter((n) => n.accountId === account.id && !n.read).length
    : 0;
  const counts: Record<string, number> = {
    "/interests/received": pendingReceived,
    "/notifications": unread,
  };

  return (
    <nav
      aria-label="Member"
      className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0"
    >
      <ul className="flex gap-1 lg:flex-col">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{
                className: "bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary",
              }}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {(counts[to] ?? 0) > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                  {counts[to]}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
