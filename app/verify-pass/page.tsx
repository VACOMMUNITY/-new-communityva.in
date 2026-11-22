"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Calendar, 
  Ticket, 
  UserCheck, 
  ShieldCheck, 
  Users, 
  ArrowLeft,
  Camera,
  RefreshCw,
  Sparkles
} from "lucide-react";
import CinematicNavbar from "@/components/motion/CinematicNavbar";

interface PassDetails {
  registrationId: string;
  registrationNumber: string;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  isTeam?: boolean;
  teamName?: string | null;
  teamMembersCount?: number;
  college?: string | null;
  status: string;
  isCheckedIn: boolean;
  checkedInAt?: string | null;
  event?: {
    id: string;
    title: string;
    venue: string;
    eventStart: string;
    eventEnd: string;
    category: string;
    isPaid: boolean;
    feeAmount: number;
  };
}

function VerifyPassContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || searchParams.get("reg") || "";
  const eventId = searchParams.get("event") || searchParams.get("eventId") || "";

  const [loading, setLoading] = useState(true);
  const [pass, setPass] = useState<PassDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check-In Action State
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkInOutcomeMsg, setCheckInOutcomeMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMsg("No QR token or registration code was provided in the link.");
      return;
    }

    async function fetchPass() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const queryParams = new URLSearchParams({ token });
        if (eventId) queryParams.set("event", eventId);

        const res = await fetch(`/api/events/verify-pass?${queryParams.toString()}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setPass(data);
          if (data.isCheckedIn) {
            setCheckInSuccess(true);
          }
        } else {
          setErrorMsg(data.message || "Pass verification failed. Please check the ticket code.");
        }
      } catch (err) {
        console.error("Pass verification error", err);
        setErrorMsg("Failed to reach verification server. Please verify your connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchPass();
  }, [token, eventId]);

  const handleMarkAttendance = async () => {
    if (!token || checkingIn) return;
    setCheckingIn(true);
    setCheckInOutcomeMsg(null);

    try {
      const res = await fetch("/api/events/verify-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          eventId: pass?.event?.id || eventId,
          volunteerName: "Gate Scanner",
          scanMethod: "CAMERA",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCheckInSuccess(true);
        setCheckInOutcomeMsg(data.message || "Attendance marked successfully!");
        if (pass) {
          setPass({
            ...pass,
            isCheckedIn: true,
            checkedInAt: data.checkedInAt || new Date().toISOString(),
          });
        }
      } else {
        setCheckInOutcomeMsg(data.message || "Could not check in attendee.");
      }
    } catch (err) {
      console.error("Check-in error", err);
      setCheckInOutcomeMsg("Network error marking attendance.");
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">
            Verifying Official Pass Credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark flex flex-col justify-between selection:bg-brand-blue selection:text-white">
      <CinematicNavbar />

      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full flex-1">
        
        {/* Top Header Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-border text-xs font-mono font-bold tracking-wider uppercase mb-3 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-brand-blue" />
            <span>Community.VA Pass Verification</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
            Event Pass Verification
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Gate Check-in &amp; Instant Attendance Confirmation
          </p>
        </div>

        {errorMsg ? (
          <div className="bg-white rounded-3xl border border-red-200 p-8 text-center space-y-4 shadow-lg">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="font-display font-bold text-lg text-brand-dark uppercase">
              Invalid or Unrecognized Pass
            </h2>
            <p className="text-xs font-mono text-brand-muted leading-relaxed max-w-sm mx-auto">
              {errorMsg}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-black"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Events</span>
              </Link>
            </div>
          </div>
        ) : pass ? (
          <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xl animate-scaleUp">
            
            {/* Top Pass Brand Header */}
            <div className="bg-brand-dark text-white p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-brand-blue-light uppercase font-bold block">
                    Verified Digital Pass
                  </span>
                  <span className="font-display font-extrabold text-lg uppercase tracking-wider">
                    COMMUNITY<span className="text-brand-blue">.VA</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-neutral-400 block uppercase">Pass ID</span>
                  <span className="font-mono text-xs font-extrabold text-white tracking-widest">
                    {pass.registrationNumber}
                  </span>
                </div>
              </div>

              {pass.event && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <h2 className="font-display font-extrabold text-base sm:text-lg text-white uppercase leading-snug">
                    {pass.event.title}
                  </h2>
                </div>
              )}
            </div>

            {/* Attendance Status Banner */}
            <div className={`p-4 border-b text-center font-mono text-xs font-bold transition-colors ${
              pass.isCheckedIn || checkInSuccess
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
                : "bg-blue-500/10 border-blue-500/20 text-brand-blue"
            }`}>
              {pass.isCheckedIn || checkInSuccess ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    ATTENDANCE MARKED • CHECKED IN
                    {pass.checkedInAt && ` (${new Date(pass.checkedInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })})`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserCheck className="w-5 h-5 text-brand-blue shrink-0" />
                  <span>PASS VERIFIED • READY FOR CHECK-IN</span>
                </div>
              )}
            </div>

            {/* Attendee Details Grid */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-brand-border">
                <div>
                  <span className="text-[11px] font-mono text-brand-muted uppercase block">Attendee Name</span>
                  <span className="font-bold text-sm text-brand-dark">{pass.participantName}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-brand-muted uppercase block">Pass Status</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    CONFIRMED
                  </span>
                </div>
              </div>

              {pass.isTeam && pass.teamName && (
                <div className="pb-4 border-b border-brand-border">
                  <span className="text-[11px] font-mono text-brand-muted uppercase block">Team Name</span>
                  <span className="font-extrabold text-sm text-brand-blue uppercase">{pass.teamName}</span>
                  {pass.teamMembersCount && (
                    <span className="text-[11px] text-brand-muted font-mono block mt-0.5">
                      {pass.teamMembersCount} Registered Members
                    </span>
                  )}
                </div>
              )}

              {pass.college && (
                <div className="pb-4 border-b border-brand-border">
                  <span className="text-[11px] font-mono text-brand-muted uppercase block">Institution / College</span>
                  <span className="font-medium text-xs text-brand-dark">{pass.college}</span>
                </div>
              )}

              {pass.event && (
                <div className="space-y-2 text-xs font-mono text-neutral-600 pt-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0 mt-0.5" />
                    <span>{pass.event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                    <span>
                      {new Date(pass.event.eventStart).toLocaleDateString("en-IN", { 
                        weekday: "short", 
                        day: "numeric", 
                        month: "short", 
                        year: "numeric" 
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                {!(pass.isCheckedIn || checkInSuccess) ? (
                  <button
                    onClick={handleMarkAttendance}
                    disabled={checkingIn}
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-600 text-white font-display font-extrabold text-sm uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {checkingIn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Recording Attendance...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5" />
                        <span>Mark Attendance / Check In</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Welcome to the Event! Attendee Checked In.</span>
                    </div>
                  </div>
                )}

                {checkInOutcomeMsg && (
                  <p className="text-center text-xs font-mono text-emerald-700">
                    {checkInOutcomeMsg}
                  </p>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                  {pass.event?.id && (
                    <Link
                      href={`/dashboard/event-volunteer/events/${pass.event.id}/scan`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-muted hover:text-brand-dark transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Open Volunteer Scanner</span>
                    </Link>
                  )}
                  <span className="text-neutral-300">•</span>
                  <Link
                    href="/events"
                    className="text-xs font-mono font-bold text-brand-muted hover:text-brand-dark transition-colors"
                  >
                    All Events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function VerifyPassPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyPassContent />
    </Suspense>
  );
}
