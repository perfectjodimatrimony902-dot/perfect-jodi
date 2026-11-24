"use client";

import { Link, useNavigate, Route } from "@/lib/navigation";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { FormField } from "@/components/common/FormField";
import { NativeSelect } from "@/components/common/NativeSelect";
import { DEMO_OTP } from "@/config/brand";
import { useSession } from "@/hooks/use-demo";
import { checkRegistration, completeRegistration, syncMongoSession, type RegisterInput } from "@/lib/actions";
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
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const submitDetails = (e: React.FormEvent) => {
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
    const check = checkRegistration(input);
    if (!check.ok) {
      setFormError(check.error);
      return;
    }
    setPending(input);
    setStep("otp");
    toast.info(`Demo OTP sent to +91 ${input.mobile}`);
  };

    const verify = async () => {
      if (!pending) return;
      if (otp.length !== 6) {
        setOtpError("Enter the 6-digit code.");
        return;
      }
      if (otp !== DEMO_OTP) {
        setOtpError(`Invalid code. Enter the verification code ${DEMO_OTP}.`);
        return;
      }

      setBusy(true);
        setOtpError("");

        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: pending.name,
              gender: pending.gender,
              dob: pending.dob,
              email: pending.email,
              mobile: pending.mobile,
              password: pending.password,
              createdBy: pending.createdBy,
            }),
          });

          const data = await res.json();
          setBusy(false);

          if (!res.ok || !data.ok) {
            setOtpError(data.error || "Registration failed. Please try again.");
            return;
          }

          syncMongoSession(data.user, null, data.token);
          toast.success("Account verified & created successfully! Now let's create your matrimony profile.");
          navigate({ to: "/create-profile" });
        } catch {
          // Offline / fallback to local state
          const r = completeRegistration(pending, otp);
          setBusy(false);
          if (!r.ok) {
            setOtpError(r.error);
            return;
          }
          toast.success("Mobile verified! Let's complete your profile.");
      navigate({ to: "/create-profile" });
    }
  };

  if (account) {
    return (
      <section className="container-page py-16">
        <div className="surface mx-auto max-w-lg p-8 text-center">
          <h1 className="text-3xl text-primary">You're already registered</h1>
          <p className="mt-2 text-sm text-muted-foreground">You're logged in as {account.email}.</p>
          <Button asChild className="mt-6">
            {account.role === "admin" ? (
              <Link to="/admin">Admin panel</Link>
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
      <div className="surface mx-auto max-w-2xl p-6 md:p-10">
        <ol className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider">
          {["Your details", "Verify mobile"].map((label, i) => {
            const active = (i === 0 && step === "details") || (i === 1 && step === "otp");
            return (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-2",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border",
                    active && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {i + 1}
                </span>
                {label}
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
            <h1 className="text-4xl text-primary">Create your free account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              For yourself or someone in your family.
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
                <Input id="r-name" value={form.name} onChange={set("name")} autoComplete="name" />
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
                label="Email address"
                error={errors.email}
                className="sm:col-span-2"
              >
                <Input
                  id="r-email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                />
              </FormField>
              <FormField
                id="r-pass"
                label="Password"
                error={errors.password}
                hint="At least 8 characters with a letter and a number"
              >
                <div className="relative">
                  <Input
                    id="r-pass"
                    type={show ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground"
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
                  value={form.confirm}
                  onChange={set("confirm")}
                  autoComplete="new-password"
                />
              </FormField>
              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <Checkbox
                    checked={form.terms}
                    onCheckedChange={(v) => setForm({ ...form, terms: v === true })}
                    className="mt-0.5"
                  />
                  <span>
                    I confirm the details are genuine and agree to the terms and privacy policy of
                    this demo.
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
                className="mt-5 rounded-md bg-destructive-soft p-3 text-sm text-destructive"
                role="alert"
              >
                {formError}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full"
              disabled={!state.settings.allowRegistrations}
            >
              Continue
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already registered?{" "}
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
              className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Edit details
            </button>
            <h1 className="text-4xl text-primary">Verify your mobile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a 6-digit code to +91 {pending?.mobile}.
            </p>
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-dashed border-gold/60 bg-gold-soft p-4 text-sm">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <p>
                <strong>Simulated OTP:</strong> no SMS is sent in this demo. Use code{" "}
                <code className="rounded bg-card px-1.5 py-0.5 font-mono font-bold">
                  {DEMO_OTP}
                </code>
                .
              </p>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(v) => {
                  setOtp(v.replace(/\D/g, ""));
                  setOtpError("");
                }}
                aria-label="One-time code"
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} className="h-12 w-11 bg-card text-lg" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {otpError && (
                <p className="text-sm text-destructive" role="alert">
                  {otpError}
                </p>
              )}
            </div>
            <Button size="lg" className="mt-8 w-full" onClick={verify} disabled={busy}>
              {busy ? "Verifying…" : "Verify & create account"}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Didn't get it?{" "}
              <button
                type="button"
                className="cursor-pointer font-semibold text-primary hover:underline"
                onClick={() => toast.info(`Demo code re-sent: ${DEMO_OTP}`)}
              >
                Resend code
              </button>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
