import { NextResponse } from 'next/server'
import { getSupabaseConfigStatus } from '@/lib/supabase/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const status = getSupabaseConfigStatus()

  if (!status.configured) {
    return NextResponse.json({
      configured: false,
      reason: status.reason,
      host: status.host,
      reachable: false,
    })
  }

  try {
    const response = await fetch(`${status.url}/auth/v1/settings`, {
      headers: {
        apikey: status.anonKey,
        Authorization: `Bearer ${status.anonKey}`,
      },
      cache: 'no-store',
    })

    return NextResponse.json({
      configured: true,
      reason: status.reason,
      host: status.host,
      reachable: response.ok,
      statusCode: response.status,
    })
  } catch (error: any) {
    return NextResponse.json({
      configured: true,
      reason: status.reason,
      host: status.host,
      reachable: false,
      error: error?.message || 'No se pudo conectar con Supabase',
    })
  }
}
