import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashQrToken } from "@/lib/qr";
import { checkInParticipantByToken } from "@/lib/events/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json().catch(() => ({}));
    const { qrToken, scanMethod = "CAMERA" } = body;

    if (!qrToken || typeof qrToken !== "string" || qrToken.trim() === "") {
      return NextResponse.json(
        { 
          success: false, 
          result: "INVALID QR CODE",
          message: "Please provide a valid QR pass or token." 
        },
        { status: 400 }
      );
    }

    let cleanToken = qrToken.trim();
    if (cleanToken.includes("token=")) {
      try {
        const u = new URL(cleanToken.startsWith("http") ? cleanToken : "http://localhost" + cleanToken);
        cleanToken = u.searchParams.get("token") || cleanToken;
      } catch {
        const m = cleanToken.match(/token=([a-zA-Z0-9_\-\.]+)/);
        if (m) cleanToken = m[1];
      }
    }

    // Try Authenticating User
    let user: any = null;
    try {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    } catch {
      user = null;
    }

    // If not authenticated or in standalone dev mode, check in directly via in-memory/fallback store
    if (!user) {
      const outcome = await checkInParticipantByToken({
        token: cleanToken,
        eventId,
        volunteerName: "Gate Scanner",
        scanMethod,
      });

      const statusCode = outcome.success ? 200 : (outcome.result === "ALREADY CHECKED IN" ? 409 : 400);
      return NextResponse.json(outcome, { status: statusCode });
    }

    const tokenHash = hashQrToken(cleanToken);
    const adminClient = createAdminClient();

    // Verify Volunteer Authorization for this specific event
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "ADMIN";

    if (!isAdmin) {
      const { data: volunteerApp } = await adminClient
        .from("event_volunteer_applications")
        .select("status, assigned_responsibilities")
        .eq("event_id", eventId)
        .eq("volunteer_id", user.id)
        .single();

      if (
        !volunteerApp ||
        volunteerApp.status !== "APPROVED" ||
        !volunteerApp.assigned_responsibilities?.includes("QR_SCANNING")
      ) {
        // Record unauthorized attempt in scan logs
        await adminClient.from("event_scan_logs").insert({
          event_id: eventId,
          scanned_by: user.id,
          scan_result: "UNAUTHORIZED_SCANNER",
          token_hash: tokenHash,
          scan_method: scanMethod,
          error_message: "User does not have approved QR_SCANNING responsibility for this event.",
        });

        return NextResponse.json(
          {
            success: false,
            result: "UNAUTHORIZED_SCANNER",
            message: "You are not authorized to scan passes for this event. Requires approved QR_SCANNING role.",
          },
          { status: 403 }
        );
      }
    }

    // Try atomic PostgreSQL function `perform_event_check_in`
    try {
      const { data: rpcData, error: rpcError } = await adminClient.rpc(
        "perform_event_check_in",
        {
          p_event_id: eventId,
          p_qr_token: cleanToken,
          p_volunteer_id: user.id,
          p_scan_method: scanMethod,
        }
      );

      if (!rpcError && rpcData) {
        const statusCode = rpcData.success ? 200 : 400;
        return NextResponse.json(rpcData, { status: statusCode });
      }
    } catch (rpcErr) {
      console.warn("[RPC perform_event_check_in error, falling back]:", rpcErr);
    }

    // Fallback store check-in
    const fallbackOutcome = await checkInParticipantByToken({
      token: cleanToken,
      eventId,
      volunteerName: profile?.role || "Volunteer",
      scanMethod,
    });

    const statusCode = fallbackOutcome.success ? 200 : (fallbackOutcome.result === "ALREADY CHECKED IN" ? 409 : 400);
    return NextResponse.json(fallbackOutcome, { status: statusCode });
  } catch (err: unknown) {
    console.error("[Check-In Action Error]", err);
    return NextResponse.json(
      { success: false, result: "SERVER_ERROR", message: "Error performing check-in." },
      { status: 500 }
    );
  }
}
