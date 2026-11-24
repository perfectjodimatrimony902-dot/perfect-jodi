"use client";

import { Link, useNavigate, useRouter, Route } from "@/lib/navigation";
import { Eye, EyeOff, KeyRound, Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { DEMO_ADMIN, DEMO_MEMBER } from "@/config/brand";
import { useSession } from "@/hooks/use-demo";
import { login, logout } from "@/lib/actions";
import { emailSchema, fieldErrors } from "@/lib/validation";
import { z } from "zod";

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { redirect } = Route.useSearch();
  const router = useRouter();
  const navigate = useNavigate();
  const { account } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const doLogin = (email: string, password: string) => {
    setLoading(true);
    setFormError("");
    window.setTimeout(() => {
      const r = login(email, password);
      setLoading(false);
      if (!r.ok) {
        setFormError(r.error);
        return;
      }
      toast.success("Welcome back!");
      if (r.role === "admin") navigate({ to: "/admin" });
      else if (redirect && !redirect.startsWith("/admin")) router.push(redirect);
      else navigate({ to: "/dashboard" });
    }, 400);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = fieldErrors(schema, form);
    setErrors(r.errors);
    if (r.data) doLogin(r.data.email, r.data.password);
  };

  return (
    <section className="container-page grid gap-8 py-12 md:py-16 lg:grid-cols-[1fr_0.9fr]">
      <div className="surface mx-auto w-full max-w-lg p-6 md:p-10">
        <h1 className="text-4xl text-primary">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Log in to continue your search.</p>
        {account ? (
          <div className="mt-8 space-y-4">
            <p className="rounded-lg bg-success-soft p-4 text-sm text-success">
              You're logged in as <strong>{account.email}</strong>.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                {account.role === "admin" ? (
                  <Link to="/admin">Go to admin panel</Link>
                ) : (
                  <Link to="/dashboard">Go to dashboard</Link>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  toast.success("Logged out.");
                }}
              >
                Log out
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            {redirect && (
              <p className="rounded-lg bg-primary-soft p-3 text-sm text-primary">
                Please log in to continue.
              </p>
            )}
            <FormField id="l-email" label="Email address" error={errors.email}>
              <Input
                id="l-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField id="l-pass" label="Password" error={errors.password}>
              <div className="relative">
                <Input
                  id="l-pass"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            {formError && (
              <p
                className="rounded-md bg-destructive-soft p-3 text-sm text-destructive"
                role="alert"
              >
                {formError}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create a free account
              </Link>
            </p>
          </form>
        )}
      </div>

      <aside className="mx-auto w-full max-w-lg">
        <div className="rounded-xl border-2 border-dashed border-gold/60 bg-gold-soft/60 p-6 md:p-8">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-gold" />
            <h2 className="text-2xl">Demo login mode</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            This is a demo website. Use these accounts to explore — data is stored only in your
            browser.
          </p>
          <div className="mt-6 space-y-4">
            <DemoCard
              icon={User}
              title="Demo member (bride)"
              email={DEMO_MEMBER.email}
              password={DEMO_MEMBER.password}
              onUse={() => doLogin(DEMO_MEMBER.email, DEMO_MEMBER.password)}
              disabled={loading || !!account}
            />
            <DemoCard
              icon={Shield}
              title="Demo admin"
              email={DEMO_ADMIN.email}
              password={DEMO_ADMIN.password}
              onUse={() => doLogin(DEMO_ADMIN.email, DEMO_ADMIN.password)}
              disabled={loading || !!account}
            />
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Every other sample member uses the password{" "}
            <code className="rounded bg-card px-1">Demo1234</code>.
          </p>
        </div>
      </aside>
    </section>
  );
}

function DemoCard({
  icon: Icon,
  title,
  email,
  password,
  onUse,
  disabled,
}: {
  icon: typeof User;
  title: string;
  email: string;
  password: string;
  onUse: () => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </div>
      <dl className="mt-2 grid grid-cols-[80px_1fr] gap-y-1 text-sm">
        <dt className="text-muted-foreground">Email</dt>
        <dd className="break-all font-mono text-xs leading-5">{email}</dd>
        <dt className="text-muted-foreground">Password</dt>
        <dd className="font-mono text-xs leading-5">{password}</dd>
      </dl>
      <Button size="sm" variant="soft" className="mt-3" onClick={onUse} disabled={disabled}>
        Log in as {(title.split(" (")[0] ?? title).toLowerCase()}
      </Button>
    </div>
  );
}
