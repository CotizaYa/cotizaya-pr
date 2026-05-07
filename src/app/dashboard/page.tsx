import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHomeClient from './dashboard-home-client'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  const [
    { data: profile },
    { data: quotesThisMonth },
    { data: quotesLastMonth },
    { data: recentQuotes },
    { count: clientCount },
    { count: pendingCount },
    { data: productionEvents },
    { count: activeProductionCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('quotes').select('id, total, status').eq('owner_id', user.id).gte('created_at', startOfMonth),
    supabase.from('quotes').select('id, total, status').eq('owner_id', user.id).gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
    supabase.from('quotes').select('id, client_name, total, status, created_at, public_token').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
    supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'sent'),
    supabase.from('production_events').select('id, title, start_date, status, color').eq('owner_id', user.id).gte('start_date', now.toISOString().split('T')[0]).order('start_date').limit(5),
    supabase.from('production_events').select('*', { count: 'exact', head: true }).eq('owner_id', user.id).in('status', ['pending', 'in_progress']),
  ])

  const revenueThisMonth = quotesThisMonth?.filter(q => q.status === 'accepted').reduce((s, q) => s + (q.total || 0), 0) ?? 0
  const revenueLastMonth = quotesLastMonth?.filter(q => q.status === 'accepted').reduce((s, q) => s + (q.total || 0), 0) ?? 0
  const acceptanceRate = quotesThisMonth?.length
    ? Math.round((quotesThisMonth.filter(q => q.status === 'accepted').length / quotesThisMonth.length) * 100)
    : 0

  return (
    <DashboardHomeClient
      profile={profile}
      stats={{
        quotesThisMonth: quotesThisMonth?.length ?? 0,
        revenueThisMonth,
        revenueLastMonth,
        clientCount: clientCount ?? 0,
        pendingCount: pendingCount ?? 0,
        acceptanceRate,
        activeProductionCount: activeProductionCount ?? 0,
      }}
      recentQuotes={recentQuotes ?? []}
      productionEvents={productionEvents ?? []}
    />
  )
}
