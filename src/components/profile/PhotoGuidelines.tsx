"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Info,
  Mail,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const ALLOWED_PHOTOS = [
  {
    title: "Close Up",
    caption: "Front view face",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
    alt: "Example of acceptable close-up portrait photo",
  },
  {
    title: "Full View",
    caption: "Decent standing view",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    alt: "Example of acceptable full-length portrait photo",
  },
];

export const DISALLOWED_PHOTOS = [
  {
    title: "Side Face",
    caption: "Avoid side angles",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
    alt: "Example of rejected side profile photo",
  },
  {
    title: "Blur",
    caption: "Avoid low quality",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
    isBlurred: true,
    alt: "Example of rejected blurry photo",
  },
  {
    title: "Group",
    caption: "No multiple people",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=240&q=80",
    alt: "Example of rejected group photo",
  },
  {
    title: "Watermark",
    caption: "No text or filters",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    isWatermarked: true,
    alt: "Example of rejected watermarked photo",
  },
];

const PHOTO_FAQS = [
  {
    q: "Why are clear front photos required?",
    a: "Members and families place the highest trust in profiles with clear, authentic, front-facing photos. Blurry, group, or side-angle photos often result in skipped profiles or verification rejection.",
  },
  {
    q: "Can I keep my photos private or visible only upon request?",
    a: "Yes! Perfect Jodi provides photo privacy settings. You can choose to make your photos visible to all registered members or only reveal them to profiles whose interests you accept.",
  },
  {
    q: "What file formats and sizes are supported?",
    a: "We support JPG, JPEG, PNG, and WEBP formats up to 10MB each. Our system automatically optimizes and compresses your photos for fast and crisp viewing.",
  },
  {
    q: "How long does photo approval take?",
    a: "Photos are manually verified by our safety team within 2 to 4 hours. Once verified, your profile receives the 'Photo Verified' badge.",
  },
];

export function PhotoGuidelines({ className }: { className?: string }) {
  const [showFaq, setShowFaq] = useState(false);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-6 text-foreground",
        className,
      )}
    >
      {/* Top Banner: Other ways to upload */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-start gap-2.5">
          <span className="text-xl">✉️</span>
          <div>
            <h4 className="font-semibold text-foreground">Other ways to submit your photos</h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Prefer assistance? Send your photos via email to{" "}
              <a
                href="mailto:care@perfectjodi.demo"
                className="font-semibold text-primary underline underline-offset-2"
              >
                care@perfectjodi.demo
              </a>{" "}
              or WhatsApp with your Profile ID & Name.
            </p>
          </div>
        </div>
        <span className="shrink-0 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          Assisted Upload
        </span>
      </div>

      <div className="border-t border-border/70 pt-5">
        <h4 className="text-sm sm:text-base font-bold text-foreground mb-1 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Photo Upload Conditions & Quality Standards
        </h4>
        <p className="text-xs text-muted-foreground mb-5">
          Follow these simple rules so your photos pass verification on the first attempt.
        </p>

        {/* Visual Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Photos You Can Upload (Do's) - Span 5 */}
          <div className="md:col-span-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs sm:text-sm mb-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Photos you can upload</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {ALLOWED_PHOTOS.map((item) => (
                <div key={item.title} className="flex flex-col items-center text-center">
                  <div className="relative h-28 w-24 sm:h-32 sm:w-28 rounded-xl overflow-hidden border-2 border-emerald-500/40 shadow-xs bg-stone-900 group">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Green Check Badge */}
                    <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <span className="mt-2 text-xs font-bold text-foreground">{item.title}</span>
                  <span className="text-[10px] text-muted-foreground">{item.caption}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photos You Cannot Upload (Don'ts) - Span 7 */}
          <div className="md:col-span-7 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-destructive font-bold text-xs sm:text-sm mb-3">
              <XCircle className="h-4 w-4 text-destructive" />
              <span>Photos you cannot upload</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DISALLOWED_PHOTOS.map((item) => (
                <div key={item.title} className="flex flex-col items-center text-center">
                  <div className="relative h-28 w-24 sm:h-32 sm:w-full rounded-xl overflow-hidden border-2 border-destructive/40 shadow-xs bg-stone-900 group">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className={cn(
                        "h-full w-full object-cover object-top",
                        item.isBlurred && "blur-[3px] scale-105",
                      )}
                    />

                    {/* Watermark Overlay simulation */}
                    {item.isWatermarked && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rotate-[-30deg] pointer-events-none">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/90 border border-white/60 px-1 py-0.5">
                          STOCK
                        </span>
                      </div>
                    )}

                    {/* Red Cross Badge */}
                    <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-xs">
                      <X className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <span className="mt-2 text-xs font-bold text-foreground">{item.title}</span>
                  <span className="text-[10px] text-muted-foreground">{item.caption}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Links & Collapsible FAQ */}
      <div className="border-t border-border/70 pt-4 flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setShowFaq(!showFaq)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>{showFaq ? "Hide Photo FAQ" : "Read Photo Guidelines & FAQ"}</span>
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform duration-200", showFaq && "rotate-180")}
          />
        </button>

        {showFaq && (
          <div className="w-full mt-2 space-y-3 rounded-xl border border-border/80 bg-secondary/30 p-4 text-xs">
            {PHOTO_FAQS.map((faq, i) => (
              <div
                key={i}
                className="space-y-1 pb-2 border-b border-border/60 last:border-0 last:pb-0"
              >
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                  {faq.q}
                </p>
                <p className="text-muted-foreground leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
