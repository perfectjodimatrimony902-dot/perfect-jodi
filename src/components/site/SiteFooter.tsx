"use client";

import { Link } from "@/lib/navigation";
import { Logo } from "./Logo";
import { useDemoState } from "@/lib/store";

export function SiteFooter() {
  const { settings } = useDemoState();
  return (
    <footer className="relative mt-20 overflow-hidden bg-stone-950 text-white">
      {/* Background Image - clearly and normally visible across entire footer */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <img
          src="/footer-bg.jpg?v=2"
          alt="Bride and groom hands with wedding rings and bridal jewellery"
          className="h-full w-full object-cover object-center"
        />
        {/* Uniform translucent dark wash across entire footer so background is identical throughout */}
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
        <div className="container-page grid gap-10 py-14 md:py-16 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo inverted />
            <p className="mt-3.5 text-[15px] font-semibold text-white/95 flex items-center gap-1.5 drop-shadow">
              A Journey Towards Forever <span className="text-red-500">❤️</span>
            </p>
            <p className="mt-2 text-xs md:text-sm leading-relaxed text-white/80 max-w-sm drop-shadow">
              Connecting verified brides, grooms, and families with shared traditions, values, and
              trust.
            </p>
          </div>
          <div>
            <h4 className="text-[15px] font-bold tracking-wider text-gold uppercase mb-4 drop-shadow">
              Explore
            </h4>
            <ul className="space-y-3 text-[15px] md:text-base text-white/95 font-medium">
              <li>
                <Link to="/profiles" className="hover:text-gold transition-colors">
                  Browse profiles
                </Link>
              </li>
              <li>
                <Link
                  to="/profiles"
                  search={{ lookingFor: "bride" }}
                  className="hover:text-gold transition-colors"
                >
                  Brides
                </Link>
              </li>
              <li>
                <Link
                  to="/profiles"
                  search={{ lookingFor: "groom" }}
                  className="hover:text-gold transition-colors"
                >
                  Grooms
                </Link>
              </li>
              <li>
                <Link to="/kundali-matching" className="hover:text-gold transition-colors">
                  Kundali Check & Milan (पत्रिका व मिलान)
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="hover:text-gold transition-colors">
                  Success stories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[15px] font-bold tracking-wider text-gold uppercase mb-4 drop-shadow">
              Company
            </h4>
            <ul className="space-y-3 text-[15px] md:text-base text-white/95 font-medium">
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-gold transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/membership" className="hover:text-gold transition-colors">
                  Membership plans
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold transition-colors">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[15px] font-bold tracking-wider text-gold uppercase mb-4 drop-shadow">
              Get in touch
            </h4>
            <ul className="space-y-3 text-[15px] md:text-base text-white/95 font-medium">
              <li>{settings.contactEmail}</li>
              <li>{settings.contactPhone}</li>
              <li>
                <Link to="/login" className="hover:text-gold transition-colors">
                  Member login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Merged bottom bar with NO separate black background */}
        <div className="border-t border-white/15 bg-transparent">
          <div className="container-page flex flex-col gap-2 py-5 text-xs md:text-sm text-white/85 sm:flex-row sm:justify-between">
            <span>© 2026 {settings.siteName}. Demo website — all profiles are fictional.</span>
            <span>Never share money or passwords with anyone you meet online.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
