"use client";
import { useState, useTransition } from "react";
import { saveApiKey, removeApiKey } from "./actions";
import { Loader2, Eye, EyeOff, Trash2 } from "lucide-react";

export function ApiKeyForm({ currentKey }: { currentKey: string | null }) {
  const [key, setKey] = useState("");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  function handleSave() {
    if (!key.trim().startsWith("sk-ant-")) {
      setError("La key debe empezar con sk-ant-");
      return;
    }
    setError(null);
    start(async () => {
      const res = await saveApiKey(key.trim());
      if (!res.ok) { setError(res.error); return; }
      setSaved(true);
      setKey("");
      setTimeout(() => setSaved(false), 3000);
    });
  }

  function handleRemove() {
    if (!confirm("¿Eliminar la API Key? El Asistente IA quedará desactivado.")) return;
    start(async () => { await removeApiKey(); });
  }

  return (
    <div className="space-y-4">
      {currentKey && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <code className="text-xs text-green-600 font-mono">{currentKey}</code>
          <button
            type="button"
            onClick={handleRemove}
            disabled={pending}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={show ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all pr-10 font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!key.trim() || pending}
          className="flex items-center justify-center gap-2 bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando
            </>
          ) : saved ? (
            "Guardado"
          ) : (
            "Guardar"
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">API Key guardada. El Asistente IA ya está activo.</p>
        </div>
      )}
    </div>
  );
}
