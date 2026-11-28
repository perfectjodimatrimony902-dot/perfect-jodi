"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Heart,
  CheckCircle2,
  X,
  CreditCard,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { sendInterest } from "@/lib/actions";
import { setState } from "@/lib/store";
import { useSession } from "@/hooks/use-demo";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ConnectPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetProfile: Profile;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function ConnectPaymentModal({
  open,
  onOpenChange,
  targetProfile,
  onSuccess,
}: ConnectPaymentModalProps) {
  const { account, profile: myProfile } = useSession();
  const [loading, setLoading] = useState(false);

  // Dynamically load Razorpay SDK script if not already on window
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!account) {
      toast.error("Please log in to send a connect request.");
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay secure checkout. Please check internet connection.");
        setLoading(false);
        return;
      }

      // 1. Create order on server (₹50)
      const orderRes = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetProfileId: targetProfile.id,
          amount: 50,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.ok) {
        toast.error(orderData.error || "Unable to initialize Razorpay payment order.");
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Standard Checkout SDK
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // in paise
        currency: orderData.currency || "INR",
        name: "Perfect Jodi",
        description: `Connect Request with ${targetProfile.name}`,
        image: "/icon.png",
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user?.name || account.name || "Member",
          email: orderData.user?.email || account.email || "",
          contact: orderData.user?.phone || "",
        },
        theme: {
          color: "#7c1024", // Royal Maroon Brand Theme
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            onOpenChange(true);
            toast.info("Payment cancelled. You can retry anytime.");
          },
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          // 3. Verify Payment Signature on server
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                targetProfileId: targetProfile.id,
                targetUserId: targetProfile.ownerId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.ok) {
              // Unlock one-time connect pass in local store
              setState((st) => ({
                ...st,
                accounts: st.accounts.map((a) =>
                  a.id === account.id || a.email.toLowerCase() === account.email.toLowerCase()
                    ? { ...a, hasPaidConnectPass: true, membership: a.membership === "free" ? "gold" : a.membership }
                    : a,
                ),
              }));

              // Sync local state
              sendInterest(targetProfile.id, targetProfile.ownerId);

              toast.success(`Payment of ₹50 verified! Connect Pass activated & request sent to ${targetProfile.name}!`);
              onOpenChange(false);
              onSuccess?.();
            } else {
              toast.error(verifyData.error || "Payment signature verification failed.");
            }
          } catch (err: any) {
            console.warn("Verification error:", err);
            toast.error("Network issue while confirming payment. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failResp: any) {
        console.warn("Razorpay payment failed:", failResp?.error || failResp);
        const errMsg =
          failResp?.error?.description ||
          "Payment could not be completed. Please try Netbanking or UPI.";
        toast.error(errMsg);
        setLoading(false);
        onOpenChange(true);
      });

      // Close parent dialog so its focus trap / overlay does not block Razorpay iframe
      onOpenChange(false);
      rzp.open();
    } catch (error: any) {
      console.warn("Payment flow error:", error);
      toast.error(error.message || "An unexpected error occurred during payment.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-md p-6 overflow-hidden rounded-2xl border-gold/40 shadow-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-lg font-display">
            <Sparkles className="h-5 w-5 text-gold" />
            <span>Send Connection Request</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Connect directly with verified matrimonial profiles on Perfect Jodi.
          </p>
        </DialogHeader>

        {/* Target Profile Card Preview */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 flex items-center gap-3.5">
          <ProfileAvatar
            name={targetProfile.name}
            tone={targetProfile.tone}
            size="md"
            photoUrl={targetProfile.photoUrl}
          />
          <div className="space-y-0.5 overflow-hidden">
            <h4 className="font-bold text-sm text-foreground truncate">
              {targetProfile.name}
            </h4>
            <div className="text-xs text-muted-foreground truncate">
              {targetProfile.city || "India"} · {targetProfile.religion || "Hindu"}
              {targetProfile.community ? ` (${targetProfile.community})` : ""}
            </div>
            <div className="text-[11px] text-primary font-medium truncate">
              {targetProfile.occupation || targetProfile.qualification || "Verified Member"}
            </div>
          </div>
        </div>

        {/* Plan / Connect Pass Benefits */}
        <div className="space-y-2 py-1 text-xs">
          <div className="font-semibold text-foreground text-xs flex items-center justify-between">
            <span>Connect Pass (One-Time Activation)</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-500/15 font-bold px-2 py-0.5 rounded-full">
              Pay Once Only
            </span>
          </div>
          <div className="space-y-1.5 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span><strong>One-time ₹50 only:</strong> Unlocks sending interest to <strong>all profiles</strong> forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Direct connection request & priority notification to {targetProfile.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Instant SMS, Email, and in-app alert sent to candidate</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Unlocks 1-on-1 private messaging upon acceptance</span>
            </div>
          </div>
        </div>

        {/* Amount & Price Breakdown */}
        <div className="rounded-xl border border-gold/40 bg-gradient-to-r from-primary/5 via-gold/10 to-primary/5 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">One-Time Activation Fee:</span>
            <span className="font-medium text-foreground">₹50.00</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">All Future Interests:</span>
            <span className="text-emerald-700 font-semibold">100% FREE (₹0)</span>
          </div>
          <div className="border-t border-border/60 pt-2 flex items-center justify-between font-bold text-sm">
            <div className="flex flex-col">
              <span className="text-foreground">Total Payable Amount:</span>
              <span className="text-[11px] text-muted-foreground font-normal">One-time payment only</span>
            </div>
            <span className="text-primary font-display text-lg">₹50</span>
          </div>
        </div>

        {/* Payment CTA Button */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            size="lg"
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-bold shadow-md gap-2"
          >
            <Lock className="h-4 w-4 text-gold" />
            <span>{loading ? "Opening Razorpay..." : "Pay ₹50 via Razorpay"}</span>
          </Button>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Razorpay Verified</span>
            </span>
            <span>·</span>
            <span>UPI, Cards, NetBanking</span>
            <span>·</span>
            <span>Test Mode</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
