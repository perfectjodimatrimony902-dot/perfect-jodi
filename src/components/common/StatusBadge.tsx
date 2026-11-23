import { Badge } from "@/components/ui/badge";
import type { InterestStatus, MembershipTier, ProfileStatus } from "@/lib/types";
import { BadgeCheck, Crown } from "lucide-react";

export function ProfileStatusBadge({ status }: { status: ProfileStatus }) {
  if (status === "approved") return <Badge variant="success">Approved</Badge>;
  if (status === "pending") return <Badge variant="warning">Pending review</Badge>;
  return <Badge variant="destructive">Rejected</Badge>;
}

export function InterestStatusBadge({ status }: { status: InterestStatus }) {
  const map = {
    pending: <Badge variant="warning">Pending</Badge>,
    accepted: <Badge variant="success">Accepted</Badge>,
    declined: <Badge variant="destructive">Declined</Badge>,
    withdrawn: <Badge variant="muted">Withdrawn</Badge>,
  } as const;
  return map[status];
}

export function MembershipBadge({ tier }: { tier: MembershipTier }) {
  if (tier === "free") return <Badge variant="muted">Free</Badge>;
  return (
    <Badge variant="gold" className="gap-1">
      <Crown className="h-3 w-3" /> {tier === "gold" ? "Gold" : "Premium"}
    </Badge>
  );
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  if (!verified) return <Badge variant="muted">Not verified</Badge>;
  return (
    <Badge variant="success" className="gap-1">
      <BadgeCheck className="h-3 w-3" /> Verified
    </Badge>
  );
}
