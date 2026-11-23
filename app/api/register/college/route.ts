import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateApplicationReference } from "@/lib/auth/roles";
import { sendApplicationReceivedEmail } from "@/lib/email";
import { saveCollegeRegistration } from "@/lib/store/registrations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      institutionName,
      institutionType,
      website,
      collegeEmail,
      contactPerson,
      designation,
      mobile,
      city,
      state,
      studentStrength,
      collaborationAreas,
      additionalInformation,
      password,
    } = body;

    // Server-side validation
    if (!institutionName || !collegeEmail || !contactPerson || !designation || !mobile || !city) {
      return NextResponse.json(
        { success: false, message: "Please fill in all mandatory institutional fields." },
        { status: 400 }
      );
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const reference = generateApplicationReference("COL");

    // 1. Immediately save into our persistent store
    const collegeRecord = saveCollegeRegistration({
      application_reference: reference,
      institution_name: institutionName,
      contact_person: contactPerson,
      designation: designation,
      email: collegeEmail,
      mobile: mobile,
      city: city,
      state: state || "Telangana",
      approximate_students: studentStrength || 1000,
      mou_interested: true,
      message: additionalInformation || (collaborationAreas ? `Collaboration: ${collaborationAreas.join(", ")}` : ""),
      status: "PENDING",
    });

    // 2. Attempt Supabase Auth & DB sync if credentials are configured
    try {
      const adminSupabase = createAdminClient();
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: collegeEmail,
        password: password || "CvaCollege@2026",
        email_confirm: true,
        user_metadata: { full_name: contactPerson, institution_name: institutionName, role: "COLLEGE" },
      });

      if (!authError && authData?.user) {
        const userId = authData.user.id;
        await adminSupabase.from("profiles").upsert({
          id: userId,
          full_name: contactPerson,
          email: collegeEmail,
          mobile,
          role: "COLLEGE",
        });

        await adminSupabase.from("colleges").insert({
          user_id: userId,
          application_reference: reference,
          institution_name: institutionName,
          institution_type: institutionType || "Autonomous College",
          website: website || null,
          city,
          state: state || "Telangana",
          student_strength: studentStrength || "1000-5000",
          collaboration_areas: Array.isArray(collaborationAreas) ? collaborationAreas : [],
          additional_information: additionalInformation || null,
          status: "PENDING",
        });
      }
    } catch (dbErr) {
      console.warn("[Register College DB Sync Fallback]", dbErr);
    }

    // 3. Send confirmation email
    try {
      await sendApplicationReceivedEmail({
        type: "COLLEGE",
        fullName: contactPerson,
        applicantEmail: collegeEmail,
        reference,
        institutionOrOrg: institutionName,
      });
    } catch (emailErr) {
      console.warn("[Register College Email Warning]", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Institutional partnership proposal submitted and saved! Details are recorded in the admin registry.",
        reference,
        registration: collegeRecord,
        redirectUrl: "/dashboard/college",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Register College Exception]", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
