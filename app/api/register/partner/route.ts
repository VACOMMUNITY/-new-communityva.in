import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateApplicationReference } from "@/lib/auth/roles";
import { sendApplicationReceivedEmail } from "@/lib/email";
import { savePartnerRegistration } from "@/lib/store/registrations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationName,
      website,
      contactPerson,
      email,
      mobile,
      organizationType,
      collaborationInterest,
      message,
    } = body;

    if (!organizationName || !contactPerson || !email || !mobile) {
      return NextResponse.json(
        { success: false, message: "Please fill in all mandatory collaboration fields." },
        { status: 400 }
      );
    }

    const reference = generateApplicationReference("PAR");

    // 1. Immediately save into our persistent store
    const partnerRecord = savePartnerRegistration({
      application_reference: reference,
      organization_name: organizationName,
      industry: organizationType || "Technology & Ecosystem",
      contact_person: contactPerson,
      designation: "Partnership Lead",
      email: email,
      mobile: mobile,
      website: website || "",
      sponsorship_tier: collaborationInterest || "General Partner",
      interest_areas: collaborationInterest ? [collaborationInterest] : [],
      message: message || "",
      status: "PENDING",
    });

    // 2. Attempt Supabase insert if credentials are valid
    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from("partners").insert({
        application_reference: reference,
        organization_name: organizationName,
        website: website || "",
        contact_person: contactPerson,
        email,
        mobile,
        organization_type: organizationType || "Enterprise",
        collaboration_interest: collaborationInterest || "Ecosystem Partner",
        message: message || "",
        status: "PENDING",
      });
    } catch (dbErr) {
      console.warn("[Register Partner DB Sync Fallback]", dbErr);
    }

    // 3. Send email confirmation
    try {
      await sendApplicationReceivedEmail({
        type: "PARTNER",
        fullName: contactPerson,
        applicantEmail: email,
        reference,
        institutionOrOrg: organizationName,
      });
    } catch (emailErr) {
      console.warn("[Register Partner Email Warning]", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Corporate partnership proposal received and saved! Recorded in admin registry.",
        reference,
        registration: partnerRecord,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Register Partner Exception]", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
