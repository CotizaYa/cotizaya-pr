"use client";
import { useState, ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { MobileNav } from "@/components/navigation/MobileNav";

interface DashboardLayoutClientProps {
  businessName: string;
  children: ReactNode;
}

export function DashboardLayoutClient({ 
  businessName, 
  children 
}: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      {/* DESKTOP: Sidebar fijo a la izquierda */}
      <aside className="hidden md:flex h-full border-r border-gray-100 flex-shrink-0">
        <DashboardNav businessName={businessName} />
      </aside>

      {/* MOBILE: Overlay del Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-40 transform transition-transform duration-300 md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DashboardNav businessName={businessName} />
      </div>

      {/* Contenedor Principal */}
      <main className="w-full flex flex-col min-w-0 overflow-hidden">
        {/* MOBILE: Header con hamburguesa */}
        <MobileHeader
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMenuOpen={isSidebarOpen}
        />

        {/* Contenido con padding para mobile */}
        <div className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-24 md:pb-0">
          {children}
        </div>

        {/* MOBILE: Bottom Navigation */}
        <MobileNav />
      </main>
    </div>
  );
}
