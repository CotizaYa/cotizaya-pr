"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ScheduleInstallationModalProps {
  quoteId: string;
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleInstallationModal({
  quoteId,
  clientId,
  onClose,
  onSuccess,
}: ScheduleInstallationModalProps) {
  const supabase = createClient();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState("120");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSchedule = async () => {
    if (!date || !time) {
      alert("Por favor selecciona fecha y hora");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const scheduledAt = new Date(`${date}T${time}`).toISOString();

      const { error } = await supabase
        .from("installations")
        .insert({
          owner_id: user.id,
          quote_id: quoteId,
          client_id: clientId,
          scheduled_at: scheduledAt,
          duration_minutes: parseInt(duration),
          notes: notes || null,
          status: "scheduled",
        });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al programar instalación:", error);
      alert("Error al programar la instalación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900">Programar Instalación</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">¿Cuándo deseas instalar este trabajo?</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Fecha */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#f97316] outline-none font-medium"
            />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
              Hora
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#f97316] outline-none font-medium"
            />
          </div>

          {/* Duración */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
              Duración (minutos)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#f97316] outline-none font-medium"
            >
              <option value="60">1 hora</option>
              <option value="90">1.5 horas</option>
              <option value="120">2 horas</option>
              <option value="180">3 horas</option>
              <option value="240">4 horas</option>
              <option value="480">Día completo (8 horas)</option>
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Acceso por puerta lateral, cliente solicita mañana..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#f97316] outline-none font-medium text-sm resize-none h-24"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSchedule}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#f97316] to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 active:scale-95"
          >
            {isLoading ? "Programando..." : "Programar"}
          </button>
        </div>
      </div>
    </div>
  );
}
