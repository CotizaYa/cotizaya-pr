const PLACEHOLDER_SUPABASE_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_SUPABASE_ANON_KEY = 'placeholder-key'

export function getSupabaseBrowserConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_SUPABASE_ANON_KEY

  return { url, anonKey }
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseBrowserConfig()

  return (
    Boolean(url) &&
    Boolean(anonKey) &&
    url !== PLACEHOLDER_SUPABASE_URL &&
    anonKey !== PLACEHOLDER_SUPABASE_ANON_KEY &&
    /^https:\/\/.+\.supabase\.co$/i.test(url)
  )
}

export function getSupabaseUnavailableMessage(context: 'login' | 'directory' | 'general' = 'general') {
  if (context === 'login') {
    return 'El inicio de sesión no está conectado a Supabase en este entorno de prueba. Verifica la URL de producción o las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  }

  if (context === 'directory') {
    return 'El directorio público no puede consultar Supabase en este entorno. Puedes volver al catálogo técnico; cuando producción tenga Supabase configurado, aquí aparecerán perfiles reales publicados.'
  }

  return 'Supabase no está configurado para este entorno.'
}
