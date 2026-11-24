import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("cva_admin_session")?.value;
  const auth = verifyAdminToken(sessionToken);

  if (!auth.valid) {
    redirect("/login?redirect=/admin&error=unauthorized_admin");
  }

  return <>{children}</>;
}
