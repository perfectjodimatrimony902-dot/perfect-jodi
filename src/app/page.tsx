"use client";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  Check,
  CheckCheck,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  FileCheck,
  Heart,
  HelpCircle,
  Lock,
  MessageCircle,
  MessageSquare,
  Phone,
  PhoneCall,
  Search,
  Share2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { PROFILE_PHOTOS, STORY_PHOTOS } from "@/data/profile-photos";
import { formatDate } from "@/hooks/use-demo";
import { useSession } from "@/hooks/use-demo";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const HOW_IT_WORKS_ICONS = [UserPlus, Search, MessageCircle, Heart];

type MatchTab = "featured" | "brides" | "grooms" | "professionals" | "recent";

export default function HomePage() {
  const { state, profile: myProfile, account } = useSession();
  const myProfileId = myProfile?.id || account?.profileId;
  const myAccountId = account?.id;
  const [activeTab, setActiveTab] = useState<MatchTab>("featured");

  const approved = useMemo(
    () =>
      state.profiles.filter((p) => {
        if (p.status !== "approved") return false;
        if (myProfileId && (p.id === myProfileId || (p as any)._id === myProfileId)) return false;
        if (myAccountId && (p.ownerId === myAccountId || (p as any).userId === myAccountId)) return false;
        if (myProfile?.name && p.name === myProfile.name && p.dob === myProfile.dob) return false;
        return true;
      }),
    [state.profiles, myProfileId, myAccountId, myProfile?.name, myProfile?.dob],
  );

  const featured = useMemo(() => {
    const paid = new Set(state.accounts.filter((a) => a.membership !== "free").map((a) => a.id));
    return approved.filter((p) => p.verified && paid.has(p.ownerId));
  }, [approved, state.accounts]);

  const brides = useMemo(() => approved.filter((p) => p.gender === "female"), [approved]);

  const grooms = useMemo(() => approved.filter((p) => p.gender === "male"), [approved]);

  const professionals = useMemo(
    () =>
      approved.filter((p) =>
        /engineer|doctor|architect|consultant|data scientist|scientist|manager/i.test(
          p.occupation || "",
        ),
      ),
    [approved],
  );

  const recent = useMemo(
    () => [...approved].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [approved],
  );

  // Tabbed profiles map
  const activeProfiles = useMemo(() => {
    switch (activeTab) {
      case "brides":
        return brides.slice(0, 8);
      case "grooms":
        return grooms.slice(0, 8);
      case "professionals":
        return professionals.slice(0, 8);
      case "recent":
        return recent.slice(0, 8);
      case "featured":
      default:
        return (featured.length > 0 ? featured : approved).slice(0, 8);
    }
  }, [activeTab, brides, grooms, professionals, recent, featured, approved]);

  const stories = state.stories.filter((s) => s.published).slice(0, 3);

  return (
    <>
      {/* Hero Showcase Slider */}
      <HeroSlider
        stats={{
          profiles: approved.length,
          verified: approved.filter((p) => p.verified).length,
          cities: new Set(approved.map((p) => p.city)).size,
        }}
      />

      {/* Partner Search Form: Elevated Glassmorphic Card */}
      <section className="relative z-30 -mt-10 sm:-mt-16 container-page mb-12">
        <HeroSearch />
      </section>

      {/* The Perfect Jodi Trust Promise */}
      <section className="border-y border-border/80 bg-gradient-to-b from-card via-secondary/15 to-card py-16 md:py-24 shadow-xs relative overflow-hidden">
        <div className="container-page relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold-foreground border border-gold/30">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              100% Trust & Family Safety
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Built on Dignity, Verified with Care
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every detail is designed to give candidates and their families absolute peace of mind
              through authentic, multi-layered safeguards.
            </p>
          </div>

          {/* Elevated Bento Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bento Card 1: 100% ID & Credential Verification (Span 7) */}
            <div className="lg:col-span-7 group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-emerald-500/5 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 shadow-xs">
                    <BadgeCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                      12-Point Human Verification
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      100% Verified Biodatas with Govt. ID
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                  Zero fake accounts, zero catfishing bots. Every member's government identity,
                  educational degrees, and professional credentials are hand-vetted by our team
                  before their profile goes live.
                </p>

                {/* Simulated UI: Official Verification Pass */}
                <div className="rounded-2xl border border-emerald-500/20 bg-background/90 p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/70">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        PD
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                          Pooja Deshmukh, 27
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.2 text-[10px] font-bold text-emerald-600 border border-emerald-500/30">
                            <Check className="h-2.5 w-2.5" /> ID Verified
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          B.Tech · Senior Software Engineer · Pune
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-gold-foreground bg-gold/15 px-2.5 py-1 rounded-full border border-gold/30">
                      <Award className="h-3 w-3 text-gold" /> Trust Seal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-2 rounded-xl bg-secondary/50 p-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Govt. ID Authentication</p>
                        <p className="text-[10px] text-muted-foreground">
                          Aadhaar / Passport Checked
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-secondary/50 p-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Degree Authenticated</p>
                        <p className="text-[10px] text-muted-foreground">
                          COEP Pune · B.Tech Verified
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-secondary/50 p-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Profession & Income</p>
                        <p className="text-[10px] text-muted-foreground">
                          Infosys Lead · ₹18 - 25 LPA
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-secondary/50 p-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Authentic Portrait</p>
                        <p className="text-[10px] text-muted-foreground">
                          Anti-AI Face Match Passed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Zero Spam Bot Guarantee
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Verified within 24 hours of submission
                </span>
              </div>
            </div>

            {/* Bento Card 2: Vedic Kundali & Cultural Alignment (Span 5) */}
            <div className="lg:col-span-5 group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 border border-gold/30 text-gold shadow-xs">
                    <Sparkles className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-foreground">
                      Sacred Harmony
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      Kundali & Values Match
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                  Honor timeless Vedic traditions alongside modern life choices. Compare horoscopes,
                  gotra lineage, and core lifestyle values seamlessly.
                </p>

                {/* Simulated UI: Kundali Milan Gauge & Values */}
                <div className="rounded-2xl border border-gold/25 bg-background/90 p-4 sm:p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-border/70">
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <Compass className="h-4 w-4 text-gold" /> Ashtakoota Milan
                    </span>
                    <span className="text-xs font-bold text-gold-foreground bg-gold/20 px-2.5 py-0.5 rounded-full border border-gold/30">
                      32 / 36 Gunas (Uttam)
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center text-foreground/80 font-medium">
                      <span>• Manglik Status:</span>
                      <strong className="text-emerald-600 font-bold">Nirdosh / Compatible</strong>
                    </div>
                    <div className="flex justify-between items-center text-foreground/80 font-medium">
                      <span>• Gotra Exogamy:</span>
                      <strong className="text-primary font-bold">Vashishta · Verified</strong>
                    </div>
                    <div className="flex justify-between items-center text-foreground/80 font-medium">
                      <span>• Nadi & Bhakoot:</span>
                      <strong className="text-emerald-600 font-bold">Auspicious Harmony ✓</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground border border-border/60">
                      🌱 Pure Vegetarian
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground border border-border/60">
                      🚭 Non-Smoker
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground border border-border/60">
                      🏡 Joint Family Values
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-foreground border border-gold/25">
                  <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                  Deep Astrological & Cultural Alignment
                </span>
              </div>
            </div>

            {/* Bento Card 3: Parda & Strict Contact Shield (Span 6) */}
            <div className="lg:col-span-6 group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-rose-500/5 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 shadow-xs">
                    <Lock className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                      Complete Privacy Protection
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      Parda & Stricter Contact Shield
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                  Your phone number, photos, and personal details remain completely concealed until
                  both families mutually accept an interest. No unsolicited calls, zero public
                  exposure.
                </p>

                {/* Simulated UI: Privacy Controls Panel */}
                <div className="rounded-2xl border border-rose-500/20 bg-background/90 p-4 sm:p-5 shadow-xs space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/40">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-rose-600" />
                      <div>
                        <p className="font-semibold text-foreground text-[11px]">
                          Photo Privacy Shield
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Blurred until mutual consent
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      Protected
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/40">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-rose-600" />
                      <div>
                        <p className="font-semibold text-foreground text-[11px]">
                          Phone & WhatsApp Access
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Revealed only upon mutual acceptance
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Consent Only
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/40">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-rose-600" />
                      <div>
                        <p className="font-semibold text-foreground text-[11px]">
                          Screenshot Guard
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Bank-grade data leakage prevention
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400 border border-rose-500/25">
                  <Lock className="h-3.5 w-3.5 text-rose-600" />
                  100% Confidential & Discretion Guaranteed
                </span>
              </div>
            </div>

            {/* Bento Card 4: Family Circle™ Collaborative Search (Span 6) */}
            <div className="lg:col-span-6 group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 shadow-xs">
                    <Users className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Indian Family Tradition
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      Family Circle™ Co-Search
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                  Marriage in India unites two families. Parents, siblings, and candidates can view
                  verified biodatas together, share joint shortlists, and write private notes in
                  complete harmony.
                </p>

                {/* Simulated UI: Family Collaboration Hub */}
                <div className="rounded-2xl border border-amber-500/25 bg-background/90 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="h-7 w-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary">
                          A
                        </div>
                        <div className="h-7 w-7 rounded-full bg-gold/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-gold-foreground">
                          M
                        </div>
                        <div className="h-7 w-7 rounded-full bg-emerald-500/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-emerald-700">
                          F
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-foreground">
                        Sharma Family Co-Pilot
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
                      3 Members Active
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-start gap-2 text-foreground/85">
                      <span className="font-bold text-primary">Mother:</span>
                      <p className="text-muted-foreground">
                        “Shortlisted 3 prospective matches from Pune with joint family background.”
                      </p>
                    </div>
                    <div className="flex items-start gap-2 text-foreground/85">
                      <span className="font-bold text-emerald-600">Father:</span>
                      <p className="text-muted-foreground">
                        “Spoke with her family elders. Very cultured and respectable.”
                      </p>
                    </div>
                    <div className="flex items-start gap-2 text-foreground/85">
                      <span className="font-bold text-gold-foreground">Candidate:</span>
                      <p className="text-foreground font-medium">
                        “Reviewed biodata & sent interest! ✓”
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/25">
                  <Share2 className="h-3.5 w-3.5 text-amber-600" />
                  Instant Family WhatsApp Sharing
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Parents & children search as one
                </span>
              </div>
            </div>
          </div>

          {/* Metric Bar Below Cards */}
          <div className="mt-12 rounded-3xl border border-gold/30 bg-card p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border/70">
              <div className="pt-2 md:pt-0">
                <span className="text-3xl sm:text-4xl font-bold text-primary">100%</span>
                <p className="mt-1 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Manual ID Screening
                </p>
              </div>
              <div className="pt-4 md:pt-0">
                <span className="text-3xl sm:text-4xl font-bold text-primary">50,000+</span>
                <p className="mt-1 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Cultured Indian Families
                </p>
              </div>
              <div className="pt-4 md:pt-0">
                <span className="text-3xl sm:text-4xl font-bold text-primary">4.9 / 5</span>
                <p className="mt-1 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Safety & Trust Score
                </p>
              </div>
              <div className="pt-4 md:pt-0">
                <span className="text-3xl sm:text-4xl font-bold text-primary">Zero</span>
                <p className="mt-1 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Spam Bot Guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Match Explorer: Tabs + Rich Cards */}
      <section className="container-page py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div>
            <SectionHeading
              eyebrow="Curated For You"
              title="Explore Compatible Matches"
              text="Handpicked verified brides and grooms seeking sacred lifelong companionship."
            />
          </div>

          <Button
            asChild
            variant="outline"
            className="border-gold/40 hover:bg-gold/10 text-primary font-semibold self-start md:self-auto rounded-xl shadow-2xs cursor-pointer"
          >
            <Link to="/profiles">
              View All {approved.length} Profiles <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* Interactive Match Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {[
            {
              id: "featured",
              label: "🌟 Featured Matches",
              count: featured.length || approved.length,
            },
            { id: "brides", label: "👰 Verified Brides", count: brides.length },
            { id: "grooms", label: "🤵 Eligible Grooms", count: grooms.length },
            { id: "professionals", label: "💼 Doctors & Tech", count: professionals.length },
            { id: "recent", label: "✨ Recently Joined", count: recent.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as MatchTab)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-2xs",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-102"
                  : "bg-card text-foreground/80 hover:text-foreground hover:bg-secondary/70 border border-border/70",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.2 text-[10px] font-bold",
                  activeTab === tab.id
                    ? "bg-gold text-gold-foreground"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activeProfiles.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>

        {/* Bottom CTA to browse all */}
        <div className="mt-12 text-center">
          <Button
            asChild
            variant="gold"
            size="xl"
            className="rounded-2xl shadow-lg shadow-gold/20 font-semibold cursor-pointer px-8"
          >
            <Link to="/profiles">
              Discover All Matches Matching Your Preferences <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How It Works: Visual Connected Milestone Stepper */}
      <section className="bg-gradient-to-b from-secondary/40 via-secondary/60 to-secondary/30 py-16 md:py-24 border-y border-border/70 relative overflow-hidden">
        <div className="container-page relative z-10">
          <SectionHeading
            center
            eyebrow="Simple, Respectful & Dignified"
            title="How Perfect Jodi Works"
            text="Four calm, thoughtful steps designed to make finding your soulmate effortless, transparent, and joyous."
          />

          {/* Desktop Visual Milestone Connector Track */}
          <div className="hidden lg:flex items-center justify-between max-w-4xl mx-auto mt-12 mb-4 px-6 relative">
            <div className="absolute top-1/2 left-10 right-10 -translate-y-1/2 h-0.5 bg-gradient-to-r from-gold/30 via-primary/40 to-gold/30 pointer-events-none" />
            {[
              { num: "01", label: "Biodata Setup" },
              { num: "02", label: "Precise Criteria" },
              { num: "03", label: "Mutual Connect" },
              { num: "04", label: "Sacred Vivah" },
            ].map((step, idx) => (
              <div key={step.num} className="relative z-10 flex flex-col items-center group">
                <div className="h-10 w-10 rounded-full bg-card border-2 border-gold flex items-center justify-center font-bold text-sm text-primary shadow-md group-hover:scale-110 transition-transform">
                  {step.num}
                </div>
                <span className="mt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
            {/* Step 1: Create Free Profile */}
            <div className="group relative rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-colors group-hover:bg-gold/20 group-hover:text-gold-foreground">
                    <UserPlus className="h-6 w-6 text-primary group-hover:text-gold transition-colors" />
                  </div>
                  <span className="text-4xl font-bold text-gold/60 group-hover:text-gold transition-colors">
                    01
                  </span>
                </div>

                {/* Visual Step UI Mockup with Real Photo */}
                <div className="mb-5 rounded-2xl border border-primary/15 bg-background/90 p-3.5 text-xs shadow-2xs">
                  <div className="flex items-center gap-3 mb-2.5 pb-2 border-b border-border/70">
                    <img
                      src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=150&q=80"
                      alt="Candidate Portrait"
                      className="h-11 w-11 rounded-full object-cover border border-gold/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate text-xs flex items-center gap-1">
                        Ananya Sharma, 28
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        Software Engineer · Pune
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      ✓ Free Forever
                    </span>
                    <span className="text-muted-foreground font-medium">Takes 2 Mins</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  1. Create Free Biodata
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Share your career, family background, lifestyle habits, and what you seek in a
                  life partner with our quick guided biodata assistant.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-gold">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Step 01 of 04
                </span>
                <span className="text-[10px] bg-secondary px-2.5 py-0.5 rounded-full text-foreground/75 font-medium">
                  100% Free
                </span>
              </div>
            </div>

            {/* Step 2: Define Precision Criteria */}
            <div className="group relative rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-colors group-hover:bg-gold/20 group-hover:text-gold-foreground">
                    <SlidersHorizontal className="h-6 w-6 text-primary group-hover:text-gold transition-colors" />
                  </div>
                  <span className="text-4xl font-bold text-gold/60 group-hover:text-gold transition-colors">
                    02
                  </span>
                </div>

                {/* Visual Step UI Mockup with Filter Chips */}
                <div className="mb-5 rounded-2xl border border-gold/20 bg-background/90 p-3.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/70">
                    <span className="text-[10px] uppercase font-bold text-gold-foreground">
                      Precision Filters
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      25+ Match Criteria
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className="rounded-md bg-secondary px-2 py-0.5 font-medium border border-border/60">
                      📍 Pune / Mumbai
                    </span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 font-medium border border-border/60">
                      🎓 Engineers & MBAs
                    </span>
                    <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 font-bold border border-primary/20">
                      🕉️ Deshastha Brahmin
                    </span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 font-medium border border-border/60">
                      🌱 Pure Veg
                    </span>
                    <span className="rounded-md bg-gold/15 text-gold-foreground px-2 py-0.5 font-bold border border-gold/30">
                      🪐 30+ Gunas
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  2. Define Criteria
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Filter specifically by community, gotra, mother tongue, native place, career, and
                  horoscope compatibility with total accuracy.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-gold">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Step 02 of 04
                </span>
                <span className="text-[10px] bg-secondary px-2.5 py-0.5 rounded-full text-foreground/75 font-medium">
                  Smart Match
                </span>
              </div>
            </div>

            {/* Step 3: Respectful Mutual Connect */}
            <div className="group relative rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-colors group-hover:bg-gold/20 group-hover:text-gold-foreground">
                    <MessageCircle className="h-6 w-6 text-primary group-hover:text-gold transition-colors" />
                  </div>
                  <span className="text-4xl font-bold text-gold/60 group-hover:text-gold transition-colors">
                    03
                  </span>
                </div>

                {/* Visual Step UI Mockup with Mutual Request */}
                <div className="mb-5 rounded-2xl border border-rose-500/20 bg-background/90 p-3.5 text-xs shadow-2xs">
                  <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-border/70">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                      alt="Groom Candidate"
                      className="h-9 w-9 rounded-full object-cover border border-rose-500/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-[11px] truncate">
                        Rohan Verma, 29
                      </p>
                      <p className="text-[9px] text-rose-600 font-semibold flex items-center gap-1">
                        <Heart className="h-2.5 w-2.5 fill-rose-500 text-rose-500" /> Expressed
                        Interest
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 text-[10px]">
                    <span className="flex-1 text-center py-1 rounded bg-primary text-primary-foreground font-bold">
                      Accept
                    </span>
                    <span className="flex-1 text-center py-1 rounded bg-secondary text-muted-foreground font-medium border border-border/70">
                      Decline
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  3. Mutual Connect
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Express interest with one touch. No unsolicited cold calls, zero awkwardness.
                  Phone and chat unlock only when both families agree.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-gold">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Step 03 of 04
                </span>
                <span className="text-[10px] bg-secondary px-2.5 py-0.5 rounded-full text-foreground/75 font-medium">
                  Mutual Consent
                </span>
              </div>
            </div>

            {/* Step 4: Family Connect & Sacred Vivah */}
            <div className="group relative rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-colors group-hover:bg-gold/20 group-hover:text-gold-foreground">
                    <Heart className="h-6 w-6 text-primary group-hover:text-gold transition-colors" />
                  </div>
                  <span className="text-4xl font-bold text-gold/60 group-hover:text-gold transition-colors">
                    04
                  </span>
                </div>

                {/* Visual Step UI Mockup with Unlocked Contact & Wedding */}
                <div className="mb-5 rounded-2xl border border-gold/30 bg-background/90 p-3.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/70">
                    <span className="font-semibold text-gold-foreground text-[11px] flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-gold" /> Shubh Vivah
                    </span>
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Forever ❤️
                    </span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center justify-between text-emerald-600 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                      <span>Direct Contact Unlocked</span>
                      <span>+91 98765 *****</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground pt-0.5 text-center">
                      Family meetings blessed by elders
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  4. Sacred Union
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Arrange in-person family meetings, seek elders' blessings, and celebrate your
                  auspicious union with everlasting joy.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-gold">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Step 04 of 04
                </span>
                <span className="text-[10px] bg-gold/15 text-gold-foreground px-2.5 py-0.5 rounded-full font-bold">
                  Forever
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Dual Action Banner */}
          <div className="mt-14 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3">
              <Button
                asChild
                variant="gold"
                size="xl"
                className="rounded-2xl shadow-lg shadow-gold/25 font-semibold cursor-pointer px-8"
              >
                <Link to="/register">
                  Create Your Free Profile Today <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="xl"
                className="rounded-2xl border-primary/40 text-primary hover:bg-primary/5 font-semibold cursor-pointer px-8"
              >
                <Link to="/profiles">Browse Matches First</Link>
              </Button>
            </div>
            <p className="mt-3.5 text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-1 font-medium">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Free forever to join
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 100% Verified Profiles
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-medium">
                <Lock className="h-3.5 w-3.5 text-gold" /> Total Photo & Contact Privacy
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Success Stories: Real Couples with Authentic Photos */}
      <section className="container-page py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Happily Married"
            title="Real Stories of Lasting Love"
            text="Inspiring journeys of couples who found their forever partner through sacred family connections."
          />
          <Button
            asChild
            variant="outline"
            className="border-gold/40 hover:bg-gold/10 text-primary font-semibold rounded-xl"
          >
            <Link to="/success-stories">
              Read All Stories <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {stories.map((s) => (
            <article
              key={s.id}
              className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
            >
              {/* Couple Wedding Portrait */}
              <div className="relative h-56 w-full overflow-hidden bg-stone-900">
                <img
                  src={s.photoUrl || STORY_PHOTOS[s.id] || STORY_PHOTOS.s1}
                  alt={`Wedding photo of ${s.couple}`}
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <h3 className="text-xl font-bold tracking-tight text-white drop-shadow">
                    {s.couple}
                  </h3>
                  <span className="text-xs text-white/85 font-medium drop-shadow">{s.city}</span>
                </div>
              </div>

              <div className="p-6 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2 font-medium">
                      Married {formatDate(s.marriedOn)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-gold/50 pl-3">
                    “{s.story}”
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-border/50 text-xs font-semibold text-gold flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 fill-gold text-gold" />
                  <span>Blessed Matrimonial Match</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Membership Plans */}
      <section className="bg-gradient-to-b from-secondary/30 via-secondary/60 to-secondary/30 py-16 md:py-24 border-y border-border/70">
        <div className="container-page">
          <SectionHeading
            center
            eyebrow="Transparent & Fair"
            title="Membership Plans for Every Family"
            text="Start completely free. Upgrade anytime to connect directly with verified phone numbers and dedicated assistance."
          />
          <div className="mt-12">
            <PlanCards compact />
          </div>
          <div className="mt-8 text-center">
            <Button
              asChild
              variant="outline"
              className="border-gold/50 hover:bg-gold/10 rounded-xl font-semibold"
            >
              <Link to="/membership">Compare All Plan Features & Validity</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What Families & Couples Say */}
      <section className="py-16 md:py-24 relative overflow-hidden">
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

      {/* FAQ & Family Matchmaking Advisor Helpline */}
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.9fr] items-start">
          {/* Left Column: Heading + Advisory Helpline Card */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold tracking-wider text-gold uppercase mb-3">
                <HelpCircle className="h-3.5 w-3.5 text-gold" />
                <span>Support & Guidance</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
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
              <h3 className="mt-2 text-xl font-semibold text-white">
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
                  className="font-semibold shadow-md cursor-pointer flex items-center gap-2 rounded-xl"
                >
                  <a href="tel:+919876543210">
                    <PhoneCall className="h-4 w-4" />
                    +91 98765 43210
                  </a>
                </Button>
                <Button
                  asChild
                  variant="hero-outline"
                  className="border-white/30 text-white hover:bg-white/10 cursor-pointer flex items-center gap-2 rounded-xl"
                >
                  <Link to="/contact">
                    <MessageSquare className="h-4 w-4" />
                    Send an Enquiry
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Accordion Items */}
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
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
              className="shadow-lg shadow-gold/25 font-semibold cursor-pointer rounded-2xl"
            >
              <Link to="/register">Create a Free Profile</Link>
            </Button>
            <Button
              asChild
              variant="hero-outline"
              size="xl"
              className="border-white/40 text-white hover:bg-white/10 cursor-pointer rounded-2xl"
            >
              <Link to="/profiles">Browse Matches</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
