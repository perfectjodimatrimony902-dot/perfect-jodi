"use client";

import { Link } from "@/lib/navigation";
import { useDemoState } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Text logo — name comes from website settings (defaults to BRAND.name). */
export function Logo({
  className,
  inverted = false,
  size = "default",
}: {
  className?: string;
  inverted?: boolean;
  size?: "default" | "lg";
}) {
  const { settings } = useDemoState();
  const [first, ...rest] = settings.siteName.trim().split(/\s+/);
  const isLg = size === "lg";

  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-3", className)}
      aria-label={`${settings.siteName} home`}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full border font-display font-bold shrink-0 shadow-sm",
          isLg ? "h-12 w-12 text-2xl" : "h-9 w-9 text-lg",
          inverted ? "border-gold text-gold" : "border-gold/60 bg-primary text-gold",
        )}
        aria-hidden
      >
        {first?.[0]}
        {rest[0]?.[0]}
      </span>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-display font-semibold leading-none",
            isLg ? "text-3xl sm:text-4xl" : "text-2xl",
            inverted ? "text-white" : "text-primary",
          )}
        >
          {first}
          {rest.length > 0 && <span className="italic text-gold"> {rest.join(" ")}</span>}
        </span>
        <span
          className={cn(
            "tracking-tight font-medium mt-1",
            isLg ? "text-xs text-gold font-semibold" : "text-[10px]",
            !isLg && (inverted ? "text-gold/90" : "text-muted-foreground"),
          )}
        >
          जहाँ रिश्ते बनें खास
        </span>
      </div>
    </Link>
  );
}
