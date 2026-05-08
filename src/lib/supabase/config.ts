const PLACEHOLDER_SUPABASE_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_SUPABASE_ANON_KEY = 'placeholder-key'

export type SupabaseConfigStatus = {
  configured: boolean
  reason: 'ok' | 'missing_url' | 'missing_anon_key' | 'placeholder' | 'invalid_url' | 'invalid_project_url'
  url: string
  anonKey: string
  host: string | null
}

function normalizeEnvValue(value: string | undefined, fallback: string) {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : fallback
}

export function getSupabaseBrowserConfig() {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL, PLACEHOLDER_SUPABASE_URL)
  const anonKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, PLACEHOLDER_SUPABASE_ANON_KEY)

  return { url, anonKey }
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const { url, anonKey } = getSupabaseBrowserConfig()

  if (!url) {
    return { configured: false, reason: 'missing_url', url, anonKey, host: null }
  }

  if (!anonKey) {
    return { configured: false, reason: 'missing_anon_key', url, anonKey, host: null }
  }

  if (url === PLACEHOLDER_SUPABASE_URL || anonKey === PLACEHOLDER_SUPABASE_ANON_KEY) {
    return { configured: false, reason: 'placeholder', url, anonKey, host: null }
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { configured: false, reason: 'invalid_url', url, anonKey, host: null }
  }

  const isSupabaseProjectUrl = parsed.protocol === 'https:' && /\.supabase\.co$/i.test(parsed.hostname)

  if (!isSupabaseProjectUrl) {
    return { configured: false, reason: 'invalid_project_url', url, anonKey, host: parsed.hostname }
  }

  return { configured: true, reason: 'ok', url, anonKey, host: parsed.hostname }
}

export function getSafeSupabaseBrowserConfig() {
  const status = getSupabaseConfigStatus()

  if (status.configured) {
    return { url: status.url, anonKey: status.anonKey }
  }

  return { url: PLACEHOLDER_SUPABASE_URL, anonKey: PLACEHOLDER_SUPABASE_ANON_KEY }
}

export function isSupabaseConfigured() {
  return getSupabaseConfigStatus().configured
}

export function getSupabaseUnavailableMessage(context: 'login' | 'directory' | 'general' | 'register' = 'general') {
  const status = getSupabaseConfigStatus()

  const baseMessage = (() => {
    switch (status.reason) {
      case 'missing_url':
        return 'Falta NEXT_PUBLIC_SUPABASE_URL.'
      case 'missing_anon_key':
        return 'Falta NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      case 'placeholder':
        return 'Este entorno está usando credenciales temporeras de prueba.'
      case 'invalid_url':
        return 'NEXT_PUBLIC_SUPABASE_URL no tiene formato de URL válido.'
      case 'invalid_project_url':
        return 'NEXT_PUBLIC_SUPABASE_URL debe ser la URL real del proyecto Supabase, por ejemplo https://tu-proyecto.supabase.co.'
      default:
        return 'Supabase no está configurado para este entorno.'
    }
  })()

  if (context === 'login') {
    return `${baseMessage} Para iniciar sesión, producción en Vercel necesita NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY reales.`
  }

  if (context === 'register') {
    return `${baseMessage} El registro solo funcionará cuando producción esté conectado al proyecto real de Supabase.`
  }

  if (context === 'directory') {
    return `${baseMessage} El directorio público no puede consultar Supabase todavía. Cuando producción esté conectado, aquí aparecerán perfiles reales publicados.`
  }

  return baseMessage
}
