import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function FormField({
  id,
  label,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
