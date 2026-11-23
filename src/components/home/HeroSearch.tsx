"use client";

import { useNavigate } from "@/lib/navigation";
import {
  Calendar,
  Compass,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/common/NativeSelect";
import { AGES, CITIES, RELIGIONS } from "@/lib/options";

export function HeroSearch({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [f, setF] = useState({
    lookingFor: "bride",
    ageMin: "24",
    ageMax: "32",
    religion: "",
    community: "",
    location: "",
  });
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(f.ageMin) > Number(f.ageMax)) {
      setError("Minimum age can't be more than maximum age.");
      return;
    }
    setError("");
    navigate({
      to: "/profiles",
      search: {
        lookingFor: f.lookingFor as "bride" | "groom",
        ageMin: Number(f.ageMin),
        ageMax: Number(f.ageMax),
        religion: f.religion || undefined,
        community: f.community || undefined,
        location: f.location || undefined,
      },
    });
  };

  const ages = AGES.map(String);

  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-b from-card via-card to-card/95 p-1 shadow-2xl border border-gold/30 backdrop-blur-md ${className}`}
    >
      {/* Decorative subtle top shimmer line */}
      <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-75" />

      <form
        onSubmit={submit}
        className="rounded-[22px] bg-card/60 p-6 sm:p-8 text-foreground"
        aria-label="Partner search"
      >
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-sm shrink-0">
              <Sparkles className="h-5 w-5 text-gold animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-semibold tracking-tight text-primary flex items-center gap-2">
                Begin Your Partner Search
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Find compatible, verified profiles crafted for lifelong companionship.
              </p>
            </div>
          </div>

          {/* Looking for Bride / Groom Pills */}
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/80 p-1.5 border border-border/80 self-start sm:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => setF({ ...f, lookingFor: "bride" })}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                f.lookingFor === "bride"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${f.lookingFor === "bride" ? "fill-gold text-gold" : ""}`}
              />
              Bride
            </button>
            <button
              type="button"
              onClick={() => setF({ ...f, lookingFor: "groom" })}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                f.lookingFor === "groom"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className={`h-3.5 w-3.5 ${f.lookingFor === "groom" ? "text-gold" : ""}`} />
              Groom
            </button>
          </div>
        </div>

        {/* Search Inputs Grid */}
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5 items-end">
          {/* Age Range Filter */}
          <div className="rounded-2xl border border-border/80 bg-background/80 p-2.5 transition-all focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20 shadow-xs">
            <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-gold shrink-0" />
              <span>Age Range</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1">
                <NativeSelect
                  id="hs-amin"
                  value={f.ageMin}
                  onChange={set("ageMin")}
                  options={ages}
                  className="h-9 border-0 bg-transparent px-1 text-sm font-medium focus:ring-0"
                />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">to</span>
              <div className="flex-1">
                <NativeSelect
                  id="hs-amax"
                  value={f.ageMax}
                  onChange={set("ageMax")}
                  options={ages}
                  className="h-9 border-0 bg-transparent px-1 text-sm font-medium focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Religion Filter */}
          <div className="rounded-2xl border border-border/80 bg-background/80 p-2.5 transition-all focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20 shadow-xs">
            <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Compass className="h-3.5 w-3.5 text-gold shrink-0" />
              <span>Religion</span>
            </div>
            <div className="mt-1">
              <NativeSelect
                id="hs-rel"
                value={f.religion}
                onChange={set("religion")}
                placeholder="Any religion"
                options={RELIGIONS}
                className="h-9 border-0 bg-transparent px-1 text-sm font-medium focus:ring-0"
              />
            </div>
          </div>

          {/* Location Filter */}
          <div className="rounded-2xl border border-border/80 bg-background/80 p-2.5 transition-all focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20 shadow-xs">
            <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
              <span>City / Location</span>
            </div>
            <div className="mt-1">
              <NativeSelect
                id="hs-loc"
                value={f.location}
                onChange={set("location")}
                placeholder="All Cities in India"
                options={CITIES}
                className="h-9 border-0 bg-transparent px-1 text-sm font-medium focus:ring-0"
              />
            </div>
          </div>

          {/* Trust Feature Pill */}
          <div className="hidden lg:flex flex-col justify-center rounded-2xl border border-gold/30 bg-gold-soft/30 p-2.5 px-4 h-[66px]">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
              <span>100% Verified Profiles</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Government ID & family checked
            </p>
          </div>

          {/* Submit Search Button */}
          <div>
            <Button
              type="submit"
              size="xl"
              className="w-full h-[66px] rounded-2xl bg-gradient-to-r from-primary via-primary to-amber-900 hover:from-primary/95 hover:to-amber-800 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 text-base group"
            >
              <Search className="h-5 w-5 text-gold transition-transform duration-300 group-hover:scale-110" />
              <span>Search Profiles</span>
            </Button>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-destructive font-medium" role="alert">
            {error}
          </p>
        )}

        {/* Quick Suggestion Chips */}
        <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/80 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-gold" /> Popular:
          </span>
          {["Delhi NCR", "Mumbai", "Bangalore", "Hindu", "Jain", "Sikh"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (RELIGIONS.includes(tag)) setF((prev) => ({ ...prev, religion: tag }));
                else if (CITIES.includes(tag)) setF((prev) => ({ ...prev, location: tag }));
              }}
              className="rounded-full bg-secondary/80 hover:bg-gold/15 hover:text-gold-foreground border border-border/60 px-2.5 py-0.5 transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
