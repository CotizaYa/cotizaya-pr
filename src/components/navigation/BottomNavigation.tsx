"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "Inicio" },
  { href: "/dashboard/cotizaciones/nueva", icon: "📄", label: "Cotizar" },
  { href: "/dashboard/clientes", icon: "👥", label: "Clientes" },
  { href: "/dashboard/ajustes", icon: "⚙️", label: "Ajustes" },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-2xl z-50">
      <div className="flex justify-around items-center h-20">
        {NAV_ITEMS.map(({ href, icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive
                  ? "text-[#F97316] bg-orange-50/50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
