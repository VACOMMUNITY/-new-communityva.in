"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Mail, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles, 
  Award,
  ShieldCheck,
} from "lucide-react";

const LEADERSHIP_RESPONSIBILITIES = [
  "Founder and overall organizational leadership",
  "Strategic planning and decision-making",
  "Team building and management",
  "College collaborations and partnerships",
  "Event planning and execution",
  "Hackathons and innovation initiatives",
  "Youth empowerment and community development",
];

export default function FounderLeadershipSection() {
  return (
    <section id="leadership" className="relative py-16 sm:py-24 bg-white border-b border-brand-border">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Section Header Tag */}
        <div className="lg:hidden mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-mono font-bold uppercase tracking-wider">
            FOUNDER & CEO
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-2 font-display">
            Paidimarri Abhiram
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Leading the vision, community growth & youth initiatives at COMMUNITY.VA
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Photo Card & Contact Meta */}
          <div className="lg:col-span-5 space-y-3.5">
            
            {/* Founder Card with Image */}
            <div className="relative rounded-3xl overflow-hidden border border-neutral-200 shadow-md bg-neutral-100">
              <div className="relative aspect-[4/4.7] w-full">
                <Image
                  src="/team/paidimarri-abhiram.jpg"
                  alt="Paidimarri Abhiram - Founder & CEO of COMMUNITY.VA"
                  fill
                  priority
                  unoptimized
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 450px"
                />

                {/* Crisp Top Badge Overlay */}
                <div className="absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Founder &amp; CEO</span>
                </div>

                {/* Crisp Bottom Name Card Overlay */}
                <div className="absolute bottom-3.5 inset-x-3.5 z-10 p-3.5 rounded-2xl bg-neutral-900/95 text-white border border-neutral-700/60 shadow-lg">
                  <div className="font-extrabold text-sm text-white tracking-tight">
                    Paidimarri Abhiram
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    Founder &amp; CEO • COMMUNITY.VA
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Card 1: Organization */}
            <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Organization
                </div>
                <div className="text-xs font-bold text-neutral-900">
                  COMMUNITY.VA
                </div>
              </div>
            </div>

            {/* Meta Card 2: Location */}
            <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 text-brand-red shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Location
                </div>
                <div className="text-xs font-bold text-neutral-900">
                  Hyderabad, India
                </div>
              </div>
            </div>

            {/* Meta Card 3: Email */}
            <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Official Founder Email
                </div>
                <a
                  href="mailto:community.va01@gmail.com"
                  className="text-xs font-mono font-bold text-neutral-900 hover:text-blue-600 transition-colors truncate block"
                >
                  community.va01@gmail.com
                </a>
              </div>
            </div>

            {/* Direct Connect CTA */}
            <a
              href="mailto:community.va01@gmail.com"
              className="w-full py-3.5 px-5 rounded-2xl bg-neutral-950 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all shadow-md group"
            >
              <Mail className="w-4 h-4 text-neutral-300" />
              <span>Connect with Founder Directly</span>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* RIGHT COLUMN: Bio, Responsibilities, Mission */}
          <div className="lg:col-span-7 lg:pl-4">
            
            {/* Desktop Section Header */}
            <div className="hidden lg:block mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-mono font-bold uppercase tracking-wider">
                FOUNDER & CEO
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mt-3 mb-2 font-display">
                Paidimarri Abhiram
              </h2>
              <p className="text-sm text-neutral-600 font-medium">
                Leading the vision, community growth & youth initiatives at COMMUNITY.VA
              </p>
            </div>

            {/* Bio Paragraphs */}
            <div className="space-y-3.5 text-xs sm:text-sm text-neutral-600 leading-relaxed mb-8">
              <p>
                Paidimarri Abhiram is the Founder and CEO of COMMUNITY.VA, a youth-driven organization established to connect people and create opportunities.
              </p>
              <p>
                His vision is to build a platform that empowers students and young individuals through events, sports, innovation, networking and skill development.
              </p>
              <p>
                He leads the organization's overall vision, strategic planning, team management, partnerships, collaborations and event initiatives.
              </p>
            </div>

            {/* Leadership Responsibilities */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider mb-4">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Leadership Responsibilities</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LEADERSHIP_RESPONSIBILITIES.map((resp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200 hover:bg-white hover:border-blue-300 transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-medium text-neutral-800 leading-snug">
                      {resp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Founder's Mission Callout Box (Clean & Sharp) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-3 shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
                <span className="font-bold text-neutral-950">Founder&apos;s Mission:</span> Dedicated to empowering student talent across Telangana through accessible hackathons, certified workshops, and career pathways.
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
