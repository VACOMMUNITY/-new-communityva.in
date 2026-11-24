import { NextRequest, NextResponse } from "next/server";
import { generateMasterExcelBuffer, generateCategoryExcelBuffer } from "@/lib/export/excel";
import { isAuthenticatedAdminServer } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Strict server-side admin check
    const isAuthorized = await isAuthenticatedAdminServer();
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin credentials required to export database records." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") || "all").toLowerCase();
    const eventId = searchParams.get("eventId") || undefined;

    let excelBuffer: Buffer;
    let filename: string;
    const dateStr = new Date().toISOString().split("T")[0];

    if (type === "all") {
      excelBuffer = await generateMasterExcelBuffer();
      filename = `COMMUNITY_VA_Master_Registrations_${dateStr}.xlsx`;
    } else {
      const result = await generateCategoryExcelBuffer(type, eventId);
      excelBuffer = result.buffer;
      filename = result.filename;
    }

    return new Response(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("[API /api/admin/export/excel GET Error]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to generate Excel sheet." },
      { status: 500 }
    );
  }
}
