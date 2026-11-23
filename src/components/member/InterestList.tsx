"use client";

import { Link } from "@/lib/navigation";
import { Check, Inbox, MessageCircle, Send, Undo2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { InterestStatusBadge } from "@/components/common/StatusBadge";
import { MiniProfileRow } from "./MiniProfileRow";
import { formatDate, useSession } from "@/hooks/use-demo";
import { setInterestStatus } from "@/lib/actions";
import type { InterestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: { value: InterestStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "withdrawn", label: "Withdrawn" },
];

export function InterestList({ direction }: { direction: "received" | "sent" }) {
  const { state, profile } = useSession();
  const [tab, setTab] = useState<InterestStatus | "all">("all");
  const byId = useMemo(() => new Map(state.profiles.map((p) => [p.id, p])), [state.profiles]);
  const all = useMemo(
    () =>
      profile
        ? state.interests
            .filter((i) =>
              direction === "received"
                ? i.toProfileId === profile.id
                : i.fromProfileId === profile.id,
            )
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        : [],
    [state.interests, profile, direction],
  );
  const list = tab === "all" ? all : all.filter((i) => i.status === tab);
  const tabs = direction === "received" ? TABS.filter((t) => t.value !== "withdrawn") : TABS;

  const act = (id: string, status: InterestStatus, name: string) => {
    const r = setInterestStatus(id, status);
    if (!r.ok) return toast.error(r.error);
    const msg = {
      accepted: `You accepted ${name}'s interest.`,
      declined: `You declined ${name}'s interest.`,
      withdrawn: `Interest to ${name} withdrawn.`,
      pending: "",
    }[status];
    toast.success(msg);
  };

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto" role="tablist">
        {tabs.map((t) => {
          const count =
            t.value === "all" ? all.length : all.filter((i) => i.status === t.value).length;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "cursor-pointer whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:border-primary/40",
              )}
            >
              {t.label} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon={direction === "received" ? Inbox : Send}
          title={
            tab === "all"
              ? direction === "received"
                ? "No interests received yet"
                : "You haven't sent any interests"
              : `No ${tab} interests`
          }
          text={
            direction === "received"
              ? "A complete profile gets noticed more often."
              : "Browse profiles and send an interest to someone you like."
          }
          action={
            <Button asChild variant="outline">
              <Link to={direction === "received" ? "/my-profile" : "/profiles"}>
                {direction === "received" ? "Improve my profile" : "Browse profiles"}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="surface divide-y overflow-hidden">
          {list.map((i) => {
            const other = byId.get(direction === "received" ? i.fromProfileId : i.toProfileId);
            if (!other) return null;
            return (
              <MiniProfileRow
                key={i.id}
                profile={other}
                meta={
                  <span className="inline-flex items-center gap-2">
                    <InterestStatusBadge status={i.status} />{" "}
                    {direction === "received" ? "Received" : "Sent"} {formatDate(i.createdAt)}
                  </span>
                }
                actions={
                  <>
                    {direction === "received" && i.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => act(i.id, "accepted", other.name)}>
                          <Check className="h-4 w-4" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => act(i.id, "declined", other.name)}
                        >
                          <X className="h-4 w-4" /> Decline
                        </Button>
                      </>
                    )}
                    {direction === "sent" && i.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => act(i.id, "withdrawn", other.name)}
                      >
                        <Undo2 className="h-4 w-4" /> Withdraw
                      </Button>
                    )}
                    {i.status === "accepted" && (
                      <Button asChild size="sm" variant="soft">
                        <Link to="/messages" search={{ with: other.id }}>
                          <MessageCircle className="h-4 w-4" /> Message
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/profiles/$id" params={{ id: other.id }}>
                        View
                      </Link>
                    </Button>
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
