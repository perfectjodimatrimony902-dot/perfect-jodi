"use client";

import { Link } from "@/lib/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
const slidePalace = "/slides/slide-palace.jpg";
const slideMandap = "/slides/slide-mandap.jpg";
const slideFamilies = "/slides/slide-families.jpg";
const slideHands = "/slides/slide-hands.jpg";

interface HeroSliderProps {
  stats: {
    profiles: number;
    verified: number;
    cities: number;
  };
}

const SLIDES = [
  {
    id: "palace",
    image: slidePalace,
    alt: "Bride and groom in elegant royal wedding attire in a palace courtyard",
    eyebrow: "Trusted Indian Matrimony",
    title: "Find Your Perfect",
    highlight: "Life Partner",
    description:
      "Discover meaningful connections and begin your journey towards a beautiful, blessed future.",
  },
  {
    id: "mandap",
    image: slideMandap,
    alt: "Sacred Indian wedding ceremony under a floral mandap",
    eyebrow: "Sacred Vows & Eternal Love",
    title: "Where Two Souls",
    highlight: "Unite in Harmony",
    description:
      "Connecting verified brides, grooms, and families with shared traditions, values, and trust.",
  },
  {
    id: "families",
    image: slideFamilies,
    alt: "Loving Indian family joyfully celebrating Haldi ceremony",
    eyebrow: "Made For Indian Families",
    title: "Marriages That Bring",
    highlight: "Families Closer",
    description:
      "Parents and siblings can create, manage, and discover suitable prospective life partners with confidence.",
  },
  {
    id: "hands",
    image: slideHands,
    alt: "Ring exchange ceremony with bridal mehndi and red chooda bangles",
    eyebrow: "A Sacred Vow of a Lifetime",
    title: "Step Into a Lifetime of",
    highlight: "Happiness Together",
    description:
      "Privacy-first matching with hand-verified profiles, mutual interests, and trusted connections.",
  },
];

export function HeroSlider({ stats }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Continuous automatic sliding (does not stop or pause)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeSlide = SLIDES[current] ?? SLIDES[0]!;

  return (
    <section
      className="relative h-[620px] sm:h-[660px] md:h-[680px] lg:h-[720px] w-full overflow-hidden bg-stone-950 text-white"
      aria-label="Matrimony Hero Showcase"
    >
      {/* Continuous Sliding Background Track */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {SLIDES.map((slide) => (
            <div key={slide.id} className="relative h-full w-full shrink-0">
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* Gradient Scrims: Darkened on the left for text contrast, open on the right for wedding imagery */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-stone-950/95 via-stone-950/75 to-transparent lg:to-stone-950/30" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Main Foreground Content - Text on Left Side with locked height to prevent layout shift */}
      <div className="container-page relative z-20 flex h-full flex-col justify-center pt-8 pb-20 sm:pt-10 sm:pb-24">
        <div className="max-w-2xl lg:max-w-3xl">
          {/* Eyebrow badge with glowing sparkle & Hindi tagline */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-gold backdrop-blur-sm w-fit shadow-md">
            <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse shrink-0" />
            <span className="font-semibold text-gold">जहाँ रिश्ते बनें खास</span>
            <span className="text-white/40">✦</span>
            <span className="text-white/90">A Journey Towards Forever ❤️</span>
          </div>

          {/* Dynamic Headline & Description with reserved min-height and smooth fade */}
          <div key={activeSlide.id} className="animate-in fade-in duration-500">
            <h1 className="mt-4 text-[30px] leading-[1.12] sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[56px] font-bold tracking-tight text-white min-h-[76px] sm:min-h-[96px] md:min-h-[116px] lg:min-h-[128px] flex flex-col justify-center">
              <span className="block">{activeSlide.title}</span>
              <span className="block text-gold drop-shadow-md">{activeSlide.highlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 max-w-xl text-sm sm:text-base md:text-lg text-white/80 leading-relaxed min-h-[44px] sm:min-h-[54px] flex items-center">
              {activeSlide.description}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              variant="gold"
              size="xl"
              className="shadow-lg shadow-gold/20 font-semibold cursor-pointer"
            >
              <Link to="/register">
                Register Free <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="hero-outline"
              size="xl"
              className="backdrop-blur-sm border-white/30 text-white hover:bg-white/10 hover:border-white/50 cursor-pointer"
            >
              <Link to="/profiles">Explore Matches</Link>
            </Button>
          </div>

          {/* Quick Gender Links */}
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
            <span>Looking to join?</span>
            <Link
              to="/register"
              search={{ gender: "female" }}
              className="font-medium text-gold underline-offset-4 hover:underline transition-colors"
            >
              Register as Bride
            </Link>
            <span className="text-white/40">·</span>
            <Link
              to="/register"
              search={{ gender: "male" }}
              className="font-medium text-gold underline-offset-4 hover:underline transition-colors"
            >
              Register as Groom
            </Link>
          </div>

          {/* Trust Metrics */}
          <dl className="mt-6 sm:mt-8 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-5 sm:pt-6 text-white">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-white/60">
                Profiles
              </dt>
              <dd className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
                {stats.profiles}+
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-white/60">
                Verified
              </dt>
              <dd className="text-2xl sm:text-3xl font-bold text-gold mt-0.5">{stats.verified}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-white/60">Cities</dt>
              <dd className="text-2xl sm:text-3xl font-bold text-white mt-0.5">{stats.cities}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Slider Controls (Arrow Buttons & Dots) - Absolute positioned to maintain exact same position */}
      <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-30 container-page flex items-center justify-between pointer-events-none">
        {/* Navigation Dots */}
        <div
          className="flex items-center gap-2 pointer-events-auto"
          role="tablist"
          aria-label="Slider Pagination"
        >
          {SLIDES.map((slide, index) => {
            const isActive = index === current;
            return (
              <button
                key={slide.id}
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${index + 1}: ${slide.eyebrow}`}
                onClick={() => setCurrent(index)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-8 bg-gold shadow-md shadow-gold/50"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            );
          })}
          <span className="ml-3 text-xs font-medium tracking-widest text-white/60">
            0{current + 1} / 0{SLIDES.length}
          </span>
        </div>

        {/* Arrow Navigation */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous image slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-stone-900/60 text-white backdrop-blur-md transition-all hover:border-gold hover:bg-gold hover:text-stone-950 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next image slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-stone-900/60 text-white backdrop-blur-md transition-all hover:border-gold hover:bg-gold hover:text-stone-950 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
