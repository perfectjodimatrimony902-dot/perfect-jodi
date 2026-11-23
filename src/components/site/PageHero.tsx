"use client";

import { Link } from "@/lib/navigation";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageHero({
  title,
  subtitle,
  crumb,
  children,
}: {
  title: string;
  subtitle?: string;
  crumb?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b bg-secondary/60">
      <div className="container-page py-10 md:py-14">
        {crumb && (
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"
          >
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{crumb}</span>
          </nav>
        )}
        <h1 className="text-4xl text-primary md:text-5xl">{title}</h1>
        <div className="gold-rule mt-4" />
        {subtitle && <p className="mt-4 max-w-2xl text-muted-foreground">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl text-foreground md:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-muted-foreground">{text}</p>}
    </div>
  );
}
