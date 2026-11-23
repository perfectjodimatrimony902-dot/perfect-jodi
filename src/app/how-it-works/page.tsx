"use client";

import { Link } from "@/lib/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { HOW_IT_WORKS } from "@/data/content";



const DETAILS = [
  [
    "Choose who the profile is for — yourself, a son or daughter, a sibling or a relative.",
    "Verify your mobile number with a one-time code (simulated in this demo).",
  ],
  [
    "Complete six short sections: personal, education & career, family, lifestyle, partner preferences and photo.",
    "Your profile is reviewed by our team before it appears in search.",
  ],
  [
    "Use filters for age, height, religion, community, mother tongue, city, education and more.",
    "See recommended matches with a simple compatibility estimate based on your preferences.",
  ],
  [
    "Send an interest. Once accepted, start a conversation.",
    "Shortlist profiles to discuss with family, and decline politely when it's not a fit.",
  ],
];

const SAFETY = [
  "Never send money or share bank details with anyone you meet online.",
  "Meet for the first time in a public place, ideally with family.",
  "Keep conversations on the platform until you're comfortable.",
  "Report profiles that ask for money or behave inappropriately.",
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        crumb="How It Works"
        title="How it works"
        subtitle="A calm, consent-first path from registration to meeting the family."
      />
      <section className="container-page py-16">
        <ol className="space-y-6">
          {HOW_IT_WORKS.map((s, i) => (
            <li key={s.title} className="surface grid gap-4 p-6 md:grid-cols-[120px_1fr] md:p-8">
              <span className="font-display text-6xl font-semibold leading-none text-gold">
                0{i + 1}
              </span>
              <div>
                <h2 className="text-3xl text-primary">{s.title}</h2>
                <p className="mt-1 text-muted-foreground">{s.text}</p>
                <ul className="mt-4 space-y-2">
                  {(DETAILS[i] ?? []).map((d) => (
                    <li key={d} className="flex gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="bg-secondary/50 py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Stay safe"
            title="Safety tips for members and families"
            text="Most members are genuine, but a little caution goes a long way."
          />
          <ul className="surface space-y-4 p-6">
            {SAFETY.map((t) => (
              <li key={t} className="flex gap-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="container-page mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/register">Register free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/profiles">Browse profiles</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
