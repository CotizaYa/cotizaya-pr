import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("id", user.id)
    .single();

  return (
    <DashboardLayoutClient 
      businessName={profile?.business_name ?? "Mi Empresa"}
      sidebarNav={<DashboardNav businessName={profile?.business_name ?? "Mi Empresa"} />}
    >
      {children}
    </DashboardLayoutClient>
  );
}
// Force rebuild
