import * as XLSX from "xlsx";
import { 
  getAllCommunityRegistrations, 
  StudentRegistrationRecord, 
  VolunteerRegistrationRecord, 
  CollegeRegistrationRecord, 
  PartnerRegistrationRecord 
} from "@/lib/store/registrations";
import { getEvents, getEventRegistrations } from "@/lib/events/store";
import { EventItem, EventRegistration } from "@/lib/events/types";

// Helper to calculate column widths
function calculateColWidths(data: any[]): { wch: number }[] {
  if (!data || data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => {
    let maxLen = key.length;
    for (const row of data) {
      const val = row[key];
      const str = val !== null && val !== undefined ? String(val) : "";
      if (str.length > maxLen) {
        maxLen = str.length;
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
  });
}

export async function generateMasterExcelBuffer(): Promise<Buffer> {
  const communityData = getAllCommunityRegistrations();
  const events = await getEvents({});

  // 1. Collect all Event Registrations
  const allEventRegistrations: { event: EventItem; reg: EventRegistration }[] = [];
  for (const event of events) {
    try {
      const regs = await getEventRegistrations(event.id);
      for (const reg of regs) {
        allEventRegistrations.push({ event, reg });
      }
    } catch (err) {
      console.warn(`[Excel Export] Error fetching registrations for event ${event.id}:`, err);
    }
  }

  const wb = XLSX.utils.book_new();

  // ---------------------------------------------------------------------------
  // SHEET 1: Master Summary (All Registrations Combined)
  // ---------------------------------------------------------------------------
  const summaryRows: any[] = [];

  // Add Event Registrants
  for (const { event, reg } of allEventRegistrations) {
    const answersObj = reg.answers || {};
    const college = answersObj["College / University Name"] || answersObj["college"] || answersObj["collegeName"] || "N/A";
    summaryRows.push({
      "Category": "EVENT PARTICIPANT",
      "Reference / Pass ID": reg.registration_number,
      "Name": reg.participant_name,
      "Email Address": reg.participant_email,
      "Phone Number": reg.participant_phone,
      "College / Organization": college,
      "Program / Event Title": event.title,
      "Status": reg.registration_status,
      "Payment Status": reg.payment?.payment_status || (event.is_paid ? "PENDING" : "FREE"),
      "Registered Date": new Date(reg.registered_at).toLocaleString("en-IN"),
    });
  }

  // Add Students
  for (const s of communityData.students) {
    summaryRows.push({
      "Category": "STUDENT MEMBER",
      "Reference / Pass ID": s.application_reference,
      "Name": s.full_name,
      "Email Address": s.email,
      "Phone Number": s.mobile,
      "College / Organization": s.college_name,
      "Program / Event Title": `${s.branch} (${s.study_year})`,
      "Status": s.status,
      "Payment Status": "N/A (COMMUNITY)",
      "Registered Date": new Date(s.created_at).toLocaleString("en-IN"),
    });
  }

  // Add Volunteers
  for (const v of communityData.volunteers) {
    summaryRows.push({
      "Category": "VOLUNTEER",
      "Reference / Pass ID": v.application_reference,
      "Name": v.full_name,
      "Email Address": v.email,
      "Phone Number": v.mobile,
      "College / Organization": v.college_name,
      "Program / Event Title": v.preferred_divisions.join(", "),
      "Status": v.status,
      "Payment Status": "N/A (VOLUNTEER)",
      "Registered Date": new Date(v.created_at).toLocaleString("en-IN"),
    });
  }

  // Add Colleges
  for (const c of communityData.colleges) {
    summaryRows.push({
      "Category": "COLLEGE PARTNER",
      "Reference / Pass ID": c.application_reference,
      "Name": c.contact_person,
      "Email Address": c.email,
      "Phone Number": c.mobile,
      "College / Organization": c.institution_name,
      "Program / Event Title": `Institutional Partnership (${c.city})`,
      "Status": c.status,
      "Payment Status": "MOU PROPOSAL",
      "Registered Date": new Date(c.created_at).toLocaleString("en-IN"),
    });
  }

  // Add Corporate Partners
  for (const p of communityData.partners) {
    summaryRows.push({
      "Category": "CORPORATE PARTNER",
      "Reference / Pass ID": p.application_reference,
      "Name": p.contact_person,
      "Email Address": p.email,
      "Phone Number": p.mobile,
      "College / Organization": p.organization_name,
      "Program / Event Title": p.sponsorship_tier || "Industry Sponsor",
      "Status": p.status,
      "Payment Status": "SPONSORSHIP",
      "Registered Date": new Date(p.created_at).toLocaleString("en-IN"),
    });
  }

  // Fallback if empty
  if (summaryRows.length === 0) {
    summaryRows.push({
      "Notice": "No registrations recorded yet.",
      "Date": new Date().toLocaleString("en-IN")
    });
  }

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary["!cols"] = calculateColWidths(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, "All Registrations");

  // ---------------------------------------------------------------------------
  // SHEET 2: Event Participants
  // ---------------------------------------------------------------------------
  const eventRows = allEventRegistrations.map(({ event, reg }) => {
    const qAnswers = reg.answers || {};
    const college = qAnswers["College / University Name"] || qAnswers["college"] || "";
    const branch = qAnswers["Branch & Year of Study"] || qAnswers["branch"] || "";
    const skills = Array.isArray(qAnswers["Primary Technical Skills"]) ? qAnswers["Primary Technical Skills"].join(", ") : (qAnswers["skills"] || "");
    const github = qAnswers["GitHub or Portfolio URL"] || qAnswers["github"] || "";
    const tshirt = qAnswers["T-Shirt Size for Hackathon Kit"] || "";

    return {
      "Event Title": event.title,
      "Registration ID": reg.registration_number,
      "Participant Name": reg.participant_name,
      "Email Address": reg.participant_email,
      "Phone Number": reg.participant_phone,
      "Registration Status": reg.registration_status,
      "Event Fee (INR)": reg.payment?.amount ?? (event.is_paid ? event.fee_amount : 0),
      "Payment Status": reg.payment?.payment_status ?? (event.is_paid ? "PENDING" : "FREE"),
      "Payment Reference (UTR)": reg.payment?.payment_reference || "N/A",
      "Is Team Event": reg.is_team_registration ? "YES" : "NO",
      "Team Name": reg.team_name || "N/A",
      "College": college,
      "Branch & Year": branch,
      "Technical Skills": skills,
      "GitHub / Portfolio": github,
      "T-Shirt Size": tshirt,
      "QR Token": reg.qr_token || "N/A",
      "Registered Timestamp": new Date(reg.registered_at).toLocaleString("en-IN"),
    };
  });

  if (eventRows.length > 0) {
    const wsEvents = XLSX.utils.json_to_sheet(eventRows);
    wsEvents["!cols"] = calculateColWidths(eventRows);
    XLSX.utils.book_append_sheet(wb, wsEvents, "Event Participants");
  }

  // ---------------------------------------------------------------------------
  // SHEET 3: Student Members
  // ---------------------------------------------------------------------------
  const studentRows = communityData.students.map((s) => ({
    "Application Reference": s.application_reference,
    "Full Name": s.full_name,
    "Email Address": s.email,
    "Mobile Number": s.mobile,
    "College Name": s.college_name,
    "University": s.university || "N/A",
    "Branch / Specialization": s.branch,
    "Study Year": s.study_year,
    "City": s.city,
    "Areas of Interest": s.interests ? s.interests.join("; ") : "",
    "Reason for Joining": s.reason,
    "Application Status": s.status,
    "Submission Date": new Date(s.created_at).toLocaleString("en-IN"),
  }));

  if (studentRows.length > 0) {
    const wsStudents = XLSX.utils.json_to_sheet(studentRows);
    wsStudents["!cols"] = calculateColWidths(studentRows);
    XLSX.utils.book_append_sheet(wb, wsStudents, "Student Members");
  }

  // ---------------------------------------------------------------------------
  // SHEET 4: Volunteers
  // ---------------------------------------------------------------------------
  const volunteerRows = communityData.volunteers.map((v) => ({
    "Application Reference": v.application_reference,
    "Full Name": v.full_name,
    "Email Address": v.email,
    "Mobile Number": v.mobile,
    "College Name": v.college_name,
    "Branch": v.branch,
    "Year of Study": v.study_year,
    "Preferred Divisions": v.preferred_divisions ? v.preferred_divisions.join("; ") : "",
    "Skills & Expertise": v.skills,
    "Weekly Availability": v.availability,
    "Motivation": v.motivation,
    "Status": v.status,
    "Submission Date": new Date(v.created_at).toLocaleString("en-IN"),
  }));

  if (volunteerRows.length > 0) {
    const wsVolunteers = XLSX.utils.json_to_sheet(volunteerRows);
    wsVolunteers["!cols"] = calculateColWidths(volunteerRows);
    XLSX.utils.book_append_sheet(wb, wsVolunteers, "Volunteers");
  }

  // ---------------------------------------------------------------------------
  // SHEET 5: College Partners
  // ---------------------------------------------------------------------------
  const collegeRows = communityData.colleges.map((c) => ({
    "Application Reference": c.application_reference,
    "Institution Name": c.institution_name,
    "Point of Contact": c.contact_person,
    "Designation": c.designation,
    "Official Email": c.email,
    "Mobile Number": c.mobile,
    "City": c.city,
    "State": c.state,
    "Approximate Students": c.approximate_students || "N/A",
    "MOU Partnership Interest": c.mou_interested ? "YES" : "NO",
    "Proposal Message": c.message || "",
    "Status": c.status,
    "Submission Date": new Date(c.created_at).toLocaleString("en-IN"),
  }));

  if (collegeRows.length > 0) {
    const wsColleges = XLSX.utils.json_to_sheet(collegeRows);
    wsColleges["!cols"] = calculateColWidths(collegeRows);
    XLSX.utils.book_append_sheet(wb, wsColleges, "College Partners");
  }

  // ---------------------------------------------------------------------------
  // SHEET 6: Corporate Partners
  // ---------------------------------------------------------------------------
  const partnerRows = communityData.partners.map((p) => ({
    "Application Reference": p.application_reference,
    "Organization Name": p.organization_name,
    "Industry Sector": p.industry || "Technology",
    "Point of Contact": p.contact_person,
    "Designation": p.designation,
    "Official Email": p.email,
    "Mobile Number": p.mobile,
    "Website": p.website || "N/A",
    "Sponsorship Tier": p.sponsorship_tier || "Custom Partner",
    "Interest Areas": p.interest_areas ? p.interest_areas.join("; ") : "",
    "Message": p.message || "",
    "Status": p.status,
    "Submission Date": new Date(p.created_at).toLocaleString("en-IN"),
  }));

  if (partnerRows.length > 0) {
    const wsPartners = XLSX.utils.json_to_sheet(partnerRows);
    wsPartners["!cols"] = calculateColWidths(partnerRows);
    XLSX.utils.book_append_sheet(wb, wsPartners, "Corporate Partners");
  }

  // Output as binary buffer
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function generateCategoryExcelBuffer(category: string, filterId?: string): Promise<{ buffer: Buffer; filename: string }> {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().split("T")[0];
  let rows: any[] = [];
  let sheetName = "Registrations";
  let filename = `COMMUNITY_VA_${category}_${dateStr}.xlsx`;

  if (category === "students") {
    sheetName = "Student Members";
    filename = `COMMUNITY_VA_Students_${dateStr}.xlsx`;
    const students = getAllCommunityRegistrations().students;
    rows = students.map((s) => ({
      "Application Reference": s.application_reference,
      "Full Name": s.full_name,
      "Email Address": s.email,
      "Mobile Number": s.mobile,
      "College Name": s.college_name,
      "University": s.university || "N/A",
      "Branch": s.branch,
      "Study Year": s.study_year,
      "City": s.city,
      "Interests": s.interests ? s.interests.join(", ") : "",
      "Reason for Joining": s.reason,
      "Status": s.status,
      "Submission Date": new Date(s.created_at).toLocaleString("en-IN"),
    }));
  } else if (category === "volunteers") {
    sheetName = "Volunteers";
    filename = `COMMUNITY_VA_Volunteers_${dateStr}.xlsx`;
    const volunteers = getAllCommunityRegistrations().volunteers;
    rows = volunteers.map((v) => ({
      "Application Reference": v.application_reference,
      "Full Name": v.full_name,
      "Email Address": v.email,
      "Mobile Number": v.mobile,
      "College Name": v.college_name,
      "Branch": v.branch,
      "Year": v.study_year,
      "Divisions": v.preferred_divisions ? v.preferred_divisions.join(", ") : "",
      "Skills": v.skills,
      "Availability": v.availability,
      "Motivation": v.motivation,
      "Status": v.status,
      "Submission Date": new Date(v.created_at).toLocaleString("en-IN"),
    }));
  } else if (category === "colleges") {
    sheetName = "College Partners";
    filename = `COMMUNITY_VA_Colleges_${dateStr}.xlsx`;
    const colleges = getAllCommunityRegistrations().colleges;
    rows = colleges.map((c) => ({
      "Application Reference": c.application_reference,
      "Institution Name": c.institution_name,
      "Contact Person": c.contact_person,
      "Designation": c.designation,
      "Email": c.email,
      "Mobile": c.mobile,
      "City": c.city,
      "State": c.state,
      "Approx Students": c.approximate_students || "N/A",
      "MOU Interested": c.mou_interested ? "YES" : "NO",
      "Proposal Message": c.message || "",
      "Status": c.status,
      "Submission Date": new Date(c.created_at).toLocaleString("en-IN"),
    }));
  } else if (category === "partners") {
    sheetName = "Corporate Partners";
    filename = `COMMUNITY_VA_Partners_${dateStr}.xlsx`;
    const partners = getAllCommunityRegistrations().partners;
    rows = partners.map((p) => ({
      "Application Reference": p.application_reference,
      "Organization Name": p.organization_name,
      "Industry": p.industry || "Tech",
      "Contact Person": p.contact_person,
      "Designation": p.designation,
      "Email": p.email,
      "Mobile": p.mobile,
      "Website": p.website || "N/A",
      "Tier": p.sponsorship_tier || "Gold",
      "Focus Areas": p.interest_areas ? p.interest_areas.join(", ") : "",
      "Status": p.status,
      "Submission Date": new Date(p.created_at).toLocaleString("en-IN"),
    }));
  } else if (category === "events") {
    sheetName = "Event Attendees";
    const events = await getEvents({});
    const targetEvents = filterId ? events.filter(e => e.id === filterId || e.slug === filterId) : events;
    filename = filterId ? `COMMUNITY_VA_Event_${filterId}_${dateStr}.xlsx` : `COMMUNITY_VA_All_Events_${dateStr}.xlsx`;

    for (const event of targetEvents) {
      const regs = await getEventRegistrations(event.id);
      for (const reg of regs) {
        rows.push({
          "Event": event.title,
          "Registration ID": reg.registration_number,
          "Participant Name": reg.participant_name,
          "Email Address": reg.participant_email,
          "Phone Number": reg.participant_phone,
          "Registration Status": reg.registration_status,
          "Payment Status": reg.payment?.payment_status ?? (event.is_paid ? "PENDING" : "FREE"),
          "Amount (INR)": reg.payment?.amount ?? (event.is_paid ? event.fee_amount : 0),
          "Payment UTR": reg.payment?.payment_reference || "N/A",
          "QR Token": reg.qr_token,
          "Registered At": new Date(reg.registered_at).toLocaleString("en-IN"),
        });
      }
    }
  }

  if (rows.length === 0) {
    rows.push({
      "Status": "No registered records found for this category.",
      "Generated At": new Date().toLocaleString("en-IN")
    });
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = calculateColWidths(rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return { buffer, filename };
}
