"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href:"/dashboard",                    label:"Inicio",           icon:"⊞"  },
  { href:"/dashboard/cotizaciones",       label:"Cotizaciones",     icon:"📄" },
  { href:"/dashboard/cotizaciones/nueva", label:"Nueva Cotización", icon:"✚"  },
  { href:"/dashboard/projects",           label:"Proyectos",        icon:"🏗️" },
  { href:"/dashboard/clientes",           label:"Clientes",         icon:"👥" },
  { href:"/dashboard/suplidores",         label:"Suplidores",       icon:"📞" },
  { href:"/dashboard/precios",            label:"Mis Precios",      icon:"🏷" },
  { href:"/dashboard/asistente",          label:"Asistente IA",     icon:"🤖" },
] as const;

export function DashboardNav({ businessName }: { businessName: string }) {
  const path = usePathname();
  return (
    <nav style={{ display:"flex", flexDirection:"column", height:"100%", width:"220px", borderRight:"1px solid #e5e5e5", background:"white", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"16px", borderBottom:"1px solid #f5f5f5" }}>
        <div style={{ width:"36px", height:"36px", background:"#f97316", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:"14px" }}>C</div>
        <div>
          <div style={{ fontSize:"14px", fontWeight:800, lineHeight:1.2 }}>
            <span style={{ color:"#f97316" }}>Cotiza</span>
            <span style={{ color:"#171717" }}>Ya</span>
            <span style={{ color:"#171717", fontSize:"11px", fontWeight:900 }}>PR</span>
          </div>
          <div style={{ fontSize:"10px", color:"#a3a3a3", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"130px" }}>{businessName}</div>
        </div>
      </div>
      <ul style={{ flex:1, padding:"12px 8px", margin:0, listStyle:"none", display:"flex", flexDirection:"column", gap:"2px" }}>
        {NAV.map(({ href, label, icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <li key={href}>
              <Link href={href} style={{ display:"flex", alignItems:"center", gap:"10px", borderRadius:"8px", padding:"8px 10px", fontSize:"13px", fontWeight:500, textDecoration:"none", background:active?"#fff7ed":"transparent", color:active?"#ea580c":"#525252", transition:"background 0.15s" }}>
                <span style={{ fontSize:"15px" }}>{icon}</span>{label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div style={{ padding:"12px 16px", borderTop:"1px solid #f5f5f5" }}>
        <Link href="/dashboard/perfil" style={{ fontSize:"12px", color:"#a3a3a3", textDecoration:"none" }}>⚙️ Configuración</Link>
      </div>
    </nav>
  );
}
