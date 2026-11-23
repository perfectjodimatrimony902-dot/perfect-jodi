import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Multi-select as toggle chips. */
export function ChipSelect({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors",
              on
                ? "border-primary bg-primary-soft text-primary"
                : "bg-card text-foreground/80 hover:border-primary/40",
            )}
          >
            {on && <Check className="h-3.5 w-3.5" />}
            {o}
          </button>
        );
      })}
    </div>
  );
}
