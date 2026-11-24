"use client";

import { Link } from "@/lib/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoState } from "@/lib/store";

const STEPS = [
  {
    num: "01",
    icon: UserPlus,
    title: "Register for Free",
    description:
      "Create an account for yourself, your son, daughter, or sibling in under two minutes with secure mobile verification.",
    points: [
      "Select profile ownership — self, parent, or sibling.",
      "Quick mobile OTP verification ensures verified authenticity.",
      "100% free account creation with zero spam calls.",
    ],
    tag: "2 Mins Setup",
  },
  {
    num: "02",
    icon: ShieldCheck,
    title: "Build Your Biodata",
    description:
      "Share your education, career achievements, family background, lifestyle values, and partner preferences.",
    points: [
      "Structured sections for personal, education, career, and family background.",
      "Discreet photo privacy: keep photos public or reveal upon mutual interest.",
      "Every profile is manually reviewed by our team before appearing in search.",
    ],
    tag: "Hand-Screened",
  },
  {
    num: "03",
    icon: Search,
    title: "Discover Compatible Matches",
    description:
      "Search with detailed community filters or review curated matches based on your family's preferences.",
    points: [
      "Filter by religion, community, mother tongue, city, education, and diet.",
      "See compatibility estimates based on your stated partner preferences.",
      "Shortlist favorite profiles to review together with your family.",
    ],
    tag: "Smart Filters",
  },
  {
    num: "04",
    icon: Heart,
    title: "Connect with Families",
    description:
      "Express interest with one click, exchange messages securely, and take the conversation forward with confidence.",
    points: [
      "Consent-first model: contact details are never exposed to strangers.",
      "Once mutual interest is accepted, message directly on the platform.",
      "Arrange dignified family phone calls or meetings at your own pace.",
    ],
    tag: "Consent-First",
  },
];

const SAFETY_TIPS = [
  {
    icon: ShieldCheck,
    title: "100% Manually Screened",
    text: "Every profile and photo is reviewed by our verification team before appearing in search.",
  },
  {
    icon: Lock,
    title: "Strict Contact Privacy",
    text: "Phone numbers and emails are never visible on public profiles. Shared only when both families agree.",
  },
  {
    icon: Users,
    title: "Family-First Search",
    text: "Parents, siblings, and individuals can search together and shortlist prospective matches collaboratively.",
  },
  {
    icon: Eye,
    title: "Safe First Meetings",
    text: "Always meet prospective matches for the first time in a comfortable public place, ideally with family.",
  },
];

export default function HowItWorksPage() {
  const { settings } = useDemoState();

  return (
    <div className="min-h-screen bg-background">
      {/* Clean, Dignified Page Header */}
      <section className="border-b border-border/80 bg-gradient-to-b from-secondary/50 via-secondary/25 to-background py-10 sm:py-14">
        <div className="container-page">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">How It Works</span>
          </nav>

          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span>Simple, Dignified & Safe Matrimony</span>
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            How {settings.siteName} Works
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Four calm, thoughtful steps designed to make finding your life partner effortless,
            transparent, and respected by both candidate and family.
          </p>
        </div>
      </section>

      {/* 4-Step Cards: Clean, Balanced 2x2 Grid */}
      <section className="container-page py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs hover:border-gold/60 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-3xl font-bold text-gold">{step.num}</span>
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  <ul className="mt-5 space-y-2.5 text-sm text-foreground/85">
                    {step.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Step {step.num} of 04</span>
                  <span className="text-primary font-bold">{step.tag}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Safety & Family-First Guarantee */}
      <section className="border-y border-border/80 bg-secondary/30 py-12 sm:py-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Trust & Family Safety
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Built on Dignity, Protected with Care
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Every interaction on {settings.siteName} is designed with safety, consent, and family
              peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SAFETY_TIPS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs hover:border-gold/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mb-3.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Call To Action */}
      <section className="container-page py-14 sm:py-18">
        <div className="rounded-3xl border border-gold/40 bg-card p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-xs font-semibold text-gold-foreground mb-4">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>जहाँ रिश्ते बनें खास · A Journey Towards Forever ❤️</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Ready to Find Your Life Partner?
            </h2>

            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Join verified brides, grooms, and families discovering meaningful connections with
              trust and respect.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3.5">
              <Button
                asChild
                variant="gold"
                size="xl"
                className="font-bold shadow-md cursor-pointer"
              >
                <Link to="/register">
                  Register Free <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="font-semibold cursor-pointer">
                <Link to="/profiles">Browse Profiles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
