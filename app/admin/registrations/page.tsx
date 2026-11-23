"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Users, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Eye, 
  Sparkles, 
  Calendar, 
  GraduationCap, 
  HandHeart, 
  Building2, 
  Briefcase, 
  X,
  ExternalLink,
  ShieldCheck,
  Plus
} from "lucide-react";

interface UnifiedItem {
  id: string;
  category: "EVENT" | "STUDENT" | "VOLUNTEER" | "COLLEGE" | "PARTNER";
  reference: string;
  titleOrName: string;
  email: string;
  mobile: string;
  organizationOrCollege: string;
  programOrDetails: string;
  status: string;
  paymentStatus?: string;
  created_at: string;
  raw: any;
}

export default function AdminRegistrationsExportPage() {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "EVENT" | "STUDENT" | "VOLUNTEER" | "COLLEGE" | "PARTNER">("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null);
  const [testRegLoading, setTestRegLoading] = useState(false);
  const [testRegSuccess, setTestRegSuccess] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const combined: UnifiedItem[] = [];

      // 1. Fetch Students
      try {
        const res = await fetch("/api/admin/applications?type=students");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          for (const s of data.data) {
            combined.push({
              id: s.id,
              category: "STUDENT",
              reference: s.application_reference,
              titleOrName: s.full_name || s.profiles?.full_name || "Student Applicant",
              email: s.email || s.profiles?.email || "N/A",
              mobile: s.mobile || s.profiles?.mobile || "N/A",
              organizationOrCollege: s.college_name,
              programOrDetails: `${s.branch} (${s.study_year})`,
              status: s.status,
              created_at: s.created_at,
              raw: s,
            });
          }
        }
      } catch (e) {
        console.warn("Failed to fetch students", e);
      }

      // 2. Fetch Volunteers
      try {
        const res = await fetch("/api/admin/applications?type=volunteers");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          for (const v of data.data) {
            combined.push({
              id: v.id,
              category: "VOLUNTEER",
              reference: v.application_reference,
              titleOrName: v.full_name || v.profiles?.full_name || "Volunteer Applicant",
              email: v.email || v.profiles?.email || "N/A",
              mobile: v.mobile || v.profiles?.mobile || "N/A",
              organizationOrCollege: v.college_name,
              programOrDetails: Array.isArray(v.preferred_divisions) ? v.preferred_divisions.join(", ") : (v.skills || "Volunteer"),
              status: v.status,
              created_at: v.created_at,
              raw: v,
            });
          }
        }
      } catch (e) {
        console.warn("Failed to fetch volunteers", e);
      }

      // 3. Fetch Colleges
      try {
        const res = await fetch("/api/admin/applications?type=colleges");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          for (const c of data.data) {
            combined.push({
              id: c.id,
              category: "COLLEGE",
              reference: c.application_reference,
              titleOrName: c.contact_person,
              email: c.email || c.college_email || "N/A",
              mobile: c.mobile || "N/A",
              organizationOrCollege: c.institution_name,
              programOrDetails: `${c.designation || 'Dean'} (${c.city || 'Telangana'})`,
              status: c.status,
              created_at: c.created_at,
              raw: c,
            });
          }
        }
      } catch (e) {
        console.warn("Failed to fetch colleges", e);
      }

      // 4. Fetch Partners
      try {
        const res = await fetch("/api/admin/applications?type=partners");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          for (const p of data.data) {
            combined.push({
              id: p.id,
              category: "PARTNER",
              reference: p.application_reference,
              titleOrName: p.contact_person,
              email: p.email,
              mobile: p.mobile,
              organizationOrCollege: p.organization_name,
              programOrDetails: p.sponsorship_tier || p.collaboration_interest || "Sponsor",
              status: p.status,
              created_at: p.created_at,
              raw: p,
            });
          }
        }
      } catch (e) {
        console.warn("Failed to fetch partners", e);
      }

      // 5. Fetch Event Registrations
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (data.success && Array.isArray(data.events)) {
          for (const evt of data.events) {
            const regRes = await fetch(`/api/events/${evt.id}/registrations`);
            const regData = await regRes.json();
            if (regData.success && Array.isArray(regData.registrations)) {
              for (const r of regData.registrations) {
                const answers = r.answers || {};
                const college = answers["College / University Name"] || answers["college"] || "Student";
                combined.push({
                  id: r.id,
                  category: "EVENT",
                  reference: r.registration_number,
                  titleOrName: r.participant_name,
                  email: r.participant_email,
                  mobile: r.participant_phone,
                  organizationOrCollege: college,
                  programOrDetails: evt.title,
                  status: r.registration_status,
                  paymentStatus: r.payment?.payment_status || (evt.is_paid ? "PENDING" : "FREE"),
                  created_at: r.registered_at,
                  raw: { ...r, eventTitle: evt.title },
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn("Failed to fetch event registrations", e);
      }

      // Sort by newest first
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setItems(combined);
    } catch (err) {
      console.error("Error loading unified registrations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Quick live test injection
  const handleAddTestRegistration = async () => {
    setTestRegLoading(true);
    setTestRegSuccess(null);
    try {
      const rand = Math.floor(1000 + Math.random() * 9000);
      const res = await fetch("/api/register/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `Test Innovator ${rand}`,
          email: `innovator.${rand}@test.cva.in`,
          mobile: `+91 98490 ${rand}`,
          collegeName: "Hyderabad Institute of Technology",
          university: "JNTUH",
          branch: "Artificial Intelligence & Data Science",
          studyYear: "3rd Year",
          city: "Hyderabad",
          interests: ["AI/ML", "Web3", "Hackathons"],
          reason: "Verifying live registration persistence and real-time Excel export.",
          password: "Password@123",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestRegSuccess(`Registered ${data.reference}! Added to registry.`);
        await fetchAllData();
      } else {
        alert(data.message || "Failed to register test user.");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding test registration.");
    } finally {
      setTestRegLoading(false);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeTab !== "ALL" && item.category !== activeTab) {
      return false;
    }
    if (statusFilter !== "ALL") {
      if (statusFilter === "APPROVED" && item.status !== "APPROVED" && item.status !== "CONFIRMED") return false;
      if (statusFilter === "PENDING" && item.status !== "PENDING" && item.status !== "UNDER_REVIEW") return false;
      if (statusFilter === "REJECTED" && item.status !== "REJECTED") return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        item.titleOrName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.mobile.includes(q) ||
        item.reference.toLowerCase().includes(q) ||
        item.organizationOrCollege.toLowerCase().includes(q) ||
        item.programOrDetails.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Category counts
  const totalCount = items.length;
  const eventCount = items.filter((i) => i.category === "EVENT").length;
  const studentCount = items.filter((i) => i.category === "STUDENT").length;
  const volunteerCount = items.filter((i) => i.category === "VOLUNTEER").length;
  const collegeCount = items.filter((i) => i.category === "COLLEGE").length;
  const partnerCount = items.filter((i) => i.category === "PARTNER").length;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20">
      {/* Top Banner */}
      <div className="bg-brand-dark text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-2">
                <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
                </Link>
                <span>/</span>
                <span className="text-brand-red font-bold">Registrations & Excel Export</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
                Unified Registrations & Excel Hub
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
                Real-time registry of all community registrations. Every registration on this website is instantly updated, saved, and ready for 1-click export to Microsoft Excel (.xlsx).
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={fetchAllData}
                className="p-2.5 rounded-lg border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
                title="Refresh registrations"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={handleAddTestRegistration}
                disabled={testRegLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold hover:bg-neutral-700 transition-colors"
                title="Register a test student to verify real-time pipeline"
              >
                <Plus className="w-4 h-4 text-brand-red" />
                <span>{testRegLoading ? "Registering..." : "Add Test Registrant"}</span>
              </button>

              <a
                href="/api/admin/export/excel?type=all"
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs sm:text-sm font-extrabold hover:bg-emerald-500 transition-all shadow-md group"
              >
                <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                <span>Download Master Excel (.xlsx)</span>
              </a>
            </div>
          </div>

          {testRegSuccess && (
            <div className="mt-4 p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-lg text-emerald-200 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {testRegSuccess}
              </span>
              <button onClick={() => setTestRegSuccess(null)} className="text-emerald-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pt-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Total Registered</div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-0.5">{totalCount}</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-1">● 100% Exportable</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-[10px] font-mono font-bold text-brand-red uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Event Attendees
            </div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-0.5">{eventCount}</div>
            <a href="/api/admin/export/excel?type=events" download className="text-[10px] text-emerald-700 hover:underline font-bold mt-1 block">
              Export Excel (.xlsx) →
            </a>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Students
            </div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-0.5">{studentCount}</div>
            <a href="/api/admin/export/excel?type=students" download className="text-[10px] text-blue-700 hover:underline font-bold mt-1 block">
              Export Excel (.xlsx) →
            </a>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
              <HandHeart className="w-3 h-3" /> Volunteers
            </div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-0.5">{volunteerCount}</div>
            <a href="/api/admin/export/excel?type=volunteers" download className="text-[10px] text-purple-700 hover:underline font-bold mt-1 block">
              Export Excel (.xlsx) →
            </a>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Colleges
            </div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-0.5">{collegeCount}</div>
            <a href="/api/admin/export/excel?type=colleges" download className="text-[10px] text-amber-700 hover:underline font-bold mt-1 block">
              Export Excel (.xlsx) →
            </a>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-[10px] font-mono font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Partners
            </div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-0.5">{partnerCount}</div>
            <a href="/api/admin/export/excel?type=partners" download className="text-[10px] text-rose-700 hover:underline font-bold mt-1 block">
              Export Excel (.xlsx) →
            </a>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-lg">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "ALL" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setActiveTab("EVENT")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "EVENT" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Events ({eventCount})
              </button>
              <button
                onClick={() => setActiveTab("STUDENT")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "STUDENT" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Students ({studentCount})
              </button>
              <button
                onClick={() => setActiveTab("VOLUNTEER")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "VOLUNTEER" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Volunteers ({volunteerCount})
              </button>
              <button
                onClick={() => setActiveTab("COLLEGE")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "COLLEGE" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Colleges ({collegeCount})
              </button>
              <button
                onClick={() => setActiveTab("PARTNER")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "PARTNER" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Partners ({partnerCount})
              </button>
            </div>

            {/* Search & Status Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone, reference..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg outline-none focus:border-neutral-900"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-neutral-900 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Confirmed / Approved</option>
                <option value="PENDING">Pending Review</option>
                <option value="REJECTED">Rejected</option>
              </select>

              {/* Direct Excel Export for Active Tab */}
              <a
                href={
                  activeTab === "ALL"
                    ? "/api/admin/export/excel?type=all"
                    : activeTab === "EVENT"
                    ? "/api/admin/export/excel?type=events"
                    : activeTab === "STUDENT"
                    ? "/api/admin/export/excel?type=students"
                    : activeTab === "VOLUNTEER"
                    ? "/api/admin/export/excel?type=volunteers"
                    : activeTab === "COLLEGE"
                    ? "/api/admin/export/excel?type=colleges"
                    : "/api/admin/export/excel?type=partners"
                }
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-xs"
                title={`Export ${activeTab} data to Excel`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Tab (.xlsx)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Live Registrations Table */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-neutral-400 text-xs font-medium flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-neutral-500" />
              <span>Loading registered entries from persistent store...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 text-xs">
              <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
              <div className="font-bold text-neutral-700">No registrations found</div>
              <p className="text-neutral-400 mt-1">Try clearing your search query or registering through the website forms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold">Reference / Pass ID</th>
                    <th className="py-3 px-4 font-bold">Participant / Contact</th>
                    <th className="py-3 px-4 font-bold">College / Institution</th>
                    <th className="py-3 px-4 font-bold">Program / Details</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Registered Date</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredItems.map((item) => (
                    <tr key={`${item.category}-${item.id}`} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Category Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            item.category === "EVENT"
                              ? "bg-rose-50 text-brand-red border border-rose-200"
                              : item.category === "STUDENT"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : item.category === "VOLUNTEER"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : item.category === "COLLEGE"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>

                      {/* Reference Number */}
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                        {item.reference}
                      </td>

                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-900">{item.titleOrName}</div>
                        <div className="text-neutral-500 text-[11px]">{item.email}</div>
                        <div className="text-neutral-400 text-[10px] font-mono">{item.mobile}</div>
                      </td>

                      {/* College / Organization */}
                      <td className="py-3 px-4 text-neutral-700 max-w-[200px] truncate" title={item.organizationOrCollege}>
                        {item.organizationOrCollege || "—"}
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 text-neutral-600 max-w-[220px] truncate" title={item.programOrDetails}>
                        {item.programOrDetails || "—"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "APPROVED" || item.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.status === "REJECTED"
                              ? "bg-neutral-100 text-neutral-600 border border-neutral-300"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {item.status === "APPROVED" || item.status === "CONFIRMED" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{item.status}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-neutral-500 text-[11px] whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold transition-colors"
                        >
                          <Eye className="w-3 h-3 text-neutral-600" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              Showing <span className="font-bold text-neutral-800">{filteredItems.length}</span> of{" "}
              <span className="font-bold text-neutral-800">{items.length}</span> total registrations
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-neutral-400">All columns match Microsoft Excel specifications</span>
              <a
                href="/api/admin/export/excel?type=all"
                download
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download Full Workbook (.xlsx)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Inspect Registration Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                  {selectedItem.category} Registration Record
                </span>
                <h3 className="text-lg font-extrabold text-neutral-900 mt-0.5">
                  {selectedItem.titleOrName}
                </h3>
                <div className="font-mono text-xs text-brand-red font-bold">
                  {selectedItem.reference}
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Email Address</div>
                  <div className="font-medium text-neutral-800">{selectedItem.email}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Mobile Number</div>
                  <div className="font-mono font-medium text-neutral-800">{selectedItem.mobile}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Institution / Organization</div>
                  <div className="font-medium text-neutral-800">{selectedItem.organizationOrCollege}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Status</div>
                  <div className="font-bold text-emerald-700">{selectedItem.status}</div>
                </div>
              </div>

              {/* Complete Raw Details */}
              <div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Submitted Metadata & Form Answers
                </div>
                <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56">
                  {JSON.stringify(selectedItem.raw, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 font-mono">
                Registered: {new Date(selectedItem.created_at).toLocaleString("en-IN")}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
