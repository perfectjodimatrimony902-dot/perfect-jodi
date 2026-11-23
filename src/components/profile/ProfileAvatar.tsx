import { cn } from "@/lib/utils";
import { initials } from "@/lib/matching";

const TONES = ["bg-tone-1", "bg-tone-2", "bg-tone-3", "bg-tone-4", "bg-tone-5", "bg-tone-6"];

const SIZES = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-24 w-24 text-3xl",
  xl: "h-36 w-36 text-5xl",
};

/** Initials-based photo placeholder — no external images. */
export function ProfileAvatar({
  name,
  tone = 0,
  size = "md",
  className,
}: {
  name: string;
  tone?: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <div
      aria-label={`${name} (photo placeholder)`}
      role="img"
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center rounded-full font-display font-semibold text-primary-foreground ring-2 ring-gold/50 ring-offset-2 ring-offset-card",
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
