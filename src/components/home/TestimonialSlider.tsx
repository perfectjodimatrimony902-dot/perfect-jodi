import { BadgeCheck, Quote, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TESTIMONIALS } from "@/data/content";

const TESTIMONIAL_AVATARS: Record<string, string> = {
  "Lakshmi R.":
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  "Harsh V.":
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  "Nazia S.":
    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80",
  "Priya & Rohan":
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=200&q=80",
  "Aditya M.":
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "Sunita & Rajesh A.":
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=200&q=80",
};

export function TestimonialSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // 4 duplicated sets of testimonials to guarantee seamless infinite wrapping in both directions
  const items = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  // Initialize scroll position into the middle buffer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const initScroll = () => {
      const singleSetWidth = el.scrollWidth / 4;
      if (singleSetWidth > 0 && el.scrollLeft === 0) {
        el.scrollLeft = singleSetWidth * 1.5;
      }
    };

    initScroll();
    const timer = setTimeout(initScroll, 200);
    return () => clearTimeout(timer);
  }, []);

  // Continuous infinite marquee scroll loop
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let animId: number;
    // Calibrated smooth continuous velocity (~50px/sec)
    const pxSpeed = 0.85;

    const tick = () => {
      if (!isPaused && !isDragging.current && el) {
        const singleSetWidth = el.scrollWidth / 4;
        if (singleSetWidth > 0) {
          el.scrollLeft += pxSpeed;

          // Seamless infinite wrap: stay between singleSetWidth and singleSetWidth * 2.5
          if (el.scrollLeft >= singleSetWidth * 2.5) {
            el.scrollLeft -= singleSetWidth;
          } else if (el.scrollLeft <= singleSetWidth * 0.8) {
            el.scrollLeft += singleSetWidth;
          }
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isPaused]);

  // Mouse drag support
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.6;
    el.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
    }
  };

  // Touch drag support for mobile / tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    const el = containerRef.current;
    if (!el || !e.touches[0]) return;
    isDragging.current = true;
    startX.current = e.touches[0].pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el || !e.touches[0]) return;
    const x = e.touches[0].pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.6;
    el.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleTouchEnd = () => {
    if (isDragging.current) {
      isDragging.current = false;
    }
  };

  return (
    <div
      className="relative w-full"
      aria-label="Continuous Testimonials Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        handleMouseUpOrLeave();
        setIsPaused(false);
      }}
    >
      {/* Marquee Viewport with Edge Fade Masks */}
      <div className="relative overflow-hidden py-4 -mx-4 px-4">
        {/* Left Fade Gradient Mask */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-secondary/70 via-secondary/25 to-transparent z-10" />

        {/* Right Fade Gradient Mask */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-secondary/70 via-secondary/25 to-transparent z-10" />

        {/* Continuous Horizontal Scroll Container */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex gap-6 overflow-x-auto select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((t, idx) => {
            const initials = t.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2);

            return (
              <figure
                key={`${t.name}-${idx}`}
                className="group relative w-[310px] sm:w-[370px] lg:w-[400px] shrink-0 rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-md transition-all duration-300 hover:border-gold/60 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Top Gold Shimmer on Hover */}
                <div className="absolute inset-x-6 top-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Decorative Watermark */}
                <Quote className="absolute right-5 top-5 h-16 w-16 text-gold/10 pointer-events-none transition-transform duration-300 group-hover:scale-110" />

                <div>
                  {/* Rating & Verified Trust Pill */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, starI) => (
                        <Star
                          key={starI}
                          className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-xs"
                        />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <BadgeCheck className="h-3 w-3" />
                      Verified
                    </span>
                  </div>

                  {/* Highlight Tag */}
                  {"highlight" in t && t.highlight ? (
                    <div className="mb-2.5">
                      <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-gold-foreground border border-gold/20">
                        {t.highlight as string}
                      </span>
                    </div>
                  ) : null}

                  {/* Testimonial Quote */}
                  <blockquote className="mt-1 text-base sm:text-lg leading-relaxed text-foreground/90 font-normal">
                    “{t.quote}”
                  </blockquote>
                </div>

                {/* Reviewer Bio */}
                <figcaption className="mt-6 pt-5 border-t border-border/60 flex items-center gap-3.5">
                  {TESTIMONIAL_AVATARS[t.name] ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-gold/50 shadow-md">
                      <img
                        src={TESTIMONIAL_AVATARS[t.name]}
                        alt={t.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-amber-900 text-white text-base font-bold shadow-sm ring-2 ring-gold/40">
                      {initials}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-sm leading-tight">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}
