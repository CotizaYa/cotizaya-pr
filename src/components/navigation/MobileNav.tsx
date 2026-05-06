"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "Inicio" },
  { href: "/dashboard/cotizaciones", icon: "📋", label: "Cotizaciones" },
  { href: "/dashboard/cotizaciones/nueva", icon: "➕", label: "Nueva", highlight: true },
  { href: "/dashboard/clientes", icon: "👥", label: "Clientes" },
  { href: "/dashboard/perfil", icon: "☰", label: "Más" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center z-40">
      {NAV_ITEMS.map(({ href, icon, label, highlight }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center transition-colors ${
              highlight
                ? "flex-1 h-24 bg-gradient-to-t from-[#F97316] to-orange-500 text-white shadow-lg"
                : `flex-1 h-16 ${isActive ? "text-[#F97316]" : "text-gray-500"}`
            }`}
          >
            <span className={`${highlight ? "text-2xl" : "text-2xl"}`}>{icon}</span>
            <span className={`font-bold uppercase tracking-wider ${highlight ? "text-[10px]" : "text-[9px]"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
