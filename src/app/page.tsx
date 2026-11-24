"use client";

import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Heart,
  HelpCircle,
  Lock,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  Search,
  Sparkles,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeroSlider } from "@/components/home/HeroSlider";
import { HeroSearch } from "@/components/home/HeroSearch";
import { TestimonialSlider } from "@/components/home/TestimonialSlider";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { PlanCards } from "@/components/site/PlanCards";
import { SectionHeading } from "@/components/site/PageHero";
import { FAQS, HOW_IT_WORKS } from "@/data/content";
import { formatDate } from "@/hooks/use-demo";
import { useSession } from "@/hooks/use-demo";
import { Link } from "@/lib/navigation";

const HOW_IT_WORKS_ICONS = [UserPlus, Search, MessageCircle, Heart];

export default function HomePage() {
  const { state, profile: myProfile, account } = useSession();
  const myProfileId = myProfile?.id || account?.profileId;
  const myAccountId = account?.id;

  const approved = useMemo(
    () =>
      state.profiles.filter((p) => {
        if (p.status !== "approved") return false;
        if (myProfileId && p.id === myProfileId) return false;
        if (myAccountId && p.ownerId === myAccountId) return false;
        return true;
      }),
    [state.profiles, myProfileId, myAccountId],
  );
  const featured = useMemo(() => {
    const paid = new Set(state.accounts.filter((a) => a.membership !== "free").map((a) => a.id));
    return approved.filter((p) => p.verified && paid.has(p.ownerId)).slice(0, 4);
  }, [approved, state.accounts]);
  const recent = useMemo(
    () => [...approved].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
    [approved],
  );
  const stories = state.stories.filter((s) => s.published).slice(0, 3);

  return (
    <>
      {/* Hero Slider */}
      <HeroSlider
        stats={{
          profiles: approved.length,
          verified: approved.filter((p) => p.verified).length,
          cities: new Set(approved.map((p) => p.city)).size,
        }}
      />

      {/* Partner Search Form (Elevated Card Below Slider) */}
      <section className="relative z-30 -mt-10 sm:-mt-16 container-page mb-10">
        <HeroSearch />
      </section>

      {/* Trust Strip: Royal Trust Features */}
      <section className="border-y border-border/80 bg-gradient-to-b from-card to-secondary/30 py-10 shadow-xs">
        <div className="container-page grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: BadgeCheck,
              title: "100% Manually Verified Profiles",
              text: "Every profile undergoes multi-point ID and photo verification before going live.",
              badge: "Verified Trust",
            },
            {
              icon: Lock,
              title: "Complete Privacy & Discretion",
              text: "Your contact details and sensitive information are only shared with mutual consent.",
              badge: "Safe & Private",
            },
            {
              icon: Users,
              title: "Designed For Indian Families",
              text: "Parents, siblings, and individuals can collaborate and discover aligned partners with ease.",
              badge: "Family Centric",
            },
          ].map(({ icon: Icon, title, text, badge }) => (
            <div
              key={title}
              className="group relative flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:border-gold/50 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30 shadow-xs transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-6 w-6 text-gold" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground text-base tracking-tight">{title}</p>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{text}</p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold text-gold-foreground border border-gold/25">
                  <Sparkles className="h-2.5 w-2.5 text-gold" />
                  {badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Profiles */}
      <section className="container-page py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Curated For You"
            title="Featured Matches"
            text="Handpicked verified members with active premium visibility."
          />
          <Button
            asChild
            variant="outline"
            className="border-gold/40 hover:bg-gold/10 text-primary"
          >
            <Link to="/profiles">
              View All Profiles <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      </section>

      {/* Recently Joined */}
      <section className="bg-gradient-to-b from-secondary/40 via-secondary/60 to-secondary/30 py-16 md:py-24 border-y border-border/60">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Fresh Profiles"
              title="Recently Approved Members"
              text="New brides and grooms whose accounts were verified by our team this week."
            />
            <Button asChild variant="link" className="text-primary font-semibold">
              <Link to="/profiles">
                Explore recent <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works: Interactive Step Cards */}
      <section className="container-page py-16 md:py-24">
        <SectionHeading
          center
          eyebrow="Simple & Dignified"
          title="How Perfect Jodi Works"
          text="Four calm, thoughtful steps from creating your profile to joyous family meetings."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
          {HOW_IT_WORKS.map((s, i) => {
            const Icon = HOW_IT_WORKS_ICONS[i] ?? Sparkles;
            return (
              <div
                key={s.title}
                className="group relative rounded-3xl border border-border/80 bg-gradient-to-b from-card to-card/90 p-7 shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-colors group-hover:bg-gold/20 group-hover:text-gold-foreground">
                    <Icon className="h-6 w-6 text-primary group-hover:text-gold transition-colors" />
                  </div>
                  <span className="font-display text-4xl font-bold text-gold/60 group-hover:text-gold transition-colors">
                    0{i + 1}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {s.text}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-1.5 text-xs font-semibold text-gold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Step 0{i + 1} of 04</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <Button asChild variant="gold" size="xl" className="shadow-md shadow-gold/20">
            <Link to="/register">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Success Stories */}
      <section className="bg-primary-soft/60 py-16 md:py-24 border-y border-border/70">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Happily Married"
              title="Real Stories of Lasting Love"
              text="Inspiring journeys of couples who found their forever partner on Perfect Jodi."
            />
            <Button asChild variant="link" className="px-0 text-primary font-semibold">
              <Link to="/success-stories">
                Read all stories <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {stories.map((s) => (
              <article
                key={s.id}
                className="group relative rounded-3xl border border-border/80 bg-card p-7 shadow-sm transition-all duration-300 hover:border-gold/50 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                      <Heart className="h-5 w-5 fill-primary text-primary" />
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-primary">{s.couple}</h3>
                  <p className="mt-1 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <span>{s.city}</span>
                    <span>·</span>
                    <span>Married {formatDate(s.marriedOn)}</span>
                  </p>
                  <p className="mt-4 text-sm text-foreground/80 leading-relaxed italic border-l-2 border-gold/50 pl-3">
                    “{s.story}”
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-semibold text-gold">
                  ✦ Blessed Matrimonial Match
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="container-page py-16 md:py-24">
        <SectionHeading
          center
          eyebrow="Transparent & Fair"
          title="Membership Plans for Every Family"
          text="Start completely free. Upgrade anytime to connect directly with phone numbers and priority matches."
        />
        <div className="mt-12">
          <PlanCards compact />
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="border-gold/50 hover:bg-gold/10">
            <Link to="/membership">Compare All Plan Features & Validity</Link>
          </Button>
        </div>
      </section>

      {/* Attractive Testimonials Section */}
      <section className="bg-gradient-to-b from-secondary/30 via-secondary/70 to-secondary/40 py-16 md:py-24 border-y border-border/70 relative overflow-hidden">
        <div className="container-page relative z-10">
          <SectionHeading
            center
            eyebrow="Heartfelt Experiences"
            title="What Families & Couples Say"
            text="Read how parents, siblings, and brides & grooms experienced trustworthy matchmaking."
          />
          <div className="mt-12">
            <TestimonialSlider />
          </div>
        </div>
      </section>

      {/* Attractive FAQ Section */}
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.9fr] items-start">
          {/* Left Column: Heading + Matchmaking Help Card */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold tracking-wider text-gold uppercase mb-3">
                <HelpCircle className="h-3.5 w-3.5 text-gold" />
                <span>Support & Guidance</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-primary">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Clear, transparent answers about privacy, profile verification, membership, and how
                our matchmaking works.
              </p>
            </div>

            {/* Matchmaking Advisory Helpline Card */}
            <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-primary/95 via-primary to-stone-900 p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-gold/10 blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                <Sparkles className="h-4 w-4" />
                <span>Need Personalized Guidance?</span>
              </div>
              <h3 className="mt-2 text-xl font-display font-semibold text-white">
                Talk to our Family Matchmaking Advisor
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed">
                Our counselors assist parents and candidates in understanding partner preferences
                and verifying matches.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  variant="gold"
                  className="font-semibold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <a href="tel:+919876543210">
                    <PhoneCall className="h-4 w-4" />
                    +91 98765 43210
                  </a>
                </Button>
                <Button
                  asChild
                  variant="hero-outline"
                  className="border-white/30 text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
                >
                  <Link to="/contact">
                    <MessageSquare className="h-4 w-4" />
                    Send an Enquiry
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Accordion Pill Items */}
          <Accordion type="single" collapsible className="space-y-3.5">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`f${i}`}
                className="rounded-2xl border border-border/80 bg-card px-6 py-1 shadow-xs transition-all duration-200 hover:border-gold/50 hover:shadow-md data-[state=open]:border-gold data-[state=open]:bg-secondary/20"
              >
                <AccordionTrigger className="text-left text-base font-medium py-4 hover:no-underline text-foreground cursor-pointer group">
                  <span className="group-hover:text-primary transition-colors flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-gold">
                      Q{i + 1}
                    </span>
                    <span>{f.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 pt-1 text-sm leading-relaxed border-t border-border/40 mt-1 pl-9">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Royal Bottom Call to Action */}
      <section className="container-page pb-16">
        <div className="hero-panel relative flex flex-col items-start justify-between gap-8 rounded-3xl p-8 sm:p-12 md:flex-row md:items-center overflow-hidden shadow-2xl border border-gold/30">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3.5 py-1 text-xs font-semibold tracking-wider text-gold uppercase mb-3">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>A Journey Towards Forever ❤️</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-white">
              जहाँ रिश्ते बनें खास
            </h2>
            <p className="mt-3 text-base text-primary-foreground/85 leading-relaxed">
              Your journey towards a blessed, harmonious future begins on Perfect Jodi. Create your
              free, verified profile today in less than two minutes.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              variant="gold"
              size="xl"
              className="shadow-lg shadow-gold/25 font-semibold cursor-pointer"
            >
              <Link to="/register">Create a Free Profile</Link>
            </Button>
            <Button
              asChild
              variant="hero-outline"
              size="xl"
              className="border-white/40 text-white hover:bg-white/10 cursor-pointer"
            >
              <Link to="/profiles">Browse Matches</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
