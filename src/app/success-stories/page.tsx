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
import { STORY_PHOTOS } from "@/data/profile-photos";
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
              <article
                key={s.id}
                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div className="relative h-60 w-full overflow-hidden bg-stone-900">
                  <img
                    src={s.photoUrl || STORY_PHOTOS[s.id] || STORY_PHOTOS.s1}
                    alt={s.couple}
                    className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white">
                    <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow">
                      {s.couple}
                    </h2>
                    <span className="text-xs text-white/90 font-medium drop-shadow">{s.city}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-xs text-gold-foreground font-semibold mb-2">
                      ✦ Married on {formatDate(s.marriedOn)}
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/85 border-l-2 border-gold/50 pl-3">
                      “{s.story}”
                    </p>
                  </div>
                </div>
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
