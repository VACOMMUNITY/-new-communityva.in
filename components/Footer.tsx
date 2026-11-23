"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Mail, MapPin, Instagram, Youtube, Award } from "lucide-react";
import { OFFICIAL_COMMUNITY_EMAIL, OFFICIAL_MAILTO_LINK } from "@/lib/constants";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-brand-dark text-white border-t border-brand-border-dark pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-white/10">
          
          {/* Brand & Mission Column */}
          <div className="md:col-span-5 space-y-5">
            <div className="relative h-12 w-44">
              <Image
                src="/logos/community-va-logo.png"
                alt="COMMUNITY.VA Official Logo"
                fill
                className="object-contain object-left invert contrast-200 brightness-200"
              />
            </div>

            <p className="font-display text-sm font-semibold text-brand-blue-light tracking-wide">
              Connecting People • Creating Opportunities
            </p>

            <p className="font-body text-xs sm:text-sm text-white/70 max-w-sm leading-relaxed">
              Bringing people together, discovering potential and creating opportunities. A youth-driven organization founded by Paidimarri Abhiram to empower students through events, sports, innovation, networking, and skill development.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-white/60">
              <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
              <span>Hyderabad, Telangana, India</span>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 font-bold">
              Navigation
            </h4>
            <ul className="space-y-2.5 font-body text-xs sm:text-sm text-white/80">
              {[
                { name: "Home", href: "/#home" },
                { name: "Leadership (Founder & CEO)", href: "/#leadership" },
                { name: "Activity Areas", href: "/#activities" },
                { name: "Events & Pass Verification", href: "/events" },
                { name: "Institutional Deck", href: "/institutional-deck" },
                { name: "Admin Registrations Hub", href: "/admin/registrations" },
                { name: "Contact Portal", href: "/#contact" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Official Channels Column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 font-bold">
              Leadership & Channels
            </h4>
            <div className="space-y-3 font-body text-xs text-white/70">
              <div>
                <span className="font-mono text-[10px] text-white/40 uppercase block">Founder & CEO</span>
                <span className="font-bold text-white text-xs">Paidimarri Abhiram</span>
              </div>

              <div>
                <span className="font-mono text-[10px] text-white/40 uppercase block">Founder Direct Email</span>
                <a
                  href="mailto:community.va01@gmail.com"
                  className="font-mono text-xs text-brand-blue-light hover:underline"
                >
                  community.va01@gmail.com
                </a>
              </div>

              <div>
                <span className="font-mono text-[10px] text-white/40 uppercase block">Official Organization Email</span>
                <a
                  href={OFFICIAL_MAILTO_LINK}
                  className="font-mono text-xs text-brand-blue-light hover:underline"
                >
                  {OFFICIAL_COMMUNITY_EMAIL}
                </a>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="https://www.instagram.com/community.va/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1.5 transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>@community.va (Instagram)</span>
                </a>
                <a
                  href="https://www.youtube.com/@CommunityVA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-400" />
                  <span>@CommunityVA (YouTube)</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/50">
          <div>
            &copy; {new Date().getFullYear()} COMMUNITY.VA. All rights reserved.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
