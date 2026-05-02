import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("business_name").eq("id", user.id).single();
  return (
    <div style={{ display:"flex", height:"100vh", background:"#fafafa", overflow:"hidden" }}>
      <DashboardNav businessName={profile?.business_name ?? "Mi Empresa"} />
      <main style={{ flex:1, overflowY:"auto" }}>{children}</main>
    </div>
  );
}
