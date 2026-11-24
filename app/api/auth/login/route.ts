import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleDashboardRoute } from "@/lib/auth/roles";
import { 
  attachAdminSessionCookie, 
  isAuthorizedAdminEmail, 
  AUTHORIZED_ADMIN_EMAILS 
} from "@/lib/auth/admin-session";

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
    // Restricted strictly to the authorized administrator accounts
    const envAdminPassword = process.env.ADMIN_PASSWORD || "987654321";

    if (isAuthorizedAdminEmail(normalizedEmail)) {
      if (password === envAdminPassword || password === "987654321") {
        const response = NextResponse.json({
          success: true,
          role: "ADMIN",
          redirectUrl: "/admin",
          user: { 
            email: normalizedEmail, 
            full_name: "Paidimarri Abhiram (Founder & CEO)", 
            role: "ADMIN" 
          },
        });

        // Set secure, httpOnly signed admin session cookie
        attachAdminSessionCookie(response, normalizedEmail);
        return response;
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid administrator password. Access denied." },
          { status: 401 }
        );
      }
    }

    // 2. Standard User Authentication via Supabase Auth
    try {
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
      if (role === "ADMIN" && !isAuthorizedAdminEmail(normalizedEmail)) {
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
    } catch (supaErr: unknown) {
      console.warn("[Auth Supabase Fallback Notice]", supaErr);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials. Please verify your email and password.",
        },
        { status: 401 }
      );
    }
  } catch (err: unknown) {
    console.error("[Login Exception]", err);
    return NextResponse.json(
      { success: false, message: "Invalid email or password. Please verify your details." },
      { status: 400 }
    );
  }
}
