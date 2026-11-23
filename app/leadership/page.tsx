import { Metadata } from "next";
import Link from "next/link";
import CinematicNavbar from "@/components/motion/CinematicNavbar";
import FounderLeadershipSection from "@/components/motion/FounderLeadershipSection";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Leadership & Founder | COMMUNITY.VA",
  description: "Meet Paidimarri Abhiram, Founder and CEO of COMMUNITY.VA. Discover our leadership vision, community initiatives, and youth empowerment mission.",
};

export default function LeadershipPage() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark flex flex-col selection:bg-brand-blue selection:text-white">
      <CinematicNavbar />
      
      <main className="flex-1 pt-24 sm:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <FounderLeadershipSection />
      </main>

      <Footer />
    </div>
  );
}
