import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateApplicationReference } from "@/lib/auth/roles";
import { sendApplicationReceivedEmail } from "@/lib/email";
import { saveStudentRegistration } from "@/lib/store/registrations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      mobile,
      collegeName,
      university,
      branch,
      studyYear,
      city,
      interests,
      reason,
      password,
    } = body;

    // Server-side validation
    if (!fullName || !email || !mobile || !collegeName || !branch || !studyYear || !city || !reason) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const reference = generateApplicationReference("STU");

    // 1. Immediately save into our high-reliability persistent registration store
    const studentRecord = saveStudentRegistration({
      application_reference: reference,
      full_name: fullName,
      email,
      mobile,
      college_name: collegeName,
      university: university || undefined,
      branch,
      study_year: studyYear,
      city: city || "Hyderabad",
      interests: Array.isArray(interests) ? interests : [],
      reason,
      status: "PENDING",
    });

    // 2. Attempt Supabase Auth & DB sync if credentials are configured
    try {
      const adminSupabase = createAdminClient();
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email,
        password: password || "CvaStudent@2026",
        email_confirm: true,
        user_metadata: { full_name: fullName, role: "STUDENT" },
      });

      if (!authError && authData?.user) {
        const userId = authData.user.id;
        await adminSupabase.from("profiles").upsert({
          id: userId,
          full_name: fullName,
          email,
          mobile,
          role: "STUDENT",
        });

        await adminSupabase.from("students").insert({
          user_id: userId,
          application_reference: reference,
          college_name: collegeName,
          university: university || null,
          branch,
          study_year: studyYear,
          city: city || "Hyderabad",
          interests: Array.isArray(interests) ? interests : [],
          reason,
          status: "PENDING",
        });
      }
    } catch (dbErr) {
      console.warn("[Register Student DB Sync Fallback]", dbErr);
    }

    // 3. Send confirmation email
    try {
      await sendApplicationReceivedEmail({
        type: "STUDENT",
        fullName,
        applicantEmail: email,
        reference,
        institutionOrOrg: collegeName,
      });
    } catch (emailErr) {
      console.warn("[Register Student Email Warning]", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Student registration submitted and saved successfully! Your details are recorded and accessible in the admin export center.",
        reference,
        registration: studentRecord,
        redirectUrl: "/dashboard/student",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Register Student Exception]", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
