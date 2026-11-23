import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { 
  getAllCommunityRegistrations, 
  getStudentRegistrations, 
  getVolunteerRegistrations, 
  getCollegeRegistrations, 
  getPartnerRegistrations 
} from "@/lib/store/registrations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "volunteers").toLowerCase();
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase();

  try {
    // 1. Try DB queries
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const adminClient = createAdminClient();
        const { data: profile } = await adminClient
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "ADMIN") {
          let query = adminClient.from(type).select("*, profiles:user_id(full_name, email, mobile)");

          if (status && status !== "ALL") {
            query = query.eq("status", status);
          }

          if (search) {
            if (type === "colleges") {
              query = query.ilike("institution_name", `%${search}%`);
            } else if (type === "partners") {
              query = query.ilike("organization_name", `%${search}%`);
            } else {
              query = query.ilike("college_name", `%${search}%`);
            }
          }

          query = query.order("created_at", { ascending: false });
          const { data, error } = await query;

          if (!error && data) {
            return NextResponse.json({ success: true, data });
          }
        }
      }
    } catch (dbErr) {
      console.warn("[Admin Applications] DB query fallback to persistent store:", dbErr);
    }

    // 2. Fallback to resilient persistent store
    let records: any[] = [];

    if (type === "students") {
      const list = getStudentRegistrations();
      records = list.map((s) => ({
        ...s,
        profiles: {
          full_name: s.full_name,
          email: s.email,
          mobile: s.mobile,
        },
      }));
    } else if (type === "volunteers") {
      const list = getVolunteerRegistrations();
      records = list.map((v) => ({
        ...v,
        profiles: {
          full_name: v.full_name,
          email: v.email,
          mobile: v.mobile,
        },
      }));
    } else if (type === "colleges") {
      records = getCollegeRegistrations();
    } else if (type === "partners") {
      records = getPartnerRegistrations();
    }

    // Filter by status
    if (status && status !== "ALL") {
      records = records.filter((r) => r.status === status);
    }

    // Filter by search
    if (search) {
      records = records.filter((r) => {
        const name = (r.full_name || r.contact_person || r.institution_name || r.organization_name || "").toLowerCase();
        const email = (r.email || r.profiles?.email || "").toLowerCase();
        const ref = (r.application_reference || "").toLowerCase();
        const org = (r.college_name || r.institution_name || r.organization_name || "").toLowerCase();
        return name.includes(search) || email.includes(search) || ref.includes(search) || org.includes(search);
      });
    }

    return NextResponse.json({ success: true, data: records });
  } catch (err: unknown) {
    console.error("[Admin Applications Fetch Error]", err);
    return NextResponse.json(
      { success: false, message: "Error fetching application records." },
      { status: 500 }
    );
  }
}
