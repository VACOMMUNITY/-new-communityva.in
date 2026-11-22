import { NextRequest, NextResponse } from "next/server";
import { lookupRegistrationByToken, checkInParticipantByToken } from "@/lib/events/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || searchParams.get("reg");
    const eventId = searchParams.get("event") || searchParams.get("eventId") || undefined;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing pass token or registration number." },
        { status: 400 }
      );
    }

    const result = await lookupRegistrationByToken(token, eventId);

    if (!result.found || !result.registration) {
      return NextResponse.json(
        {
          success: false,
          result: "NOT_FOUND",
          message: "No registered pass found for this token. Please ensure this is an official COMMUNITY.VA ticket.",
        },
        { status: 404 }
      );
    }

    const reg = result.registration;
    const evt = result.event;
    const member = result.teamMember;

    return NextResponse.json({
      success: true,
      found: true,
      registrationId: reg.id,
      registrationNumber: reg.registration_number,
      participantName: member ? member.member_name : reg.participant_name,
      participantEmail: member ? member.email || reg.participant_email : reg.participant_email,
      participantPhone: member ? member.phone || reg.participant_phone : reg.participant_phone,
      isTeam: Boolean(reg.is_team_registration),
      teamName: reg.team_name,
      teamMembersCount: reg.team_members?.length || 1,
      college: reg.answers?.["College / University Name"] || reg.answers?.["q1"] || reg.answers?.["q201"] || null,
      status: reg.registration_status,
      isCheckedIn: result.isCheckedIn,
      checkedInAt: result.checkedInAt || null,
      event: evt ? {
        id: evt.id,
        title: evt.title,
        venue: evt.venue,
        eventStart: evt.event_start,
        eventEnd: evt.event_end,
        category: evt.category,
        isPaid: evt.is_paid,
        feeAmount: evt.fee_amount,
      } : null,
    });
  } catch (err: any) {
    console.error("[Verify Pass GET Error]", err);
    return NextResponse.json(
      { success: false, message: "Server error retrieving pass verification details." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, eventId, volunteerName, scanMethod = "CAMERA" } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, result: "INVALID QR CODE", message: "Pass token is required." },
        { status: 400 }
      );
    }

    const outcome = await checkInParticipantByToken({
      token,
      eventId,
      volunteerName: volunteerName || "Official Gate Scanner",
      scanMethod,
    });

    const statusCode = outcome.success ? 200 : (outcome.result === "ALREADY CHECKED IN" ? 409 : 400);
    return NextResponse.json(outcome, { status: statusCode });
  } catch (err: any) {
    console.error("[Verify Pass POST Error]", err);
    return NextResponse.json(
      { success: false, result: "SERVER_ERROR", message: "Failed to process pass check-in." },
      { status: 500 }
    );
  }
}
