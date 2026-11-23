"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Printer, ArrowLeft, Building2, CheckCircle2, Mail, Phone, MapPin, Instagram, Globe, Youtube } from "lucide-react";
import { OFFICIAL_COMMUNITY_EMAIL } from "@/lib/constants";

export default function InstitutionalDeckPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 selection:bg-brand-blue selection:text-white pb-16">
      
      {/* Non-printing Control Bar */}
      <div className="print:hidden bg-brand-dark text-white border-b border-neutral-800 sticky top-0 z-50 px-4 py-3 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Community.VA</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-brand-dark text-xs font-mono font-bold uppercase hover:bg-neutral-100 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <a
              href="/letterhead-template.jpg"
              download="COMMUNITY_VA_Letterhead_Template.jpg"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue text-white text-xs font-mono font-bold uppercase hover:bg-brand-blue/90 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </a>
          </div>
        </div>
      </div>

      {/* Printable Letterhead Document Container (A4 Proportions) */}
      <div className="max-w-4xl mx-auto my-6 sm:my-10 px-4 sm:px-0">
        <div 
          ref={printRef}
          className="bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none print:m-0 print:p-0 relative"
          style={{ minHeight: "1123px" }} // Standard A4 ratio
        >
          {/* Official Letterhead Header Graphic */}
          <div className="relative w-full h-[220px] sm:h-[260px] bg-white border-b border-neutral-200">
            <Image
              src="/letterhead-template.jpg"
              alt="COMMUNITY.VA Official Letterhead"
              fill
              priority
              className="object-cover object-top"
            />
          </div>

          {/* Document Body Content */}
          <div className="p-8 sm:p-12 space-y-8 font-body text-neutral-800 text-sm leading-relaxed">
            
            {/* Document Header Metadata */}
            <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 pb-4 text-xs font-mono text-neutral-500">
              <div>
                <span className="font-bold text-neutral-700">DOCUMENT:</span> INSTITUTIONAL PROFILE &amp; COLLABORATION DECK
              </div>
              <div>
                <span className="font-bold text-neutral-700">DATE:</span> {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
              </div>
              <div>
                <span className="font-bold text-neutral-700">REF:</span> CVA/INST/2026/01
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center space-y-2 pt-2">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-blue font-extrabold">
                Official Institutional Prospectus
              </span>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-dark uppercase tracking-tight">
                Empowering Youth. Bridging Academia. Creating Opportunities.
              </h1>
              <p className="font-mono text-xs text-neutral-500 uppercase tracking-wider">
                Connecting Hyderabad&apos;s Next Generation Across Technology, Leadership &amp; Culture
              </p>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="space-y-3">
              <h2 className="font-display font-bold text-base uppercase text-brand-blue flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-blue" />
                1. Executive Summary &amp; Community Identity
              </h2>
              <p className="text-justify text-neutral-700">
                <strong>COMMUNITY.VA</strong> is a premier student-led youth ecosystem established in Hyderabad, India, dedicated to uniting passionate collegians, creative problem-solvers, and student leaders. Operating on the core tenets of <em>&ldquo;Connecting People • Creating Opportunities&rdquo;</em>, Community.VA bridges the critical divide between collegiate theory and high-impact industry, technology, and entrepreneurial execution.
              </p>
            </div>

            {/* Section 2: Core Divisions */}
            <div className="space-y-3">
              <h2 className="font-display font-bold text-base uppercase text-brand-blue flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-red" />
                2. Key Operational Spheres
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <h3 className="font-display font-bold text-xs uppercase text-brand-dark">
                    A. Technology &amp; Innovation Hackathons
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1">
                    Multi-day hackathons, coding sprints, AI/ML workshops, and open-source incubators in collaboration with Hyderabad tech hubs.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <h3 className="font-display font-bold text-xs uppercase text-brand-dark">
                    B. Leadership &amp; Executive Masterclasses
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1">
                    Impromptu speaking, stage presence, student club governance, and industry mentor-matching sessions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <h3 className="font-display font-bold text-xs uppercase text-brand-dark">
                    C. Cultural &amp; Creative Showcases
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1">
                    Acoustic nights, open mics, design sprints, and storytelling stages providing safe creative outlets for youth.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <h3 className="font-display font-bold text-xs uppercase text-brand-dark">
                    D. Civic Engagement &amp; Social Impact
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1">
                    Campus sustainability initiatives, cleanathons, peer tutoring programs, and educational drives across Telangana.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Institutional Chapter Model */}
            <div className="space-y-3">
              <h2 className="font-display font-bold text-base uppercase text-brand-blue flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                3. Collegiate Chapter Integration Model
              </h2>
              <p className="text-neutral-700">
                We invite colleges and universities across Hyderabad and Telangana to establish official <strong>COMMUNITY.VA Campus Chapters</strong>. Benefits to participating institutions include:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-700 font-mono">
                <li>Direct student access to inter-collegiate hackathons, design challenges, and mentorship networks.</li>
                <li>Digital event registration pass system with instant QR verification and verifiable attendance tracking.</li>
                <li>Verified leadership credentials and letters of recommendation for chapter leads and active volunteers.</li>
                <li>Exclusive co-branding opportunities for college fests, symposiums, and innovation days.</li>
              </ul>
            </div>

            {/* Section 4: Contact & Verification */}
            <div className="space-y-3 pt-2 border-t border-neutral-200">
              <h2 className="font-display font-bold text-base uppercase text-brand-blue flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-dark" />
                4. Official Liaison &amp; Communications
              </h2>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-blue shrink-0" />
                  <span>{OFFICIAL_COMMUNITY_EMAIL}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>+91 98490 46019</span>
                </div>
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                  <a 
                    href="https://www.instagram.com/community.va/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-pink-600 underline"
                  >
                    @community.va
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-600 shrink-0" />
                  <a 
                    href="https://www.youtube.com/@CommunityVA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-red-600 underline"
                  >
                    @CommunityVA
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-red shrink-0" />
                  <span>Hyderabad, Telangana, India</span>
                </div>
              </div>
            </div>

            {/* Sign-off & Seal */}
            <div className="pt-6 flex items-end justify-between border-t border-neutral-200">
              <div>
                <p className="font-mono text-xs uppercase font-bold text-neutral-700">Issued On Behalf Of</p>
                <p className="font-display font-extrabold text-sm uppercase text-brand-dark mt-0.5">COMMUNITY.VA Executive Board</p>
                <p className="font-mono text-[11px] text-neutral-500">Connecting People • Creating Opportunities</p>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded-full border border-emerald-500/50 bg-emerald-50 text-emerald-800 font-mono text-[11px] font-bold uppercase">
                  VERIFIED INSTITUTIONAL DOCUMENT
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
