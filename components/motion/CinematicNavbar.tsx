"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowUpRight, LogIn, Instagram, Youtube, ShieldCheck } from "lucide-react";

const NAV_SCENES = [
  { label: "ABOUT", href: "/#community-story" },
  { label: "LEADERSHIP", href: "/#leadership" },
  { label: "ACTIVITIES", href: "/#activities" },
  { label: "EVENTS", href: "/events" },
  { label: "COMMUNITY", href: "/#join" },
  { label: "DECK", href: "/institutional-deck" },
  { label: "CONTACT", href: "/#contact" },
];

export default function CinematicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-brand-bg/90 backdrop-blur-md border-b border-brand-border py-3 shadow-xs"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & Location Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-9 w-32 sm:h-10 sm:w-36">
                <Image
                  src="/logos/community-va-logo.png"
                  alt="COMMUNITY.VA Logo"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <span className="hidden xl:inline-block text-[11px] font-mono text-neutral-400 font-semibold border-l border-neutral-300 pl-3">
              Hyderabad • India
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 border border-brand-border backdrop-blur-sm shadow-xs">
            {NAV_SCENES.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-brand-dark/80 hover:text-brand-dark hover:bg-black/5 rounded-full transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            <a
              href="https://www.instagram.com/community.va/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-xs font-mono font-bold text-pink-700 hover:bg-pink-100 transition-all shadow-xs"
              title="Follow us on Instagram @community.va"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              <span>@community.va</span>
            </a>

            <a
              href="https://www.youtube.com/@CommunityVA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs font-mono font-bold text-red-700 hover:bg-red-100 transition-all shadow-xs"
              title="Subscribe on YouTube @CommunityVA"
            >
              <Youtube className="w-3.5 h-3.5 text-red-600" />
              <span>@CommunityVA</span>
            </a>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-neutral-200 text-xs font-mono font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
              title="Admin Console"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden xl:inline">Admin</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-border text-xs font-mono font-bold uppercase text-brand-dark hover:bg-white transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-blue text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-brand-blue-hover transition-colors shadow-xs group"
            >
              <span>Join Us</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href="https://www.instagram.com/community.va/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full border border-pink-300 text-pink-600 bg-pink-50"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.youtube.com/@CommunityVA"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full border border-red-300 text-red-600 bg-red-50"
              title="YouTube @CommunityVA"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <Link
              href="/register"
              className="px-3 py-1.5 rounded-full bg-brand-blue text-white text-[11px] font-mono font-bold uppercase"
            >
              Join Us
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-dark hover:bg-black/5"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[60px] bg-brand-bg/98 backdrop-blur-xl border-b border-brand-border p-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 font-mono text-xs font-bold uppercase">
            {NAV_SCENES.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-brand-dark hover:bg-black/5 flex justify-between items-center"
              >
                <span>{item.label}</span>
                <span className="text-brand-grey">#</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-brand-border space-y-2">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 flex items-center justify-center gap-2 font-bold"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Admin Console</span>
              </Link>
              <a
                href="https://www.instagram.com/community.va/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10 border border-pink-200 text-pink-700 flex items-center justify-center gap-2 font-bold"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow on Instagram @community.va</span>
              </a>
              <a
                href="https://www.youtube.com/@CommunityVA"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 border border-red-200 text-red-700 flex items-center justify-center gap-2 font-bold"
              >
                <Youtube className="w-4 h-4 text-red-600" />
                <span>Subscribe on YouTube @CommunityVA</span>
              </a>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-white border border-brand-border text-center text-brand-dark block font-bold"
              >
                Portal Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-brand-blue text-white text-center block font-bold"
              >
                Choose Registration Pathway
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
