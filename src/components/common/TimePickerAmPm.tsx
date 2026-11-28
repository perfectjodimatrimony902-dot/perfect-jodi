"use client";

import React, { useMemo } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimePickerAmPmProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

/** Parses any 12h or 24h string into 12-hour components */
export function parseTimeTo12h(timeStr?: string): { hour: string; minute: string; period: "AM" | "PM" } {
  if (!timeStr) return { hour: "10", minute: "00", period: "AM" };
  const str = timeStr.trim();

  // Check if string already has AM/PM
  const ampmMatch = str.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase() as "AM" | "PM";
    if (h === 0) h = 12;
    if (h > 12) h = h % 12 || 12;
    return { hour: h.toString().padStart(2, "0"), minute: m, period };
  }

  // Handle standard 24h HH:mm
  const parts = str.split(":");
  if (parts.length >= 2) {
    let h = parseInt(parts[0], 10);
    const m = (parts[1] || "00").slice(0, 2).padStart(2, "0");
    if (isNaN(h)) h = 10;
    const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return { hour: h.toString().padStart(2, "0"), minute: m, period };
  }

  return { hour: "10", minute: "00", period: "AM" };
}

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = [
  "00", "05", "10", "15", "20", "25",
  "30", "35", "40", "45", "50", "55"
];

export function TimePickerAmPm({
  id,
  value,
  onChange,
  className,
  disabled = false,
}: TimePickerAmPmProps) {
  const { hour, minute, period } = useMemo(() => parseTimeTo12h(value), [value]);

  const update = (h: string, m: string, p: "AM" | "PM") => {
    onChange(`${h}:${m} ${p}`);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex items-center gap-1.5 bg-background border border-input rounded-md px-2.5 py-1.5 shadow-xs focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />

        {/* Hour Select */}
        <div className="relative">
          <select
            id={id}
            value={hour}
            disabled={disabled}
            onChange={(e) => update(e.target.value, minute, period)}
            className="appearance-none bg-transparent font-medium text-sm text-foreground pr-1 cursor-pointer focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Hour"
          >
            {HOURS.map((h) => (
              <option key={h} value={h} className="bg-background text-foreground">
                {h}
              </option>
            ))}
          </select>
        </div>

        <span className="text-muted-foreground font-bold text-sm select-none">:</span>

        {/* Minute Select */}
        <div className="relative">
          <select
            value={MINUTES.includes(minute) ? minute : "00"}
            disabled={disabled}
            onChange={(e) => update(hour, e.target.value, period)}
            className="appearance-none bg-transparent font-medium text-sm text-foreground pr-1 cursor-pointer focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Minute"
          >
            {MINUTES.map((m) => (
              <option key={m} value={m} className="bg-background text-foreground">
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AM / PM Segmented Control */}
      <div
        className="inline-flex rounded-md border border-input bg-muted/40 p-0.5 shadow-xs"
        role="group"
        aria-label="AM or PM"
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => update(hour, minute, "AM")}
          className={cn(
            "px-2.5 py-1 text-xs font-semibold rounded transition-colors",
            period === "AM"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          AM
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => update(hour, minute, "PM")}
          className={cn(
            "px-2.5 py-1 text-xs font-semibold rounded transition-colors",
            period === "PM"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          PM
        </button>
      </div>

      {/* Current Preview Tag */}
      <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
        ({hour}:{minute} {period})
      </span>
    </div>
  );
}
