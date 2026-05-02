import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CotizaYa PR — Cotizaciones profesionales",
  description: "Cotizaciones para contratistas de puertas, ventanas y screen en Puerto Rico.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PR">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
