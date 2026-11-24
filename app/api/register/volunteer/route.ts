import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateApplicationReference } from "@/lib/auth/roles";
import { sendApplicationReceivedEmail } from "@/lib/email";
import { saveVolunteerRegistration } from "@/lib/store/registrations";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      mobile,
      collegeName,
      branch,
      studyYear,
      preferredDivisions,
      skills,
      availability,
      motivation,
      password,
    } = body;

    // Server-side validation
    if (!fullName || !email || !mobile || !collegeName || !branch || !studyYear || !skills || !availability || !motivation) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required volunteer application fields." },
        { status: 400 }
      );
    }

    if (!preferredDivisions || !Array.isArray(preferredDivisions) || preferredDivisions.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please select at least one preferred volunteer division." },
        { status: 400 }
      );
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const reference = generateApplicationReference("VOL");

    // 1. Immediately save into our persistent store
    const volunteerRecord = saveVolunteerRegistration({
      application_reference: reference,
      full_name: fullName,
      email,
      mobile,
      college_name: collegeName,
      branch,
      study_year: studyYear,
      preferred_divisions: preferredDivisions,
      skills,
      availability,
      motivation,
      status: "PENDING",
    });

    // 2. Attempt Supabase Auth & DB sync if credentials are configured
    try {
      const adminSupabase = createAdminClient();
      const generatedPassword = password || crypto.randomBytes(16).toString("hex");
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName, role: "VOLUNTEER" },
      });

      if (!authError && authData?.user) {
        const userId = authData.user.id;
        await adminSupabase.from("profiles").upsert({
          id: userId,
          full_name: fullName,
          email,
          mobile,
          role: "VOLUNTEER",
        });

        await adminSupabase.from("volunteers").insert({
          user_id: userId,
          application_reference: reference,
          college_name: collegeName,
          branch,
          study_year: studyYear,
          preferred_divisions: preferredDivisions,
          skills,
          availability,
          motivation,
          status: "PENDING",
        });
      }
    } catch (dbErr) {
      console.warn("[Register Volunteer DB Sync Fallback]", dbErr);
    }

    // 3. Send confirmation email
    try {
      await sendApplicationReceivedEmail({
        type: "VOLUNTEER",
        fullName,
        applicantEmail: email,
        reference,
        institutionOrOrg: collegeName,
      });
    } catch (emailErr) {
      console.warn("[Register Volunteer Email Warning]", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Volunteer application submitted and saved successfully! Your profile is recorded and exportable in the admin portal.",
        reference,
        registration: volunteerRecord,
        redirectUrl: "/dashboard/volunteer",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Register Volunteer Exception]", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
