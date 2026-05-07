"use client";
import { useState, useTransition } from "react";
import { createClientAction } from "./actions";
import { Plus, X, Loader2 } from "lucide-react";

export function NewClientForm() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    start(async () => {
      const res = await createClientAction({
        full_name: String(fd.get("full_name")),
        phone: String(fd.get("phone") || ""),
        email: String(fd.get("email") || ""),
        address: String(fd.get("address") || ""),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      form.reset();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
      >
        <Plus className="w-5 h-5" />
        Nuevo Cliente
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Nuevo Cliente</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
              Nombre Completo *
            </label>
            <input
              name="full_name"
              required
              placeholder="Juan Pérez"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
              Teléfono
            </label>
            <input
              name="phone"
              placeholder="787-555-0000"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="juan@email.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
              Ciudad / Dirección
            </label>
            <input
              name="address"
              placeholder="Arecibo, PR"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white font-bold py-2.5 rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cliente"
              )}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
