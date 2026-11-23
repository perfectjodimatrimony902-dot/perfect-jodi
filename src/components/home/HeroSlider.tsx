"use client";

import { Link } from "@/lib/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import slidePalace from "@/assets/slide-palace.jpg";
import slideMandap from "@/assets/slide-mandap.jpg";
import slideFamilies from "@/assets/slide-families.jpg";
import slideHands from "@/assets/slide-hands.jpg";

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
      className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] w-full overflow-hidden bg-stone-950 text-white"
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
                src={typeof slide.image === "string" ? slide.image : slide.image.src}
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

      {/* Main Foreground Content - Text on Left Side */}
      <div className="container-page relative z-20 flex min-h-[540px] sm:min-h-[600px] lg:min-h-[640px] flex-col justify-center py-16">
        <div className="max-w-2xl">
          {/* Eyebrow badge with glowing sparkle & Hindi tagline */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-gold backdrop-blur-sm w-fit shadow-md">
            <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse shrink-0" />
            <span className="font-semibold text-gold">जहाँ रिश्ते बनें खास</span>
            <span className="text-white/40">✦</span>
            <span className="text-white/90">A Journey Towards Forever ❤️</span>
          </div>

          {/* Dynamic Headline */}
          <h1 className="mt-5 text-4xl leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl font-display font-semibold tracking-tight text-white transition-all duration-500">
            {activeSlide.title}{" "}
            <span className="italic text-gold drop-shadow-md">{activeSlide.highlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-xl text-base sm:text-lg text-white/80 leading-relaxed transition-all duration-500">
            {activeSlide.description}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
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
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
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
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-6 text-white">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-white/60">
                Profiles
              </dt>
              <dd className="font-display text-3xl font-semibold text-white mt-0.5">
                {stats.profiles}+
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-white/60">
                Verified
              </dt>
              <dd className="font-display text-3xl font-semibold text-gold mt-0.5">
                {stats.verified}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-white/60">Cities</dt>
              <dd className="font-display text-3xl font-semibold text-white mt-0.5">
                {stats.cities}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Slider Controls (Arrow Buttons & Dots) */}
      <div className="relative z-30 container-page pb-8 flex items-center justify-between">
        {/* Navigation Dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Slider Pagination">
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
        <div className="flex items-center gap-2">
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
