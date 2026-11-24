"use client";

import { Link, useNavigate, useRouter, Route } from "@/lib/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { useSession } from "@/hooks/use-demo";
import { login, logout, syncMongoSession } from "@/lib/actions";
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

      const doLogin = async (email: string, password: string) => {
        setLoading(true);
        setFormError("");
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          setLoading(false);

          if (!res.ok || !data.ok) {
            setFormError(data.error || "Login failed. Please verify your credentials.");
            return;
          }

          syncMongoSession(data.user, data.profile, data.token);

          if (data.user.role === "admin") {
            toast.success("Welcome back, Administrator!");
            navigate({ to: "/admin" });
          } else if (!data.hasProfile) {
            toast.info("Welcome! Please create your matrimony profile to get started.");
            navigate({ to: "/create-profile" });
          } else if (redirect && !redirect.startsWith("/admin")) {
            toast.success(`Welcome back, ${data.user.name}!`);
            router.push(redirect);
          } else {
            toast.success(`Welcome back, ${data.user.name}!`);
            navigate({ to: "/dashboard" });
          }
        } catch {
          // Fallback for local demo
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
        }
      };

      const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const r = fieldErrors(schema, form);
        setErrors(r.errors);
        if (r.data) doLogin(r.data.email, r.data.password);
      };

      return (
            <section className="container-page flex min-h-[calc(100vh-180px)] items-center justify-center py-12 md:py-16">
              <div className="surface w-full max-w-md rounded-2xl border p-6 sm:p-10 shadow-sm">
                <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
                  Welcome back
                </h1>
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
                        placeholder="name@example.com"
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
                          placeholder="Enter your password"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                    {formError && (
                      <p
                        className="rounded-md bg-destructive-soft p-3 text-sm text-destructive"
                        role="alert"
                      >
                        {formError}
                      </p>
                    )}
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={loading}
                      >
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
            </section>
            );
}
