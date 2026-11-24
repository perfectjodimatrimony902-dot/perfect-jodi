"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/matching";

const TONES = ["bg-tone-1", "bg-tone-2", "bg-tone-3", "bg-tone-4", "bg-tone-5", "bg-tone-6"];

const SIZES = {
  xs: "h-8 w-8 text-xs",
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-24 w-24 text-3xl",
  xl: "h-36 w-36 text-5xl",
};

export function ProfileAvatar({
  name,
  imageUrl,
  tone = 0,
  size = "md",
  className,
}: {
  name: string;
  imageUrl?: string;
  tone?: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <div
        className={cn(
          "relative flex shrink-0 select-none overflow-hidden rounded-full ring-2 ring-gold/40 ring-offset-2 ring-offset-card bg-secondary/60 shadow-sm",
          SIZES[size],
          className,
        )}
      >
        <img
          src={imageUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={`${name} (avatar)`}
      role="img"
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center rounded-full font-bold text-primary-foreground ring-2 ring-gold/50 ring-offset-2 ring-offset-card shadow-sm",
        TONES[tone % TONES.length],
        SIZES[size],
        className,
      )}
    >
      {initials(name) || "?"}
    </div>
  );
}

export const AVATAR_TONE_CLASSES = TONES;
