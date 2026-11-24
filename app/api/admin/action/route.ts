import { isAuthenticatedAdminServer } from "@/lib/auth/admin-session";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendVolunteerStatusEmail, sendCollegeStatusEmail } from "@/lib/email";
import { updateRegistrationStatus } from "@/lib/store/registrations";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedAdminServer())) {
    return NextResponse.json({ success: false, message: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      applicationType, // 'VOLUNTEER' | 'COLLEGE' | 'STUDENT' | 'PARTNER'
      applicationId,
      newStatus, // 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'
      adminNote,
      rejectionReason,
      assignedDivision,
    } = body;

    if (!applicationType || !applicationId || !newStatus) {
      return NextResponse.json(
        { success: false, message: "Missing required approval action parameters." },
        { status: 400 }
      );
    }

    // Update persistent store immediately
    updateRegistrationStatus(applicationType, applicationId, newStatus);

    // Try DB updates if user has active admin session
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const adminClient = createAdminClient();
        const tableName =
          applicationType === "VOLUNTEER"
            ? "volunteers"
            : applicationType === "COLLEGE"
            ? "colleges"
            : applicationType === "PARTNER"
            ? "partners"
            : "students";

        const updatePayload: Record<string, unknown> = {
          status: newStatus,
          updated_at: new Date().toISOString(),
        };

        if (applicationType === "VOLUNTEER" && assignedDivision) {
          updatePayload.assigned_division = assignedDivision;
        }

        await adminClient
          .from(tableName)
          .update(updatePayload)
          .eq("id", applicationId);

        await adminClient.from("application_status_history").insert({
          application_type: applicationType,
          application_id: applicationId,
          previous_status: null,
          new_status: newStatus,
          changed_by: user.id,
          admin_note: adminNote || null,
          rejection_reason: rejectionReason || null,
        });
      }
    } catch (dbErr) {
      console.warn("[Admin Action DB Fallback]", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Application ${newStatus.toLowerCase()} successfully and updated in the registry.`,
      status: newStatus,
    });
  } catch (err: unknown) {
    console.error("[Admin Action Error]", err);
    return NextResponse.json(
      { success: false, message: "Failed to execute administrative action." },
      { status: 500 }
    );
  }
}
