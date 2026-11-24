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
          const isPremium = plan.tier === "premium";
          const isCurrent = current === plan.tier;
          return (
            <div
              key={plan.tier}
              className={cn(
                "relative flex flex-col rounded-3xl border bg-card p-7 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5",
                featured
                  ? "border-2 border-gold shadow-lg shadow-gold/15 bg-gradient-to-b from-card via-card to-gold-soft/20 md:-translate-y-2"
                  : isPremium
                    ? "border-primary/50 shadow-md bg-gradient-to-b from-card to-primary-soft/30"
                    : "border-border/80",
              )}
            >
              {featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-600 to-gold px-4 py-1 text-xs font-bold text-stone-950 shadow-md">
                  ★ Most Chosen by Families
                </span>
              )}
              {isPremium && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-md">
                  👑 Dedicated Assisted Advisor
                </span>
              )}
              <div className="flex items-center gap-2.5">
                {plan.tier !== "free" ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/15 border border-gold/30 text-gold">
                    <Crown className="h-5 w-5 text-gold" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border text-foreground/70">
                    <Check className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-primary">{plan.name}</h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {plan.tier === "free"
                      ? "Basic Discovery"
                      : plan.tier === "gold"
                        ? "Connect & Message"
                        : "VIP Relationship Service"}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed min-h-[40px]">
                {plan.blurb}
              </p>

              <div className="mt-5 flex items-baseline gap-1.5 border-y border-border/60 py-4">
                <span className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                  {plan.price === 0 ? "Free" : formatINR(plan.price)}
                </span>
                {plan.durationMonths > 0 && (
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                    / {plan.durationMonths} months
                  </span>
                )}
              </div>

              {/* Highlights for compact mode */}
              {compact && (
                <ul className="mt-5 space-y-2 text-xs sm:text-sm text-foreground/85">
                  {plan.tier === "free" && (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Create verified profile</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Send up to 5 interests free</span>
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <Minus className="h-4 w-4 shrink-0" />
                        <span>Direct phone numbers locked</span>
                      </li>
                    </>
                  )}
                  {plan.tier === "gold" && (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-foreground">
                          View verified phone & WhatsApp
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Unlimited direct chat messaging</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Priority search ranking & badge</span>
                      </li>
                    </>
                  )}
                  {plan.tier === "premium" && (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-foreground">
                          Dedicated Family Advisor
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Handpicked match introductions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Kundali & family background assist</span>
                      </li>
                    </>
                  )}
                </ul>
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
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
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
                  <Button variant="outline" className="w-full rounded-xl" disabled>
                    Current Plan
                  </Button>
                ) : plan.tier === "free" ? (
                  account ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => choose(plan)}
                    >
                      Switch to Free
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full rounded-xl font-semibold">
                      <Link to="/register">Register Free</Link>
                    </Button>
                  )
                ) : (
                  <Button
                    variant={featured ? "gold" : "default"}
                    className="w-full rounded-xl font-semibold shadow-md cursor-pointer"
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
            <AlertDialogTitle className="text-2xl font-bold">
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
