"use client";

import { Link, useNavigate, Route } from "@/lib/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { FormField } from "@/components/common/FormField";
import { NativeSelect } from "@/components/common/NativeSelect";
import { useSession } from "@/hooks/use-demo";
import { syncMongoSession, type RegisterInput } from "@/lib/actions";
import { CREATED_BY } from "@/lib/options";
import { cn } from "@/lib/utils";
import { fieldErrors, makeRegisterSchema } from "@/lib/validation";

export default function RegisterPage() {
  const { gender: initialGender } = Route.useSearch();
  const navigate = useNavigate();
  const { account, state } = useSession();

  const [form, setForm] = useState({
    name: "",
    gender: initialGender ?? "",
    dob: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
    createdBy: "Self",
    terms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [pending, setPending] = useState<RegisterInput | null>(null);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  // 60-Second Cooldown Timer for Resending OTP
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  // Step 1: Submit Details & Trigger Email OTP
  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const r = fieldErrors(makeRegisterSchema(), form);
    setErrors(r.errors);
    if (!r.data) return;

    const input: RegisterInput = {
      name: r.data.name,
      gender: r.data.gender,
      dob: r.data.dob,
      email: r.data.email,
      mobile: r.data.mobile,
      password: r.data.password,
      createdBy: r.data.createdBy,
    };

    setBusy(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      setBusy(false);

      if (!res.ok || !data.ok) {
        setFormError(data.error || "Failed to initiate registration. Please check your details.");
        return;
      }

      setPending(input);
      setStep("otp");
      setTimer(60);
      setOtp("");
      setOtpError("");
      toast.success(`Verification code sent to ${input.email}! Please check your email.`);
    } catch {
      setBusy(false);
      setFormError("Network connection error. Please try again.");
    }
  };

  // Step 2: Verify 6-digit Email OTP & Complete Registration
  const verifyOtp = async () => {
    if (!pending) return;

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setOtpError("Please enter the complete 6-digit code sent to your email.");
      return;
    }

    setBusy(true);
    setOtpError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pending.email,
          otp: cleanOtp,
        }),
      });

      const data = await res.json();
      setBusy(false);

      if (!res.ok || !data.ok) {
        setOtpError(data.error || "Invalid or expired verification code.");
        return;
      }

      // Synchronize session into client state
      if (data.user && data.token) {
        syncMongoSession(data.user, null, data.token);
      }

      toast.success("Email verified successfully! Welcome to Perfect Jodi.");
      navigate({ to: "/create-profile" });
    } catch {
      setBusy(false);
      setOtpError("Network connection error. Could not verify code.");
    }
  };

  // Resend OTP Functionality
  const handleResend = async () => {
    if (!pending || timer > 0 || resending) return;

    setResending(true);
    setOtpError("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pending.email }),
      });

      const data = await res.json();
      setResending(false);

      if (!res.ok || !data.ok) {
        setOtpError(data.error || "Failed to resend verification code.");
        return;
      }

      setOtp("");
      setTimer(data.cooldownSeconds || 60);
      toast.success(`A new verification code has been sent to ${pending.email}.`);
    } catch {
      setResending(false);
      setOtpError("Network error. Could not resend verification code.");
    }
  };

  if (account) {
    return (
      <section className="container-page py-16">
        <div className="surface mx-auto max-w-lg p-8 text-center rounded-2xl border shadow-sm">
          <h1 className="text-3xl text-primary font-bold">You are already registered</h1>
          <p className="mt-2 text-sm text-muted-foreground">You are logged in as {account.email}.</p>
          <Button asChild className="mt-6">
            {account.role === "admin" ? (
              <Link to="/admin">Go to admin panel</Link>
            ) : (
              <Link to="/dashboard">Go to dashboard</Link>
            )}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-12 md:py-16">
      <div className="surface mx-auto max-w-2xl p-6 md:p-10 rounded-3xl border shadow-sm">
        {/* Registration Steps Header */}
        <ol className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider">
          {["Your details", "Verify email"].map((label, i) => {
            const active = (i === 0 && step === "details") || (i === 1 && step === "otp");
            return (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-2",
                  active ? "text-primary font-bold" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition-all",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border bg-secondary/50",
                  )}
                >
                  {i + 1}
                </span>
                <span>{label}</span>
                {i === 0 && <span className="mx-1 h-px w-8 bg-border" />}
              </li>
            );
          })}
        </ol>

        {!state.settings.allowRegistrations && (
          <p className="mb-6 rounded-md bg-warning-soft p-3 text-sm text-warning">
            New registrations are temporarily paused by the site admin.
          </p>
        )}

        {step === "details" ? (
          <form onSubmit={submitDetails} noValidate>
            <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              Create your free account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Begin your search for a life partner with trusted profiles and Vedic Kundali matchmaking.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <FormField id="r-createdBy" label="Profile created by" error={errors.createdBy}>
                <NativeSelect
                  id="r-createdBy"
                  value={form.createdBy}
                  onChange={set("createdBy")}
                  options={[...CREATED_BY]}
                />
              </FormField>

              <FormField id="r-gender" label="Gender of the person" error={errors.gender}>
                <NativeSelect
                  id="r-gender"
                  value={form.gender}
                  onChange={set("gender")}
                  placeholder="Select"
                  options={[
                    { value: "female", label: "Female (Bride)" },
                    { value: "male", label: "Male (Groom)" },
                  ]}
                />
              </FormField>

              <FormField
                id="r-name"
                label="Full name"
                error={errors.name}
                className="sm:col-span-2"
              >
                <Input
                  id="r-name"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={set("name")}
                  autoComplete="name"
                />
              </FormField>

              <FormField id="r-dob" label="Date of birth" error={errors.dob}>
                <Input id="r-dob" type="date" value={form.dob} onChange={set("dob")} />
              </FormField>

              <FormField id="r-mobile" label="Mobile number" error={errors.mobile}>
                <div className="flex">
                  <span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                    +91
                  </span>
                  <Input
                    id="r-mobile"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10 digit number"
                    value={form.mobile}
                    onChange={(e) =>
                      setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })
                    }
                    className="rounded-l-none"
                  />
                </div>
              </FormField>

              <FormField
                id="r-email"
                label="Email address (OTP verification sent here)"
                error={errors.email}
                className="sm:col-span-2"
              >
                <Input
                  id="r-email"
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                />
              </FormField>

              <FormField
                id="r-pass"
                label="Password"
                error={errors.password}
                hint="At least 6 characters with letters and numbers"
              >
                <div className="relative">
                  <Input
                    id="r-pass"
                    type={show ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={set("password")}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground hover:text-foreground"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              <FormField id="r-confirm" label="Confirm password" error={errors.confirm}>
                <Input
                  id="r-confirm"
                  type={show ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  autoComplete="new-password"
                />
              </FormField>

              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-2 text-sm text-foreground/80">
                  <Checkbox
                    checked={form.terms}
                    onCheckedChange={(v) => setForm({ ...form, terms: v === true })}
                    className="mt-0.5"
                  />
                  <span>
                    I confirm that the details provided are genuine and agree to the Terms & Privacy Policy of Perfect Jodi.
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-xs text-destructive" role="alert">
                    {errors.terms}
                  </p>
                )}
              </div>
            </div>

            {formError && (
              <p
                className="mt-5 rounded-xl bg-destructive-soft p-3.5 text-sm text-destructive font-medium border border-destructive/20"
                role="alert"
              >
                {formError}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full font-bold shadow-md cursor-pointer"
              disabled={!state.settings.allowRegistrations || busy}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Verification Code…
                </>
              ) : (
                "Continue & Send Email OTP"
              )}
            </Button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </p>
          </form>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => {
                setStep("details");
                setOtp("");
                setOtpError("");
              }}
              className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Change email / edit details
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">
                  Verify your email address
                </h1>
                <p className="text-sm text-muted-foreground">
                  We've delivered a 6-digit OTP code to:
                </p>
              </div>
            </div>

            <div className="my-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Verification sent to</span>
                <strong className="text-base text-primary font-bold">{pending?.email}</strong>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full border border-amber-500/20">
                Valid for 5 mins
              </span>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit One-Time Password (OTP) received in your email inbox:
              </p>

              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(v) => {
                  setOtp(v.replace(/\D/g, ""));
                  setOtpError("");
                }}
                aria-label="One-time verification code"
                autoFocus
              >
                <InputOTPGroup className="gap-2 sm:gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="h-14 w-11 sm:h-16 sm:w-13 rounded-xl border border-border/80 bg-card text-xl font-bold text-foreground shadow-xs focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              {otpError && (
                <p
                  className="rounded-xl bg-destructive-soft p-3 text-sm text-destructive font-medium border border-destructive/20 text-center w-full"
                  role="alert"
                >
                  {otpError}
                </p>
              )}
            </div>

            <Button
              size="lg"
              className="mt-6 w-full font-bold shadow-md cursor-pointer"
              onClick={verifyOtp}
              disabled={busy || otp.length !== 6}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Code…
                </>
              ) : (
                "Verify OTP & Complete Registration"
              )}
            </Button>

            {/* Resend OTP Section with 60-second Cooldown */}
            <div className="mt-6 pt-5 border-t border-border/70 text-center text-sm">
              <p className="text-muted-foreground mb-2">
                Didn't receive the email? Check your Spam / Junk folder.
              </p>
              {timer > 0 ? (
                <p className="text-xs text-muted-foreground font-medium">
                  You can request a new OTP in{" "}
                  <span className="font-bold text-primary font-mono">{timer}s</span>
                </p>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResend}
                  disabled={resending}
                  className="gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/5 cursor-pointer font-semibold"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", resending && "animate-spin")} />
                  {resending ? "Sending New Code…" : "Resend 6-Digit OTP"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
