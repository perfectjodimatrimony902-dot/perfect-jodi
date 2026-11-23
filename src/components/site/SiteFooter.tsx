"use client";

import { Link } from "@/lib/navigation";
import { Logo } from "./Logo";
import { useDemoState } from "@/lib/store";

export function SiteFooter() {
  const { settings } = useDemoState();
  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo inverted />
          <p className="mt-3 text-gold font-medium text-sm">जहाँ रिश्ते बनें खास</p>
          <p className="mt-1 text-xs text-ink-foreground/90 flex items-center gap-1.5">
            A Journey Towards Forever <span className="text-red-500">❤️</span>
          </p>
          <p className="mt-3 text-xs leading-relaxed text-ink-foreground/60">{settings.tagline}</p>
        </div>
        <div>
          <h4 className="eyebrow mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-ink-foreground/80">
            <li>
              <Link to="/profiles" className="hover:text-gold">
                Browse profiles
              </Link>
            </li>
            <li>
              <Link to="/profiles" search={{ lookingFor: "bride" }} className="hover:text-gold">
                Brides
              </Link>
            </li>
            <li>
              <Link to="/profiles" search={{ lookingFor: "groom" }} className="hover:text-gold">
                Grooms
              </Link>
            </li>
            <li>
              <Link to="/success-stories" className="hover:text-gold">
                Success stories
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-ink-foreground/80">
            <li>
              <Link to="/about" className="hover:text-gold">
                About us
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-gold">
                How it works
              </Link>
            </li>
            <li>
              <Link to="/membership" className="hover:text-gold">
                Membership plans
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold">
                Contact us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-4">Get in touch</h4>
          <ul className="space-y-2 text-sm text-ink-foreground/80">
            <li>{settings.contactEmail}</li>
            <li>{settings.contactPhone}</li>
            <li>
              <Link to="/login" className="hover:text-gold">
                Member login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-foreground/60 sm:flex-row sm:justify-between">
          <span>© 2026 {settings.siteName}. Demo website — all profiles are fictional.</span>
          <span>Never share money or passwords with anyone you meet online.</span>
        </div>
      </div>
    </footer>
  );
}
