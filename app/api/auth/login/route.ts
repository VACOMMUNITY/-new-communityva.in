import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleDashboardRoute } from "@/lib/auth/roles";
import { attachAdminSessionCookie, ALLOWED_ADMIN_EMAIL } from "@/lib/auth/admin-session";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Direct Single-Member Admin Authentication Check
    // Restricted strictly to the one authorized founder/admin account
    const envAdminEmail = (process.env.ADMIN_EMAIL || ALLOWED_ADMIN_EMAIL).toLowerCase().trim();
    const envAdminPassword = process.env.ADMIN_PASSWORD || "Paidimarri@CVA2026";

    if (normalizedEmail === envAdminEmail) {
      if (password === envAdminPassword) {
        const response = NextResponse.json({
          success: true,
          role: "ADMIN",
          redirectUrl: "/admin",
          user: { 
            email: normalizedEmail, 
            full_name: "COMMUNITY.VA Administrator (Paidimarri Abhiram)", 
            role: "ADMIN" 
          },
        });

        // Set secure, httpOnly signed admin session cookie
        attachAdminSessionCookie(response, normalizedEmail);
        return response;
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid administrator credentials. Access denied." },
          { status: 401 }
        );
      }
    }

    // 2. Standard User Authentication via Supabase Auth
    const supabase = await createServerSupabaseClient();
    const adminClient = createAdminClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          success: false,
          message: authError?.message || "Invalid credentials. Please verify your email and password.",
        },
        { status: 401 }
      );
    }

    // 3. Fetch authoritative profile from server database
    const { data: profile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    const role = profile?.role || "STUDENT";

    // Prevent non-designated users from claiming ADMIN role
    if (role === "ADMIN" && normalizedEmail !== ALLOWED_ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. You are not permitted to access administrative controls." },
        { status: 403 }
      );
    }

    const redirectUrl = getRoleDashboardRoute(role);
    const response = NextResponse.json({
      success: true,
      role,
      redirectUrl,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: profile?.full_name || authData.user.user_metadata?.full_name,
        role,
      },
    });

    if (role === "ADMIN") {
      attachAdminSessionCookie(response, normalizedEmail);
    }

    return response;
  } catch (err: unknown) {
    console.error("[Login Exception]", err);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}
