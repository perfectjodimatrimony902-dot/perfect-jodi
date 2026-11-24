"use client";

import { CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/FormField";
import { PageHero } from "@/components/site/PageHero";
import { BRAND } from "@/config/brand";
import { submitEnquiry } from "@/lib/actions";
import { useDemoState } from "@/lib/store";
import { contactSchema, fieldErrors } from "@/lib/validation";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactPage() {
  const { settings } = useDemoState();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const set =
    (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = fieldErrors(contactSchema, form);
    setErrors(r.errors);
    if (!r.data) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    const data = r.data;
    window.setTimeout(() => {
      submitEnquiry(data);
      setSubmitting(false);
      setDone(true);
      setForm(EMPTY);
      toast.success("Message sent. We'll get back to you soon.");
    }, 500);
  };

  const info = [
    { icon: Mail, label: "Email", value: settings.contactEmail },
    { icon: Phone, label: "Phone", value: settings.contactPhone },
    { icon: MapPin, label: "Office", value: BRAND.address },
    { icon: Clock, label: "Hours", value: "Mon–Sat, 10am – 7pm IST" },
  ];

  return (
    <>
      <PageHero
        crumb="Contact Us"
        title="Contact us"
        subtitle="We usually reply within one working day."
      />
      <section className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-4">
          {info.map(({ icon: Icon, label, value }) => (
            <div key={label} className="surface flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="surface p-6 md:p-8">
          {done ? (
            <div className="flex flex-col items-start gap-3 py-8">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <h2 className="text-3xl">Thank you for writing to us</h2>
              <p className="text-muted-foreground">
                Your message has been received. Our team will be in touch soon.
              </p>
              <Button variant="outline" onClick={() => setDone(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
              <h2 className="text-3xl text-primary sm:col-span-2">Send a message</h2>
              <FormField id="c-name" label="Your name" error={errors.name}>
                <Input id="c-name" value={form.name} onChange={set("name")} autoComplete="name" />
              </FormField>
              <FormField id="c-email" label="Email" error={errors.email}>
                <Input
                  id="c-email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                />
              </FormField>
              <FormField id="c-phone" label="Mobile (optional)" error={errors.phone}>
                <Input
                  id="c-phone"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={set("phone")}
                />
              </FormField>
              <FormField id="c-subject" label="Subject" error={errors.subject}>
                <Input id="c-subject" value={form.subject} onChange={set("subject")} />
              </FormField>
              <FormField
                id="c-message"
                label="Message"
                error={errors.message}
                className="sm:col-span-2"
              >
                <Textarea id="c-message" rows={6} value={form.message} onChange={set("message")} />
              </FormField>
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="sm:col-span-2 sm:justify-self-start"
              >
                {submitting ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
