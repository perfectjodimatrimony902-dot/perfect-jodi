"use client";

import { Link } from "@/lib/navigation";
import { HandHeart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { useDemoState } from "@/lib/store";



const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust & safety",
    text: "Every profile is reviewed by a person before it appears in search, and members can report anything that feels wrong.",
  },
  {
    icon: Users,
    title: "Families welcome",
    text: "Indian marriages involve families. Parents, siblings and relatives can create and manage profiles with care.",
  },
  {
    icon: HandHeart,
    title: "Respect for choice",
    text: "Interests must be accepted before conversations begin. Nobody is contacted without consent.",
  },
  {
    icon: Sparkles,
    title: "Diversity of India",
    text: "Search across religions, communities, mother tongues and cities — however your family defines a good match.",
  },
];

export default function AboutPage() {
  const state = useDemoState();
  const members = state.accounts.filter((a) => a.role === "member").length;
  const stories = state.stories.filter((s) => s.published).length;
  return (
    <>
      <PageHero
        crumb="About Us"
        title="About us"
        subtitle={`${state.settings.siteName} is an India-first matchmaking platform that brings families together with warmth, privacy and respect.`}
      />
      <section className="container-page grid gap-12 py-16 lg:grid-cols-2">
        <div className="space-y-4 text-foreground/85">
          <SectionHeading
            eyebrow="Our story"
            title="Matchmaking, the way families actually do it"
          />
          <p>
            We started with a simple observation: finding a life partner in India is rarely a solo
            journey. Parents ask about values, siblings ask about personality, and everyone wants to
            feel safe.
          </p>
          <p>
            So we built a platform where detailed profiles, honest partner preferences and
            consent-first connections come together — without exposing anyone's phone number or
            email.
          </p>
          <p className="text-sm text-muted-foreground">
            This is a demonstration website. All members and stories shown are fictional.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Registered members", value: members },
            { label: "Verified profiles", value: state.profiles.filter((p) => p.verified).length },
            {
              label: "Cities represented",
              value: new Set(state.profiles.map((p) => p.city).filter(Boolean)).size,
            },
            { label: "Published success stories", value: stories },
          ].map((s) => (
            <div key={s.label} className="surface flex flex-col justify-center p-6">
              <span className="font-display text-5xl font-semibold text-primary">{s.value}</span>
              <span className="mt-1 text-sm text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-secondary/50 py-16">
        <div className="container-page">
          <SectionHeading center eyebrow="What we stand for" title="Our values" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="surface flex gap-4 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg">
              <Link to="/register">Join for free</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
