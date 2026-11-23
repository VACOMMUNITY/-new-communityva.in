import { NextRequest, NextResponse } from "next/server";
import { getEventBySlugOrId, getEventRegistrations } from "@/lib/events/store";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "xlsx").toLowerCase();

    const event = await getEventBySlugOrId(id);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    const registrations = await getEventRegistrations(event.id);
    const questions = event.questions || [];

    const dateStr = new Date().toISOString().split("T")[0];
    const safeSlug = event.slug.replace(/[^a-zA-Z0-9_-]/g, "_");

    // Build structured row data
    const structuredRows = registrations.map((reg) => {
      const payment = reg.payment;
      const row: Record<string, any> = {
        "Registration ID": reg.registration_number,
        "Participant Name": reg.participant_name,
        "Email Address": reg.participant_email,
        "Phone Number": reg.participant_phone,
        "Registration Date": new Date(reg.registered_at).toLocaleString("en-IN"),
        "Registration Status": reg.registration_status,
        "Event Fee (INR)": payment?.amount ?? (event.is_paid ? event.fee_amount : 0),
        "Payment Status": payment?.payment_status ?? (event.is_paid ? "PENDING" : "FREE"),
        "Payment UTR": payment?.payment_reference || "N/A",
        "Team Registration": reg.is_team_registration ? "YES" : "NO",
        "Team Name": reg.team_name || "N/A",
        "QR Token": reg.qr_token || "N/A",
      };

      // Map dynamic question answers
      for (const q of questions) {
        const rawAns = reg.answers[q.id] ?? reg.answers[q.label] ?? "";
        row[q.label] = Array.isArray(rawAns) ? rawAns.join("; ") : String(rawAns);
      }

      return row;
    });

    if (format === "csv") {
      // Build CSV
      const headers = [
        "Registration ID",
        "Participant Name",
        "Email Address",
        "Phone Number",
        "Registration Date",
        "Registration Status",
        "Event Fee (INR)",
        "Payment Status",
        "Payment Reference (UTR)",
        "Team Registration",
        "Team Name",
        ...questions.map(q => `"${q.label.replace(/"/g, '""')}"`)
      ];

      const csvRows = registrations.map(reg => {
        const payment = reg.payment;
        const questionAnswers = questions.map(q => {
          const rawAns = reg.answers[q.id] ?? reg.answers[q.label] ?? "";
          const formatted = Array.isArray(rawAns) ? rawAns.join("; ") : String(rawAns);
          return `"${formatted.replace(/"/g, '""')}"`;
        });

        return [
          `"${reg.registration_number}"`,
          `"${reg.participant_name.replace(/"/g, '""')}"`,
          `"${reg.participant_email.replace(/"/g, '""')}"`,
          `"${reg.participant_phone.replace(/"/g, '""')}"`,
          `"${new Date(reg.registered_at).toLocaleString("en-IN")}"`,
          `"${reg.registration_status}"`,
          `"${payment?.amount ?? (event.is_paid ? event.fee_amount : 0)}"`,
          `"${payment?.payment_status ?? (event.is_paid ? 'PENDING' : 'FREE')}"`,
          `"${payment?.payment_reference ? payment.payment_reference.replace(/"/g, '""') : 'N/A'}"`,
          `"${reg.is_team_registration ? 'YES' : 'NO'}"`,
          `"${(reg.team_name || '').replace(/"/g, '""')}"`,
          ...questionAnswers
        ].join(",");
      });

      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const filename = `COMMUNITY_VA_${safeSlug}_participants_${dateStr}.csv`;

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Default: Return genuine Microsoft Excel (.xlsx) file
    const wb = XLSX.utils.book_new();
    const rows = structuredRows.length > 0 ? structuredRows : [{
      "Status": "No registered participants yet.",
      "Event Title": event.title,
      "Date": new Date().toLocaleString("en-IN"),
    }];

    const ws = XLSX.utils.json_to_sheet(rows);
    
    // Auto column widths
    const keys = Object.keys(rows[0]);
    ws["!cols"] = keys.map(k => {
      let maxLen = k.length;
      for (const r of rows) {
        const val = r[k] !== undefined && r[k] !== null ? String(r[k]) : "";
        if (val.length > maxLen) maxLen = val.length;
      }
      return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
    });

    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const filename = `COMMUNITY_VA_${safeSlug}_participants_${dateStr}.xlsx`;

    return new Response(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("[API /api/events/[id]/registrations/export GET Error]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to generate export file" },
      { status: 500 }
    );
  }
}
