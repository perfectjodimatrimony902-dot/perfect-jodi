import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: (string | { value: string; label: string })[];
  placeholder?: string;
}

/** Native select styled to match inputs — supports an empty "Any" option, which Radix Select does not. */
export const NativeSelect = React.forwardRef<HTMLSelectElement, Props>(
  ({ options, placeholder, className, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full cursor-pointer appearance-none rounded-md border border-input bg-card px-3 pr-9 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  ),
);
NativeSelect.displayName = "NativeSelect";
