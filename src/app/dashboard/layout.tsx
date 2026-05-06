import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";

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
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      {/* 1. Sidebar: Solo visible en Desktop (md:flex) */}
      <aside className="hidden md:flex h-full border-r border-gray-100">
        <DashboardNav businessName={profile?.business_name ?? "Mi Empresa"} />
      </aside>

      {/* Contenedor Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Contenido con scroll y padding inferior para el BottomNav en mobile */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {children}
        </div>

        {/* 2. BottomNavigation: Solo visible en Mobile (md:hidden) */}
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </main>
    </div>
  );
}
