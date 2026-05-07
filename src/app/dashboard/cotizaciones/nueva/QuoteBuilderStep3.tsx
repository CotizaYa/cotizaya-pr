"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calcQuoteTotals, formatUSD } from "@/lib/calculations";

interface QuoteItem {
  product_id: string;
  product_snapshot: {
    code: string | null;
    name: string;
    category: string;
    price_type: string;
    base_price: number;
  };
  width_inches: number;
  height_inches: number;
  quantity: number;
  color: string;
  notes: string;
  line_total: number;
}

interface Client {
  id: string;
  full_name: string;
  phone: string;
  address: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  puerta: "",
  ventana: "",
  screen: "",
  screen_ac: "",
  closet: "",
  garaje: "",
  miscelanea: "",
};

export function QuoteBuilderStep3() {
  const router = useRouter();
  const supabase = createClient();

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [depositRate, setDepositRate] = useState("50");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);

  // Cargar items de sessionStorage y clientes de BD
  useEffect(() => {
    const items = JSON.parse(sessionStorage.getItem("quoteItems") || "[]");
    setQuoteItems(items);

    // Cargar clientes del usuario
    const loadClients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("owner_id", user.id)
        .order("full_name");

      setClients(data || []);
    };

    loadClients();
  }, []);

  // Calcular totales usando calcQuoteTotals
  const subtotalMaterials = quoteItems.reduce((sum, item) => sum + item.line_total, 0);
  const { ivuAmount, total, depositAmount, balanceAmount } = calcQuoteTotals({
    items: quoteItems.map(item => ({
      ...item,
      category_snapshot: item.product_snapshot.category,
    })),
    ivuRate: 0.115,
    depositRate: parseFloat(depositRate) / 100,
  });

  const handleRemoveItem = (index: number) => {
    const updated = quoteItems.filter((_, i) => i !== index);
    setQuoteItems(updated);
    sessionStorage.setItem("quoteItems", JSON.stringify(updated));
  };

  const handleCreateClient = async () => {
    if (!newClientName || !newClientPhone) {
      alert("Por favor ingresa nombre y teléfono");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await supabase
        .from("clients")
        .insert({
          owner_id: user.id,
          full_name: newClientName,
          phone: newClientPhone,
          address: "",
        })
        .select()
        .single();

      if (error) throw error;

      setClients([...clients, data]);
      setSelectedClient(data.id);
      setNewClientName("");
      setNewClientPhone("");
      setShowNewClient(false);
    } catch (error) {
      console.error("Error al crear cliente:", error);
      alert("Error al crear cliente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuote = async () => {
    if (!selectedClient) {
      alert("Por favor selecciona o crea un cliente");
      return;
    }

    if (quoteItems.length === 0) {
      alert("La cotización debe tener al menos un producto");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const quoteNumber = `CZ-${Date.now().toString().slice(-8)}`;

      // Guardar cotización (SIN pasar public_token - lo genera la BD)
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          owner_id: user.id,
          client_id: selectedClient,
          quote_number: quoteNumber,
          status: "draft",
          subtotal_materials: subtotalMaterials,
          subtotal_labor: 0,
          ivu_rate: 0.115,
          ivu_amount: ivuAmount,
          total,
          deposit_rate: parseFloat(depositRate) / 100,
          deposit_amount: depositAmount,
          balance_amount: balanceAmount,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Guardar items con todos los campos snapshot requeridos
      const itemsToInsert = quoteItems.map((item, index) => ({
        quote_id: quote.id,
        product_id: item.product_id,
        position: index,
        name_snapshot: item.product_snapshot.name,
        category_snapshot: item.product_snapshot.category,
        price_type_snapshot: item.product_snapshot.price_type,
        unit_price_snapshot: item.product_snapshot.base_price,
        product_snapshot: item.product_snapshot,
        width_inches: item.width_inches,
        height_inches: item.height_inches,
        quantity: item.quantity,
        line_total: item.line_total,
        metadata: {
          color: item.color,
          notes: item.notes,
        },
      }));

      const { error: itemsError } = await supabase
        .from("quote_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Limpiar sesión y navegar a la vista pública usando quote.public_token
      sessionStorage.removeItem("quoteItems");
      router.push(`/share/${quote.public_token}`);
    } catch (error) {
      console.error("Error al guardar cotización:", error);
      alert("Error al guardar la cotización. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-sm font-black text-gray-900">
          Paso 3 de 3: <span className="text-[#F97316]">Resumen</span>
        </h1>
        <p className="text-[10px] text-gray-400 font-medium mt-1">
          Revisa y envía tu cotización
        </p>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Ítems de la Cotización */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">
            Productos ({quoteItems.length})
          </p>
          {quoteItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <p className="text-sm text-gray-400 font-medium">
                No hay productos. Vuelve al Paso 1.
              </p>
            </div>
          ) : (
            quoteItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-3"
              >
                <span className="text-2xl">
                  {CATEGORY_ICONS[item.product_snapshot.category] || ""}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-900">
                    {item.product_snapshot.name}
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium mt-1">
                    {item.quantity}x
                    {item.width_inches > 0
                      ? ` ${item.width_inches}" × ${item.height_inches}"`
                      : ""}
                    {item.color !== "blanco" && ` • ${item.color}`}
                  </p>
                  <p className="text-xs font-bold text-[#F97316] mt-2">
                    {formatUSD(item.line_total)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-500 hover:text-red-700 font-bold text-lg"
                >
                  
                </button>
              </div>
            ))
          )}
        </div>

        {/* Selector de Cliente */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">
            Cliente
          </p>
          {!showNewClient ? (
            <div className="space-y-2">
              <select
                value={selectedClient || ""}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#F97316] outline-none text-sm font-bold"
              >
                <option value="">Selecciona un cliente...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name} • {client.phone}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowNewClient(true)}
                className="w-full h-12 bg-gray-100 border-2 border-gray-200 rounded-2xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                + Crear Cliente Nuevo
              </button>
            </div>
          ) : (
            <div className="space-y-3 bg-white rounded-2xl p-4 border border-gray-100">
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full h-14 px-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#F97316] outline-none text-sm font-bold"
              />
              <input
                type="tel"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                placeholder="Teléfono"
                className="w-full h-14 px-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#F97316] outline-none text-sm font-bold"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateClient}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-[#F97316] text-white font-bold rounded-2xl disabled:bg-gray-300"
                >
                  {isLoading ? "Creando..." : "Crear"}
                </button>
                <button
                  onClick={() => setShowNewClient(false)}
                  className="flex-1 h-12 bg-gray-100 text-gray-700 font-bold rounded-2xl"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Depósito */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">
            Depósito (%)
          </p>
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((rate) => (
              <button
                key={rate}
                onClick={() => setDepositRate(rate.toString())}
                className={`flex-1 h-12 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                  depositRate === rate.toString()
                    ? "bg-[#F97316] text-white"
                    : "bg-white border-2 border-gray-200 text-gray-700"
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border-2 border-[#F97316] space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-600">Subtotal</span>
            <span className="text-sm font-bold text-gray-900">
              {formatUSD(subtotalMaterials)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-600">IVU (11.5%)</span>
            <span className="text-sm font-bold text-gray-900">
              {formatUSD(ivuAmount)}
            </span>
          </div>
          <div className="border-t border-orange-200 pt-3 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-600">Total</span>
            <span className="text-2xl font-black text-[#F97316]">
              {formatUSD(total)}
            </span>
          </div>
          <div className="border-t border-orange-200 pt-3 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-600">
              Depósito ({depositRate}%)
            </span>
            <span className="text-lg font-bold text-[#F97316]">
              {formatUSD(depositAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-600">Balance</span>
            <span className="text-lg font-bold text-gray-900">
              {formatUSD(balanceAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Botón de Acción Flotante */}
      <div className="fixed bottom-24 left-4 right-4">
        <button
          onClick={handleSaveQuote}
          disabled={isSaving || !selectedClient || quoteItems.length === 0}
          className={`w-full h-14 rounded-2xl font-bold text-white uppercase tracking-widest transition-all ${
            isSaving || !selectedClient || quoteItems.length === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#F97316] shadow-xl active:scale-95"
          }`}
        >
          {isSaving ? "Guardando..." : "Guardar y Compartir →"}
        </button>
      </div>
    </div>
  );
}
