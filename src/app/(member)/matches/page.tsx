"use client";

import { Link } from "@/lib/navigation";
import { Info, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { NativeSelect } from "@/components/common/NativeSelect";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useSession } from "@/hooks/use-demo";
import { recommendedMatches } from "@/lib/matching";

export default function MatchesPage() {
  const { state, profile } = useSession();
  const [min, setMin] = useState("0");
  const matches = useMemo(
    () => (profile ? recommendedMatches(profile, state.profiles) : []),
    [profile, state.profiles],
  );
  const shown = matches.filter((m) => m.compat.score >= Number(min));
  if (!profile) return null;

  return (
    <div>
      <MemberPageTitle
        title="Recommended matches"
        text="Ranked by how many of your partner preferences each profile meets."
        action={
          <div className="w-48">
            <NativeSelect
              aria-label="Minimum match"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              options={[
                { value: "0", label: "All matches" },
                { value: "50", label: "50% and above" },
                { value: "70", label: "70% and above" },
                { value: "85", label: "85% and above" },
              ]}
            />
          </div>
        }
      />
      <div className="mb-6 flex gap-3 rounded-lg border border-gold/40 bg-gold-soft p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p>
          <strong>About the match %:</strong> this is a simple demo estimate — the share of your
          preferences (age, height, religion, location, education, occupation, marital status) a
          profile meets. It is not a scientific compatibility assessment.{" "}
          <Link to="/my-profile" className="font-semibold text-primary underline">
            Edit preferences
          </Link>
        </p>
      </div>
      {shown.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No matches at this level"
          text="Try lowering the minimum match or widening your partner preferences."
          action={<Button onClick={() => setMin("0")}>Show all matches</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map(({ profile: p, compat }) => (
            <div key={p.id} className="flex flex-col">
              <ProfileCard profile={p} compat={compat.score} />
              <p className="mt-2 px-1 text-xs text-muted-foreground">
                {compat.unmatched.length === 0
                  ? "Meets all your preferences"
                  : `Differs on: ${compat.unmatched.join(", ")}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
