"use client";

import { Check, Info, Minus } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { PlanCards } from "@/components/site/PlanCards";
import { MembershipBadge } from "@/components/common/StatusBadge";
import { PLAN_FEATURES } from "@/data/content";
import { formatINR, useSession } from "@/hooks/use-demo";

export default function MembershipPage() {
  const { state, account } = useSession();
  return (
    <>
      <PageHero
        crumb="Membership"
        title="Membership plans"
        subtitle="Start free and upgrade whenever you're ready."
      >
        {account?.role === "member" && (
          <p className="mt-4 flex items-center gap-2 text-sm">
            Your current plan: <MembershipBadge tier={account.membership} />
          </p>
        )}
      </PageHero>
      <section className="container-page py-14">
        <div className="mb-10 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning-soft p-4 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>
            All prices are <strong>sample demo prices</strong>. Upgrading only simulates a
            subscription — no payment is taken.
          </p>
        </div>
        <PlanCards />
        <h2 className="mt-20 text-3xl">Compare features</h2>
        <div className="surface mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b bg-secondary/60 text-left">
                <th className="p-4 font-semibold">Feature</th>
                {state.plans.map((p) => (
                  <th key={p.tier} className="p-4 text-center font-semibold">
                    {p.name}
                    <div className="text-xs font-normal text-muted-foreground">
                      {p.price ? formatINR(p.price) : "Free"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_FEATURES.map((f) => (
                <tr key={f.label} className="border-b last:border-0">
                  <td className="p-4">{f.label}</td>
                  {state.plans.map((p) => (
                    <td key={p.tier} className="p-4 text-center">
                      {f.tiers.includes(p.tier) ? (
                        <Check className="mx-auto h-4 w-4 text-success" aria-label="Included" />
                      ) : (
                        <Minus
                          className="mx-auto h-4 w-4 text-muted-foreground/60"
                          aria-label="Not included"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
