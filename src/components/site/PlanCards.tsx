"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { Check, Crown, Minus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PLAN_FEATURES } from "@/data/content";
import { formatINR, useSession } from "@/hooks/use-demo";
import { upgradeMembership } from "@/lib/actions";
import type { MembershipTier, Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlanCards({ compact = false }: { compact?: boolean }) {
  const { state, account } = useSession();
  const navigate = useNavigate();
  const [pending, setPending] = useState<Plan | null>(null);
  const current: MembershipTier | undefined =
    account?.role === "member" ? account.membership : undefined;

  const choose = (plan: Plan) => {
    if (!account) {
      toast.info("Please log in or register to choose a plan.");
      navigate({ to: "/login", search: { redirect: "/membership" } });
      return;
    }
    if (account.role === "admin") {
      toast.info("Admins manage plans from the admin panel.");
      return;
    }
    setPending(plan);
  };

  const confirm = () => {
    if (!pending) return;
    const r = upgradeMembership(pending.tier);
    if (r.ok)
      toast.success(
        `You're now on ${pending.name}. This was a simulated subscription — no payment taken.`,
      );
    else toast.error(r.error);
    setPending(null);
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {state.plans.map((plan) => {
          const featured = plan.tier === "gold";
          const isCurrent = current === plan.tier;
          return (
            <div
              key={plan.tier}
              className={cn(
                "surface relative flex flex-col p-7",
                featured && "border-gold shadow-lift md:-translate-y-2",
              )}
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground">
                  Most chosen
                </span>
              )}
              <div className="flex items-center gap-2">
                {plan.tier !== "free" && <Crown className="h-5 w-5 text-gold" />}
                <h3 className="text-2xl text-primary">{plan.name}</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold">
                  {plan.price === 0 ? "Free" : formatINR(plan.price)}
                </span>
                {plan.durationMonths > 0 && (
                  <span className="text-sm text-muted-foreground">
                    / {plan.durationMonths} months
                  </span>
                )}
              </div>
              {plan.price > 0 && (
                <p className="mt-1 text-xs font-medium text-warning">Sample / demo price</p>
              )}
              {!compact && (
                <ul className="mt-6 space-y-2.5 text-sm">
                  {PLAN_FEATURES.map((f) => {
                    const has = f.tiers.includes(plan.tier);
                    return (
                      <li
                        key={f.label}
                        className={cn("flex items-start gap-2", !has && "text-muted-foreground/70")}
                      >
                        {has ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        ) : (
                          <Minus className="mt-0.5 h-4 w-4 shrink-0" />
                        )}
                        {f.label}
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-auto pt-7">
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : plan.tier === "free" ? (
                  account ? (
                    <Button variant="outline" className="w-full" onClick={() => choose(plan)}>
                      Switch to Free
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/register">Register free</Link>
                    </Button>
                  )
                ) : (
                  <Button
                    variant={featured ? "gold" : "default"}
                    className="w-full"
                    onClick={() => choose(plan)}
                  >
                    Upgrade to {plan.name}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl">
              Confirm {pending?.name} plan
            </AlertDialogTitle>
            <AlertDialogDescription>
              This is a demo. Confirming will simulate a subscription
              {pending && pending.price > 0
                ? ` of ${formatINR(pending.price)} for ${pending.durationMonths} months`
                : ""}
              . No payment will be taken and no card details are needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirm}>Confirm (simulated)</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
