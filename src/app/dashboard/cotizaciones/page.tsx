"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LABEL: Record<string, string> = {
  draft: "Pendiente",
  sent: "Pendiente",
  viewed: "Pendiente",
  accepted: "Confirmada",
  rejected: "Rechazada",
  expired: "Expirada",
};
const BG: Record<string, string> = {
  draft: "bg-gray-100",
  sent: "bg-blue-100",
  viewed: "bg-purple-100",
  accepted: "bg-green-100",
  rejected: "bg-red-100",
  expired: "bg-gray-100",
};
const TX: Record<string, string> = {
  draft: "text-gray-600",
  sent: "text-blue-700",
  viewed: "text-purple-700",
  accepted: "text-green-700",
  rejected: "text-red-700",
  expired: "text-gray-500",
};

function formatUSD(n: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(n ?? 0));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  total: number;
  created_at: string;
  clients: { full_name: string } | null;
}

export default function CotizacionesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  async function loadQuotes() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data } = await supabase
      .from("quotes")
      .select("id, quote_number, status, total, created_at, clients(full_name)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    setQuotes((data as any) ?? []);
    setIsLoading(false);
  }

  async function markAsSold(quoteId: string) {
    setUpdatingId(quoteId);
    await supabase
      .from("quotes")
      .update({ status: "accepted" })
      .eq("id", quoteId);
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: "accepted" } : q))
    );
    setUpdatingId(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400 text-sm font-medium">
          Cargando cotizaciones...
        </div>
      </div>
    );
  }

  const confirmadas = quotes.filter((q) => q.status === "accepted");
  const pendientes = quotes.filter((q) => q.status !== "accepted" && q.status !== "rejected");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Cotizaciones</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {quotes.length} total · {confirmadas.length} confirmadas
          </p>
        </div>
        <Link
          href="/dashboard/cotizaciones/nueva"
          className="bg-[#f97316] text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg> Nueva
        </Link>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
            Confirmadas
          </p>
          <p className="text-2xl font-black text-green-700 mt-1">
            {formatUSD(confirmadas.reduce((s, q) => s + Number(q.total), 0))}
          </p>
          <p className="text-xs text-green-600 mt-0.5">{confirmadas.length} cotizaciones</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
            Pendientes
          </p>
          <p className="text-2xl font-black text-orange-700 mt-1">
            {formatUSD(pendientes.reduce((s, q) => s + Number(q.total), 0))}
          </p>
          <p className="text-xs text-orange-600 mt-0.5">{pendientes.length} cotizaciones</p>
        </div>
      </div>

      {/* Lista de cotizaciones */}
      {quotes.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl py-16 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="text-sm text-slate-500">No hay cotizaciones aún</p>
          <Link
            href="/dashboard/cotizaciones/nueva"
            className="inline-block mt-3 text-sm font-bold text-[#f97316]"
          >
            Crear la primera →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Info */}
                <Link
                  href={`/dashboard/cotizaciones/${q.id}`}
                  className="flex-1 min-w-0"
                >
                  <p className="font-bold text-slate-900 text-[15px] truncate">
                    {q.clients?.full_name ?? "Sin cliente"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    #{q.quote_number} · {formatDate(q.created_at)}
                  </p>
                </Link>

                {/* Total */}
                <p className="font-black text-slate-900 text-lg tabular-nums whitespace-nowrap">
                  {formatUSD(q.total)}
                </p>
              </div>

              {/* Footer: Status + Acción */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold ${BG[q.status]} ${TX[q.status]}`}
                >
                  {LABEL[q.status]}
                </span>

                {q.status !== "accepted" && q.status !== "rejected" ? (
                  <button
                    onClick={() => markAsSold(q.id)}
                    disabled={updatingId === q.id}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    {updatingId === q.id ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                        Marcar como Confirmada
                      </>
                    )}
                  </button>
                ) : q.status === "accepted" ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#16a34a" /><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" /></svg>
                    Confirmada
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
