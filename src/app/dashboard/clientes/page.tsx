import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatUSD } from "@/lib/calculations";
import { NewClientForm } from "./NewClientForm";
import { Users, Plus } from "lucide-react";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  
  const { data: clients } = await supabase
    .from("clients")
    .select("*, quotes(total)")
    .eq("owner_id", user.id)
    .order("full_name");

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 font-medium mt-1">{clients?.length ?? 0} registrados en tu base de datos</p>
        </div>
        <NewClientForm />
      </div>

      {/* Clients List */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
        {!clients || clients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-bold text-gray-900 mb-1">Aún no tienes clientes</p>
            <p className="text-sm text-gray-500">Agrega tu primer cliente para comenzar a cotizar.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {clients.map((client: any) => {
              const totalQuoted = (client.quotes ?? []).reduce((sum: number, q: any) => sum + Number(q.total || 0), 0);
              return (
                <div key={client.id} className="flex items-center justify-between p-4 md:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-lg">
                      {client.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-bold text-gray-900">{client.full_name}</p>
                      <p className="text-xs md:text-sm text-gray-500">{client.phone || "Sin teléfono"}</p>
                      {client.address && <p className="text-xs text-gray-400">{client.address}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm md:text-base font-bold text-gray-900">{formatUSD(totalQuoted)}</p>
                    <p className="text-xs text-gray-500">{(client.quotes ?? []).length} cotizaciones</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
