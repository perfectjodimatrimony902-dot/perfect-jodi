"use client";

import { Link } from "@/lib/navigation";
import { Heart, HeartOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useSession } from "@/hooks/use-demo";
import { toggleShortlist } from "@/lib/actions";

export default function ShortlistPage() {
  const { state, account } = useSession();
  const ids = account ? (state.shortlists[account.id] ?? []) : [];
  const profiles = ids
    .map((id) => state.profiles.find((p) => p.id === id))
    .filter((p) => p && p.status === "approved");

  return (
    <div>
      <MemberPageTitle
        title="Shortlist"
        text={`${profiles.length} saved ${profiles.length === 1 ? "profile" : "profiles"} to discuss with family.`}
      />
      {profiles.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your shortlist is empty"
          text="Tap the heart on any profile to save it here."
          action={
            <Button asChild>
              <Link to="/profiles">Browse profiles</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map(
            (p) =>
              p && (
                <ProfileCard
                  key={p.id}
                  profile={p}
                  footer={
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toggleShortlist(p.id);
                        toast.success(`${p.name} removed from shortlist`);
                      }}
                    >
                      <HeartOff className="h-4 w-4" /> Remove
                    </Button>
                  }
                />
              ),
          )}
        </div>
      )}
    </div>
  );
}
