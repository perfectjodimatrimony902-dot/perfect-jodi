"use client";


import { CheckCircle2, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/FormField";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHero } from "@/components/site/PageHero";
import { formatDate } from "@/hooks/use-demo";
import { submitStory } from "@/lib/actions";
import { useDemoState } from "@/lib/store";
import { fieldErrors, storySchema } from "@/lib/validation";



function StoriesPage() {
  const state = useDemoState();
  const stories = state.stories.filter((s) => s.published);
  const [form, setForm] = useState({ couple: "", city: "", marriedOn: "", story: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = fieldErrors(storySchema, form);
    setErrors(r.errors);
    if (!r.data) return;
    submitStory(r.data);
    setSent(true);
    setForm({ couple: "", city: "", marriedOn: "", story: "" });
    toast.success("Thank you! Your story will appear after review.");
  };

  return (
    <>
      <PageHero
        crumb="Success Stories"
        title="Success stories"
        subtitle="Every match is a new beginning. Here are a few of the families we've helped bring together."
      />
      <section className="container-page py-14">
        {stories.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No stories published yet"
            text="Check back soon for stories from our members."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((s) => (
              <article key={s.id} className="surface flex flex-col p-7">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-display text-2xl text-gold ring-2 ring-gold/50 ring-offset-2 ring-offset-card">
                  {s.couple
                    .split("&")
                    .map((n) => n.trim()[0])
                    .join("")}
                </div>
                <h2 className="mt-5 text-2xl">{s.couple}</h2>
                <p className="text-xs text-muted-foreground">
                  {s.city} · Married {formatDate(s.marriedOn)}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-foreground/85">{s.story}</p>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="container-page">
        <div className="surface grid gap-8 p-6 md:grid-cols-[1fr_1.4fr] md:p-10">
          <div>
            <h2 className="text-3xl text-primary">Share your story</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Met your partner here? We'd love to celebrate with you. Stories are published after a
              quick review.
            </p>
          </div>
          {sent ? (
            <div className="flex flex-col items-start justify-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <p className="font-semibold">Story received — thank you!</p>
              <p className="text-sm text-muted-foreground">Our team will review it shortly.</p>
              <Button variant="outline" onClick={() => setSent(false)}>
                Share another
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
              <FormField id="couple" label="Couple's names" error={errors.couple}>
                <Input
                  id="couple"
                  value={form.couple}
                  onChange={(e) => setForm({ ...form, couple: e.target.value })}
                  placeholder="Rahul & Nisha"
                />
              </FormField>
              <FormField id="city" label="City" error={errors.city}>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </FormField>
              <FormField
                id="marriedOn"
                label="Wedding date"
                error={errors.marriedOn}
                className="sm:col-span-2"
              >
                <Input
                  id="marriedOn"
                  type="date"
                  value={form.marriedOn}
                  onChange={(e) => setForm({ ...form, marriedOn: e.target.value })}
                />
              </FormField>
              <FormField
                id="story"
                label="Your story"
                error={errors.story}
                className="sm:col-span-2"
              >
                <Textarea
                  id="story"
                  rows={5}
                  value={form.story}
                  onChange={(e) => setForm({ ...form, story: e.target.value })}
                />
              </FormField>
              <Button type="submit" className="sm:col-span-2 sm:justify-self-start">
                Submit story
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

export default StoriesPage;
